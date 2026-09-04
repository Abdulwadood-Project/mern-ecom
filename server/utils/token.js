const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const isSecure = process.env.COOKIE_SECURE === 'true';
  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    // Cross-origin (Vercel ↔ Render) needs SameSite=None + Secure
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      data: {
        user: user.toJSON(),
        token,
      },
    });
};

module.exports = { generateToken, sendTokenResponse };
