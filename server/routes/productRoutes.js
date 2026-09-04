const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { productRules } = require('../middleware/validators');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Optional auth so admins can request inactive products via ?all=true
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // ignore invalid token for public routes
    }
  }
  next();
});

router.get('/featured', getFeaturedProducts);
router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);
router.post('/', protect, authorize('admin'), productRules, validate, createProduct);
router.put('/:id', protect, authorize('admin'), productRules, validate, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
