const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { orderRules } = require('../middleware/validators');
const { body } = require('express-validator');

const router = express.Router();

router.get('/admin/stats', protect, authorize('admin'), getDashboardStats);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.patch(
  '/admin/:id/status',
  protect,
  authorize('admin'),
  body('status').notEmpty().withMessage('Status is required'),
  validate,
  updateOrderStatus
);

router.use(protect);

router.post('/', orderRules, validate, createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelMyOrder);

module.exports = router;
