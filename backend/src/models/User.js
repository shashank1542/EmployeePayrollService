const { Double } = require('mongodb');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    EmployeeID:{
        type:String
    },	
    EmployeeName:{
        type:String
    },
    Date:{
        type:String
    },
    Day:{
        type:String
    },
    PunchInTime:{
        type:String
    },
    PunchOutTime:{
        type:String
    },
    Status:{
        type:String
    },
	WorkingHrs:{
        type:String
    },	
    BreakHrs:{
        type:String
    },
    // HourlyRate:{
    //     type:Number,
    //     default:100,
    // },
    // penaltyRate:{
    //     type:Number,
    //     default:10,
    // },
    Salary:{
        type: Number,
        default:0,
    },
    GrossSalary:{
        type:Number,
        default:0,
    },
    DayCount:{
        type:Number,
        default:0,
    },
    MobileNo:{
        type:String,
    }
});



module.exports = mongoose.model('User', userSchema);