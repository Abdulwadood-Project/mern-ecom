const User = require('../models/User');
const Cart = require('../models/Cart');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendTokenResponse } = require('../utils/token');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email is already registered.', 400);
  }

  const user = await User.create({ name, email, password });
  await Cart.create({ user: user._id, items: [] });

  sendTokenResponse(user, 201, res, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', 403);
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user retrieved',
    data: { user: req.user },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'address'];
  const updates = {};

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', 400);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
