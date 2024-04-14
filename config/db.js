const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`connected to DB`.bgMagenta);
  } catch (error) {
    console.log(`error in mongodb ${error}`.bgRed.white);
  }
};

module.exports = connectDB;
