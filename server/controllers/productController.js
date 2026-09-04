const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const buildProductFilter = (query, { includeInactive = false } = {}) => {
  const filter = {};

  if (!includeInactive) {
    filter.isActive = true;
  } else if (query.isActive === 'true' || query.isActive === 'false') {
    filter.isActive = query.isActive === 'true';
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.featured === 'true') {
    filter.featured = true;
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;
  const includeInactive = req.user?.role === 'admin' && req.query.all === 'true';

  const filter = buildProductFilter(req.query, { includeInactive });

  let sort = { createdAt: -1 };
  if (req.query.sort === 'price_asc') sort = { price: 1 };
  if (req.query.sort === 'price_desc') sort = { price: -1 };
  if (req.query.sort === 'name') sort = { name: 1 };
  if (req.query.search) sort = { score: { $meta: 'textScore' } };

  const findQuery = Product.find(filter)
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  if (req.query.search) {
    findQuery.select({ score: { $meta: 'textScore' } });
  }

  const [products, total] = await Promise.all([
    findQuery,
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');

  if (!product || (!product.isActive && req.user?.role !== 'admin')) {
    throw new AppError('Product not found.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Product retrieved successfully',
    data: { product },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  await product.populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: null,
  });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true, isActive: true })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(8);

  res.status(200).json({
    success: true,
    message: 'Featured products retrieved successfully',
    data: { products },
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
};
