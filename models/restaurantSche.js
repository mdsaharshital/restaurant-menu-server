const mongoose = require("mongoose");
const Category = require("./categorySche"); // Import the Category model

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  sizes: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    ref: "Category",
    required: true,
  },
  image: String,
  // Add other menu item fields here
});

const RestaurantSchema = new mongoose.Schema({
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
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive", // Set the default status to "active"
  },
  username: {
    type: String,
    unique: true,
    required: true, // Ensure username is required
  },
  menu: [MenuItemSchema],
  // Each restaurant has a menu containing multiple items

  // Add other restaurant fields here
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
