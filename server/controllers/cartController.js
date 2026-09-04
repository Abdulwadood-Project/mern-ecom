const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    populate: { path: 'category', select: 'name slug' },
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name slug' },
    });
  }

  return cart;
};

const formatCartResponse = (cart) => {
  const items = (cart.items || [])
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      lineTotal: Number((item.product.price * item.quantity).toFixed(2)),
    }));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));

  return {
    _id: cart._id,
    user: cart.user,
    items,
    itemCount,
    subtotal,
    updatedAt: cart.updatedAt,
  };
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Cart retrieved successfully',
    data: { cart: formatCartResponse(cart) },
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new AppError('Product not found or unavailable.', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock for this product.', 400);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existing = cart.items.find((item) => item.product.toString() === productId);
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) {
      throw new AppError('Insufficient stock for requested quantity.', 400);
    }
    existing.quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  cart = await getOrCreateCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: { cart: formatCartResponse(cart) },
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    throw new AppError('Quantity must be at least 1.', 400);
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product not found or unavailable.', 404);
  }

  if (quantity > product.stock) {
    throw new AppError('Insufficient stock for requested quantity.', 400);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError('Cart not found.', 404);
  }

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    throw new AppError('Item not found in cart.', 404);
  }

  item.quantity = quantity;
  await cart.save();

  const populated = await getOrCreateCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    data: { cart: formatCartResponse(populated) },
  });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new AppError('Cart not found.', 404);
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();

  const populated = await getOrCreateCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: { cart: formatCartResponse(populated) },
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError('Cart not found.', 404);
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: { cart: formatCartResponse(cart) },
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
