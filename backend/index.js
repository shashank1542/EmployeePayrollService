require("./src/configs/database");
const express = require("express");
const app = express();
const port = process.env.PORT || 3003;

var userRoute= require('./src/routes/routes')

app.use('/',userRoute);

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})