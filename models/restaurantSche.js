const mongoose = require("mongoose");
const Category = require("./categorySche"); // Import the Category model

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  // Add other menu item fields here
});

const RestaurantSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
  },
  locations: {
    type: String,
    required: true,
  },
  menu: [MenuItemSchema],
  // Each restaurant has a menu containing multiple items

  // Add other restaurant fields here
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
