const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { categoryRules } = require('../middleware/validators');

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, authorize('admin'), categoryRules, validate, createCategory);
router.put('/:id', protect, authorize('admin'), categoryRules, validate, updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
