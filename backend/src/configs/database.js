const mongoose = require("mongoose");

const uri = "mongodb+srv://Justblrr:Justblrr@cluster0.eilxb6p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// "mongodb+srv://shashankchauhan3339:shashank154@cluster0.sxssjxq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);

const database = mongoose.connection;
database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});