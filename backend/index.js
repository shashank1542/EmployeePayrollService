require("./src/configs/database");
const express = require("express");
const app = express();

var userRoute= require('./src/routes/routes')

app.use('/',userRoute);

app.listen(3000,function(){
    console.log('app is running');
})