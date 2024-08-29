import Category from '../models/categoryModel.js';

//create a category
export const createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    const category = new Category({ name, subcategories });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get category by id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategories } = req.body;
    const category = await Category.findByIdAndUpdate(id, { name, subcategories }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
