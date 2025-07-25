const mongoose = require("mongoose");

const connectDB = async () => {
  //await mongoose.connect('mongodb://localhost:27017/devtinder');
  await mongoose.connect(
    "mongodb+srv://namsiddharth19:Hc68qTnO6JIJ4DSZ@cluster0.phsww.mongodb.net/"
  );
};

module.exports = connectDB;
