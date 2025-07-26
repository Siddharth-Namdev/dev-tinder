const mongoose = require("mongoose");

const connectDB = async () => {
  //await mongoose.connect('mongodb://localhost:27017/devtinder');
  await mongoose.connect(process.env.DB_CONNECTION_SECRET);
};

module.exports = connectDB;
