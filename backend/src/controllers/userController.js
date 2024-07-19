const User = require('../models/User');
const csv = require('csvtojson');
const moment = require('moment');
const XLSX = require('xlsx');
const fs = require('fs');

let flag = 0, month_days = 0;

function extractMonthAndDays(dateString) {
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) {
        throw new Error("Date string is not in the expected format 'DD-MM-YYYY'");
    }

    let month = parseInt(dateParts[1], 10);
    let year = parseInt(dateParts[2], 10);

    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    const days = daysInMonth(month, year);
    return days;
}

function extractHours(timeString) {
    const timeRegex = /(?:(\d+)h)?\s*(?:(\d+)m)?/;
    const match = timeString.match(timeRegex);

    if (match) {
        const hours = match[1] ? parseInt(match[1], 10) : 0;
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        const totalHours = hours + (minutes / 60);
        return totalHours;
    } else {
        throw new Error("Invalid time format");
    }
}

const importUser = async (req, res) => {
    try {
        console.log("Starting import...");

        let userData = [];
        const filePath = req.file.path;
        const fileExtension = filePath.split('.').pop();

        if (fileExtension === 'csv') {
            userData = await csv().fromFile(filePath);
        } else if (fileExtension === 'xlsx') {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            userData = XLSX.utils.sheet_to_json(sheet);
        } else {
            return res.status(400).json({ message: 'Unsupported file format' });
        }

        for (let x = 0; x < userData.length; x++) {
            const timeString = userData[x]['Total Working Hours'] || userData[x]['Working Hrs.'];
            const totalbreakhr = userData[x]['Break Hrs.'] || userData[x]['Total Break Hours'];
            let workhour = NaN;

            if (timeString) {
                const totaltime = extractHours(timeString);
                workhour = Math.round(totaltime * 100) / 100;
            }

            if (workhour > 10) {
                workhour = 10;
            }

            console.log(workhour);
            console.log(flag);

            const existingUser = await User.findOne({ EmployeeID: userData[x]['Employee ID'] || userData[x]['Code'] || userData[x]['Emp Id'] });

            let GrossSalary;
            if (existingUser) {
                if (flag === 0) {
                    const Daily_date = userData[x]['Date'];
                    month_days = extractMonthAndDays(Daily_date);
                    console.log(month_days);
                    flag = 1;
                }
                GrossSalary = existingUser.GrossSalary;
            } else {
                GrossSalary = userData[x].GrossSalary;
            }

            let Salary = 0;
            if (isNaN(workhour)) {
                Salary = 0;
            } else {
                Salary = workhour * (GrossSalary / (month_days * 10));
                Salary = Math.round(Salary * 100) / 100;
            }

            if (existingUser) {
                existingUser.WorkingHrs = timeString;
                existingUser.BreakHrs = totalbreakhr;
                existingUser.PunchInTime = userData[x]['First Punch'];
                existingUser.PunchOutTime = userData[x]['Last Punch'];
                existingUser.Salary += Salary;
                existingUser.DayCount = (existingUser.DayCount || 0) + 1;
                await existingUser.save();
            } else {
                const newUser = {
                    EmployeeID: userData[x]['Employee ID'] || userData[x]['Code'] || userData[x]['Emp Id'],
                    EmployeeName: userData[x]['Employee Name'] || userData[x]['Name'],
                    Date: userData[x].Date,
                    Day: userData[x].Day,
                    PunchInTime: userData[x]['Punch In Time'],
                    PunchOutTime: userData[x]['Punch Out Time'],
                    Status: userData[x].Status,
                    WorkingHrs: userData[x]['Working Hrs.'] || userData[x]['Total Working Hours'],
                    BreakHrs: userData[x]['Break Hrs.'] || userData[x]['Total Break Hours'],
                    MobileNo: userData[x]['Mobile No'],
                    GrossSalary: userData[x]['Salary'] || userData[x]['GrossSalary'],
                    Salary: Salary,
                    DayCount: 0,
                };

                await User.create(newUser);
            }
        }

        fs.unlinkSync(filePath);
        res.status(200).json({ success: true, msg: 'File imported successfully' });
    } catch (error) {
        console.error("Error during import:", error);
        res.status(400).json({ success: false, msg: error.message });
    }
};

const downloadData = async (req, res) => {
    try {
        const users = await User.find({});
        console.log("hello")
        const csvData = users.map(user => ({
            EmployeeID: user.EmployeeID,
            EmployeeName: user.EmployeeName,
            GrossSalary: user.GrossSalary,
            Salary: user.Salary
        }));

        const csvContent = [
            ['Employee ID', 'Employee Name', 'Gross Salary', 'Salary'],
            ...csvData.map(row => Object.values(row))
        ].map(e => e.join(',')).join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('users.csv');
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    importUser,
    downloadData
};
