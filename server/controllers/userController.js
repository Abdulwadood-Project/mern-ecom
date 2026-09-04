const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: { user },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, name } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user._id.toString() === req.user._id.toString() && role && role !== user.role) {
    throw new AppError('You cannot change your own role.', 400);
  }

  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (name !== undefined) user.name = name;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account from admin panel.', 400);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
