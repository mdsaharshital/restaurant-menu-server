const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
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
    enum: ["moderator", "admin"],
    default: "admin", // Set the default role to "admin"
  },
  // Add other user fields here
});

module.exports = mongoose.model("Admin", AdminSchema);
