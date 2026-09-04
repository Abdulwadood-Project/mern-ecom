const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.active !== 'false') {
    filter.isActive = true;
  }

  const categories = await Category.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories },
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Category retrieved successfully',
    data: { category },
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category },
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  if (req.body.name !== undefined) category.name = req.body.name;
  if (req.body.description !== undefined) category.description = req.body.description;
  if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new AppError('Cannot delete category with existing products.', 400);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: null,
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
