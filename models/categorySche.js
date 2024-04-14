const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  // Add other category fields here
});

module.exports = mongoose.model("Category", CategorySchema);
