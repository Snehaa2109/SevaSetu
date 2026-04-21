const express = require('express');
const { sendSupportMessage, getSupportMessages } = require('../controllers/supportController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/support/message
// @desc    Submit support message (public, but attaches userId if logged in)
// @access  Public (optionally authenticated)
router.post('/message', (req, res, next) => {
  // Try to attach user if token present, but don't fail if not
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).then(user => {
        req.user = user;
        next();
      }).catch(() => next());
    } catch {
      next();
    }
  } else {
    next();
  }
}, sendSupportMessage);

// @route   GET /api/support/messages
// @desc    Get all support messages (admin only)
// @access  Private (ADMIN)
router.get('/messages', auth, roleAuth('ADMIN'), getSupportMessages);

module.exports = router;
