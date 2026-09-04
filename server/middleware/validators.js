const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone is too long'),
  body('address.street').optional().trim().isLength({ max: 120 }),
  body('address.city').optional().trim().isLength({ max: 60 }),
  body('address.state').optional().trim().isLength({ max: 60 }),
  body('address.zipCode').optional().trim().isLength({ max: 20 }),
  body('address.country').optional().trim().isLength({ max: 60 }),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock is required'),
  body('category').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category'),
  body('image').optional({ values: 'falsy' }).trim().isURL().withMessage('Image must be a valid URL'),
  body('brand').optional({ values: 'falsy' }).trim().isLength({ max: 60 }),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('compareAtPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }),
];

const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }),
  body('description').optional().trim().isLength({ max: 300 }),
  body('isActive').optional().isBoolean(),
];

const cartItemRules = [
  body('productId').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Invalid product ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const orderRules = [
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  body('paymentMethod').optional().isIn(['cod', 'card']).withMessage('Invalid payment method'),
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  productRules,
  categoryRules,
  cartItemRules,
  orderRules,
};
