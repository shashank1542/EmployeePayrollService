require("./src/configs/database");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
var userRoute= require('./src/routes/routes')
app.use(cors());
app.use('/',userRoute);


const PORT = process.env.PORT || 3003;
app.use(bodyParser.json());
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});