
var User= require('../models/User');
var csv = require('csvtojson');
const moment = require('moment');



const importUser = async (req,res)=>{
    try{
        var userData = [];
        csv()
        .fromFile(req.file.path)
        .then(async(response)=>{
            console.log(response[0])
            
            for(var x=0;x<response.length-1;x++){
                
                const timeString = response[x]['Working Hrs.'];
                const timeObject = moment(timeString, 'HH:mm:ss');
                const totaltime = (timeObject.hours() + timeObject.minutes() / 60);
                const workhour = Math.round(totaltime*100)/100;
                
                // const timeString1 = response[x]['Break Hrs.'];
                // const timeObject1 = moment(timeString1, 'HH:mm:ss');
                // const breakhour = timeObject1.hours() + timeObject1.minutes() / 60;
                const HourlyRate = 100;
                // const penaltyRate = response[x]['Penalty Rate'];
                let DailySalary= response[x].DailySalary;

                if (isNaN(workhour)) {
                    console.error(`Invalid data for calculation at index ${x}`);
                    // Skip this entry or handle the error as appropriate
                }else{
                DailySalary = (workhour * HourlyRate)
                }
                userData.push({
                    EmployeeID: response[x]['Employee ID'],
                    EmployeeName: response[x]['Employee Name'],
                    Date: response[x].Date,
                    Day: response[x].Day,
                    PunchInTime: response[x]['Punch In Time'],
                    PunchOutTime: response[x]['Punch Out Time'],
                    Status: response[x].Status,
                    WorkingHrs: response[x]['Working Hrs.'],
                    BreakHrs: response[x]['Break Hrs.'],
                    HourlyRate: response[x]['Hourly Rate'],
                    penaltyRate: response[x]['Penalty Rate'],
                    DailySalary: DailySalary,
                });
                

            }
                
            await User.insertMany(userData);
        });
        res.send({status:200,success:true,msg:"csv imported"});
    }catch(error){
        res.send({status:400,success:false,msg:error.message});
    }
}

module.exports = {
    importUser
}