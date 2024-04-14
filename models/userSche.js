const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user", // Set the default role to "user"
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive", // Set the default status to "active"
  },
  // Add other user fields here
});

module.exports = mongoose.model("User", UserSchema);
