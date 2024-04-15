const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const Restaurant = require("../models/restaurantSche");
const Category = require("../models/categorySche");
const slugify = require("slugify"); // Import slugify library
const isAdminMiddleware = require("../middleware/isAdminMiddleware");

// Get all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select("-password"); // Exclude password field
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get restaurant by name
router.get("/:name", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select(
      "-password"
    ); // Exclude password field
    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Create a new restaurant
router.post(
  "/",
  [
    // Validation middleware for request body
    check("name", "name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({
      min: 6,
    }),
    check("location", "Restaurant location is required").not().isEmpty(),
    // You can add more validation rules here as needed
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, location, menu } = req.body;
    const username = slugify(name, { lower: true });
    console.log(username); // Generate slug

    try {
      // Check if username or email already exists
      let existingUser = await Restaurant.findOne({
        $or: [{ username }, { email }],
      });
      console.log(username, "ss");
      if (existingUser) {
        return res
          .status(400)
          .json({ msg: "username or email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new restaurant instance
      const restaurant = new Restaurant({
        name,
        username,
        email,
        password: hashedPassword,
        location,
        menu,
      });

      await restaurant.save();

      // Generate JWT token
      const payload = {
        restaurant: {
          id: restaurant.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "30d" }, // Token expires in 30 days, adjust as needed
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// Add a new menu item to a restaurant's menu
router.post("/:username/menu", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    const restaurant = await Restaurant.findOne({
      username: req.params.username,
    }).select("-password");

    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }

    // Check if the current user is the owner of the restaurant
    if (restaurant._id.toString() !== req.user.id) {
      return res.status(401).json({
        msg: "You are not authorized to add a new menu item to this restaurant",
      });
    }

    // Generate slug for the category
    const categorySlug = slugify(category, { lower: true });

    // Check if the category exists by its slug
    let existingCategory = await Category.findOne({
      slug: categorySlug,
    }).select("-password");

    // If category doesn't exist, create a new one
    if (!existingCategory) {
      existingCategory = new Category({
        name: category, // Set the category name
        slug: categorySlug, // Set the slug
        // Add other category fields here as needed
      });
      await existingCategory.save();
    }

    // Create new menu item
    const newMenuItem = {
      name,
      description,
      price,
      category: existingCategory._id, // Save the category ID
      image,
    };

    restaurant.menu.push(newMenuItem);
    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Update an existing menu item in a restaurant's menu
router.put(
  "/:restaurantId/menu/:menuItemId",
  authMiddleware,
  async (req, res) => {
    try {
      const { name, description, price, category, image } = req.body;

      // Check if the provided restaurant ID is valid
      const restaurant = await Restaurant.findById(
        req.params.restaurantId
      ).select("-password");
      if (!restaurant) {
        return res.status(404).json({ msg: "Restaurant not found" });
      }

      // Check if the current user is the owner of the restaurant
      if (restaurant._id.toString() !== req.user.id) {
        return res.status(401).json({
          msg: "You are not authorized to update this menu item",
        });
      }

      // Find the menu item by its ID in the restaurant's menu array
      const menuItem = restaurant.menu.id(req.params.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ msg: "Menu item not found" });
      }

      // Update the menu item properties
      menuItem.name = name;
      menuItem.description = description;
      menuItem.price = price;

      // Generate slug for the category
      const categorySlug = slugify(category, { lower: true });

      // Check if the category exists by its slug
      let existingCategory = await Category.findOne({
        slug: categorySlug,
      }).select("-password");

      // If category doesn't exist, create a new one
      if (!existingCategory) {
        existingCategory = new Category({
          name: category, // Set the category name
          slug: categorySlug, // Set the slug
          // Add other category fields here as needed
        });
        await existingCategory.save();
      }

      // Assign the category to the menu item
      menuItem.category = existingCategory._id;

      menuItem.image = image;

      await restaurant.save();
      res.json(restaurant);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Delete a restaurant
router.delete("/:id", authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select(
      "-password"
    );
    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ msg: "Restaurant deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
