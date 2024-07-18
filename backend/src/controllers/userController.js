const User = require('../models/User');
const csv = require('csvtojson');
const moment = require('moment');
const XLSX = require('xlsx');
const fs = require('fs');

let flag =0,month_days=0;

function extractMonthAndDays(dateString) {
    // Split the date string by the dash character
    const dateParts = dateString.split('-');

    // Ensure the date string is in the expected format
    if (dateParts.length !== 3) {
        throw new Error("Date string is not in the expected format 'DD-MM-YYYY'");
    }

    // Extract the month part and convert it to an integer
    let month = parseInt(dateParts[1], 10);
    let year = parseInt(dateParts[2], 10);

    // Function to get the number of days in a month
    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    // Get the number of days in the extracted month
    const days = daysInMonth(month, year);

    return days;
}

function extractHours(timeString) {
    // Regular expression to capture hours and minutes
    const timeRegex = /(?:(\d+)h)?\s*(?:(\d+)m)?/;
    
    // Match the string with the regex
    const match = timeString.match(timeRegex);
    
    if (match) {
        const hours = match[1] ? parseInt(match[1], 10) : 0;
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        
        // Convert minutes to hours and add to the hours
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
            // const existingUser = await User.findOne({ EmployeeID: userData[x]['Employee ID'] });
            userData = XLSX.utils.sheet_to_json(sheet);
        } else {
            return res.status(400).json({ message: 'Unsupported file format' });
        }

        for (let x = 0; x < userData.length; x++) {
            const timeString = userData[x]['Total Working Hours']||userData[x]['Working Hrs.'];
            const totalbreakhr = userData[x]['Break Hrs.'] || userData[x]['Total Break Hours'];  
            // const timeObject = moment(timeString, 'HH:mm:ss');
            // const totaltime = timeObject.hours() + timeObject.minutes() / 60;
            // const workhour = Math.round(totaltime * 100) / 100;
            let workhour=NaN;
            if(timeString){
            const totaltime = extractHours(timeString);
             workhour = Math.round(totaltime * 100) / 100;
            }
            if(workhour>10){
                workhour=10;
            }
            console.log(workhour);

            console.log(flag)

            const existingUser = await User.findOne({ EmployeeID: userData[x]['Employee ID'] || userData[x]['Code'] ||userData[x]['Emp Id']});
            
            

            let GrossSalary;
            if(existingUser){
                if(flag == 0){
                    const Daily_date= userData[x]['Date'] ;
                    month_days = extractMonthAndDays(Daily_date);
                    console.log(month_days);
                    flag = 1;
                }
                GrossSalary = existingUser.GrossSalary;
            }else{
                GrossSalary = userData[x].GrossSalary;
            }
            let Salary=0;

            if (isNaN(workhour)) {

                Salary = 0; // Handle invalid data appropriately
            } else {
                Salary = workhour * (GrossSalary / (month_days * 10)); // Assuming 30 days and 10 hour shift
                Salary = Math.round(Salary * 100) / 100
            }

            // Check if EmployeeID already exists in the database
            if (existingUser) {
                // Update the existing user's salary
                existingUser.WorkingHrs = timeString
                existingUser.BreakHrs = totalbreakhr
                existingUser.PunchInTime = userData[x]['First Punch']
                existingUser.PunchOutTime = userData[x]['Last Punch']
                existingUser.Salary += Salary;
                existingUser.DayCount = (existingUser.DayCount || 0) + 1;
                await existingUser.save();
            } else {
                // Create a new user object
                const newUser = {
                    EmployeeID: userData[x]['Employee ID']|| userData[x]['Code'] ||userData[x]['Emp Id'] ,
                    EmployeeName: userData[x]['Employee Name'] || userData[x]['Name'],
                    Date: userData[x].Date,
                    Day: userData[x].Day,
                    PunchInTime: userData[x]['Punch In Time'] ,
                    PunchOutTime: userData[x]['Punch Out Time'],
                    Status: userData[x].Status,
                    WorkingHrs: userData[x]['Working Hrs.'] || userData[x]['Total Working Hours'],
                    // WorkingHrs: workhour,
                    BreakHrs: userData[x]['Break Hrs.'] || userData[x]['Total Break Hours'],
                    MobileNo : userData[x]['Mobile No'],
                    GrossSalary: userData[x]['Salary'] || userData[x]['GrossSalary'],
                    Salary: Salary,
                    DayCount: 0,
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
