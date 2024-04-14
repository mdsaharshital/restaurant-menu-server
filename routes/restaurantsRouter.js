const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const isAdminMiddleware = require("../middleware/isAdminMiddleware");
const Restaurant = require("../models/restaurantSche");

// Get all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get restaurant by ID
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
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
router.post("/", authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const { name, locations, menu } = req.body;
    const restaurant = new Restaurant({
      name,
      locations,
      menu,
    });
    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update a restaurant
router.put("/:id", authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const { name, locations, menu } = req.body;
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: { name, locations, menu } },
      { new: true }
    );
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a restaurant
router.delete("/:id", authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
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
