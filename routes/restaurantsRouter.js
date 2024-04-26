const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Restaurant = require("../models/restaurantSche");
const Category = require("../models/categorySche");
const { check, validationResult } = require("express-validator");
const slugify = require("slugify"); // Import slugify library
const isAdminMiddleware = require("../middleware/isAdminMiddleware");
const uploadImage = require("../middleware/uploadImage");

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
router.get("/:username", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      username: req.params.username,
    }).select("-password"); // Exclude password field
    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET unique categories for a restaurant
router.get("/:username/categories", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      username: req.params.username,
    }).select("-password");

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    const uniqueCategories = await Restaurant.aggregate([
      { $match: { username: req.params.username } }, // Match by username
      { $unwind: "$menu" },
      { $group: { _id: "$menu.category" } },
      { $project: { _id: 0, category: "$_id" } },
    ]);

    const categories = uniqueCategories.map((category) => category.category);
    res.json(categories);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch unique categories" });
  }
});

router.post("/:username/menu", authMiddleware, async (req, res) => {
  try {
    const { name, description, sizes, image, category } = req.body;

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

    // Upload image to Cloudinary and get the URL
    const imageUrl = await uploadImage(image);

    // Create new menu item with image URL
    const newMenuItem = {
      name,
      description,
      sizes,
      category: existingCategory.slug, // Save the category ID
      image: imageUrl, // Save the image URL
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
      const { name, description, sizes, category, image } = req.body;

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
      menuItem.sizes = sizes;

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
      menuItem.category = existingCategory.slug;

      menuItem.image = image;

      await restaurant.save();
      res.json(restaurant);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Update restaurant status by admin
router.put(
  "/status/:restaurantId",
  [
    // Validation middleware for request body
    check("status", "Status is required").isIn(["active", "inactive"]),
  ],
  authMiddleware,
  isAdminMiddleware,
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    try {
      // Find the restaurant by ID
      let restaurant = await Restaurant.findById(
        req.params.restaurantId
      ).select("-password");
      if (!restaurant) {
        return res.status(404).json({ msg: "Restaurant not found" });
      }

      // Update the restaurant status
      restaurant.status = status;

      // Save the updated restaurant
      await restaurant.save();

      res.json({ msg: "Restaurant status updated successfully" });
    } catch (err) {
      console.error(err);
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
