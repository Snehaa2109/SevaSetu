const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  googleAuth,
  googleAuthCallback,
  googleAuthSuccess,
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty(),
    body('phone', 'Phone is required').notEmpty(),
    body('email', 'Please include a valid email').optional().isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('phone', 'Phone or email is required').notEmpty(),
    body('password', 'Password is required').exists(),
  ],
  login
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   GET /api/auth/google
// @desc    Google OAuth
// @access  Public
router.get('/google', googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', googleAuthCallback, googleAuthSuccess);

module.exports = router;