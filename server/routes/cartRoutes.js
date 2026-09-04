const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { cartItemRules } = require('../middleware/validators');
const { body } = require('express-validator');

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/items', cartItemRules, validate, addToCart);
router.put(
  '/items/:productId',
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate,
  updateCartItem
);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
