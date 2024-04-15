const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const Restaurant = require("../models/restaurantSche");
const slugify = require("slugify"); // Import slugify library

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

    try {
      // Check if username or email already exists
      let existingUser = await Restaurant.findOne({
        $or: [{ username }, { email }],
      });
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

// Route for restaurant login
router.post(
  "/login",
  [
    // Validation middleware for request body
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the restaurant exists by email
      let restaurant = await Restaurant.findOne({ email });

      // If restaurant doesn't exist
      if (!restaurant) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Check if the provided password matches the hashed password in the database
      const isMatch = await bcrypt.compare(password, restaurant.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

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
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
