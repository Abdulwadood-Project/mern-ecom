const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
} = require('../middleware/validators');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileRules, validate, updateProfile);
router.put('/password', protect, changePasswordRules, validate, changePassword);

module.exports = router;
