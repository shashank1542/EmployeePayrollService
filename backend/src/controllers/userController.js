const User = require('../models/User');
const csv = require('csvtojson');
const moment = require('moment');
const XLSX = require('xlsx');
const fs = require('fs');

const importUser = async (req, res) => {
    try {
        console.log("Starting import...");

        let userData = [];
        const filePath = req.file.path;

        // Check file extension
        const fileExtension = filePath.split('.').pop();
        if (fileExtension === 'csv') {
            // Handle CSV files
            userData = await csv().fromFile(filePath);
        } else if (fileExtension === 'xlsx') {
            // Handle XLSX files
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            userData = XLSX.utils.sheet_to_json(sheet);
        } else {
            return res.status(400).json({ message: 'Unsupported file format' });
        }

        for (let x = 0; x < userData.length; x++) {
            const timeString = userData[x]['Working Hrs.'];
            const timeObject = moment(timeString, 'HH:mm:ss');
            const totaltime = timeObject.hours() + timeObject.minutes() / 60;
            const workhour = Math.round(totaltime * 100) / 100;

            let GrossSalary = userData[x].GrossSalary;
            let Salary;
            if (isNaN(workhour)) {
                console.error(`Invalid data for calculation at index ${x}`);
                Salary = 0; // Handle invalid data appropriately
            } else {
                Salary = workhour * (GrossSalary / (30 * 10)); // Assuming 30 days and 10 hour shift
            }

            // Check if EmployeeID already exists in the database
            const existingUser = await User.findOne({ EmployeeID: userData[x]['Employee ID'] });
            if (existingUser) {
                // Update the existing user's salary
                existingUser.Salary += Salary;
                existingUser.DayCount = (existingUser.DayCount || 0) + 1;
                await existingUser.save();
            } else {
                // Create a new user object
                const newUser = {
                    EmployeeID: userData[x]['Employee ID'],
                    EmployeeName: userData[x]['Employee Name'],
                    Date: userData[x].Date,
                    Day: userData[x].Day,
                    PunchInTime: userData[x]['Punch In Time'],
                    PunchOutTime: userData[x]['Punch Out Time'],
                    Status: userData[x].Status,
                    WorkingHrs: userData[x]['Working Hrs.'],
                    BreakHrs: userData[x]['Break Hrs.'],
                    GrossSalary: GrossSalary,
                    Salary: Salary,
                    DayCount: 1,
                };

                // Insert the new user into the database
                await User.create(newUser);
            }
        }

        fs.unlinkSync(filePath); // Remove file after processing
        res.status(200).json({ success: true, msg: 'File imported successfully' });
    } catch (error) {
        console.error("Error during import:", error);
        res.status(400).json({ success: false, msg: error.message });
    }
};

module.exports = {
    importUser,
};
