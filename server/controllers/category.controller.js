import { Category } from "../models/category.model.js";

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });
    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ message: "Category already exists" });
    const category = await Category.create({ name: name.trim() });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
