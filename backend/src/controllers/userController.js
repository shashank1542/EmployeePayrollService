
const User = require('../models/User');
const csv = require('csvtojson');
const moment = require('moment');
const XLSX = require('xlsx');
const fs = require('fs');

const importUser = async (req, res) => {
  try {
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

      let DailySalary = userData[x].DailySalary;
      if (isNaN(workhour)) {
        // console.error(`Invalid data for calculation at index ${x}`);
      } else {
        DailySalary = workhour * 100; // Assuming hourly rate is 100
      }

      userData[x] = {
        EmployeeID: userData[x]['Employee ID'],
        EmployeeName: userData[x]['Employee Name'],
        Date: userData[x].Date,
        Day: userData[x].Day,
        PunchInTime: userData[x]['Punch In Time'],
        PunchOutTime: userData[x]['Punch Out Time'],
        Status: userData[x].Status,
        WorkingHrs: userData[x]['Working Hrs.'],
        BreakHrs: userData[x]['Break Hrs.'],
        HourlyRate: userData[x]['Hourly Rate'],
        penaltyRate: userData[x]['Penalty Rate'],
        DailySalary: DailySalary,
      };
    }

    await User.insertMany(userData);
    fs.unlinkSync(filePath); // Remove file after processing
    res.status(200).json({ success: true, msg: 'File imported successfully' });
  } catch (error) {
    res.status(400).json({ success: false, msg: error.message });
  }
};

module.exports = {
  importUser,
};
