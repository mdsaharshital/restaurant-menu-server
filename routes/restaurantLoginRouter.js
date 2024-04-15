const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const Restaurant = require("../models/restaurantSche");

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
