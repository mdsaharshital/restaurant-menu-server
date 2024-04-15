const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const isAdminMiddleware = require("../middleware/isAdminMiddleware");
const Category = require("../models/categorySche");
const slugify = require("slugify"); // Import slugify library

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Create a new category
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true }); // Generate slug

    // Check if category with the same slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ msg: "Category already exists" });
    }

    // If category does not exist, create a new one
    const category = new Category({
      name,
      slug,
    });
    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update a category
router.put("/:id", authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true }); // Generate slug
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: { name, slug } }, // Update slug along with name
      { new: true }
    );
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a category
router.delete("/:id", authMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: "Category deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
