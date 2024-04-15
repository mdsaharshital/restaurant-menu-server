const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  // Add other category fields here
});

module.exports = mongoose.model("Category", CategorySchema);
