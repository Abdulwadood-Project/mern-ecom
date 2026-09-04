const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new AppError('Your cart is empty.', 400);
  }

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new AppError('One or more products are unavailable.', 400);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}.`, 400);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
    });

    itemsPrice += product.price * item.quantity;
  }

  itemsPrice = Number(itemsPrice.toFixed(2));
  const shippingPrice = itemsPrice >= 100 ? 0 : 9.99;
  const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod || 'cod',
    itemsPrice,
    shippingPrice,
    totalPrice,
    isPaid: req.body.paymentMethod === 'card',
    paidAt: req.body.paymentMethod === 'card' ? new Date() : undefined,
  });

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order },
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Orders retrieved successfully',
    data: { orders },
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this order.', 403);
  }

  res.status(200).json({
    success: true,
    message: 'Order retrieved successfully',
    data: { order },
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Orders retrieved successfully',
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!allowed.includes(status)) {
    throw new AppError('Invalid order status.', 400);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (order.status === 'cancelled') {
    throw new AppError('Cancelled orders cannot be updated.', 400);
  }

  if (status === 'cancelled' && order.status !== 'pending') {
    throw new AppError('Only pending orders can be cancelled.', 400);
  }

  if (status === 'cancelled') {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  order.status = status;
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.isPaid = true;
    order.paidAt = order.paidAt || new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: { order },
  });
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to cancel this order.', 403);
  }

  if (order.status !== 'pending') {
    throw new AppError('Only pending orders can be cancelled.', 400);
  }

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = 'cancelled';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order },
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const Category = require('../models/Category');

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalCategories,
    revenueAgg,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Category.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.status(200).json({
    success: true,
    message: 'Dashboard stats retrieved',
    data: {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
      recentOrders,
    },
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
  getDashboardStats,
};
