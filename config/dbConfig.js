const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/User_New_App');

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("MongoDB is Connected");
});

connection.on("error" ,(error)=>{
    console.log(error ," there is an error")
});


module.exports = mongoose;