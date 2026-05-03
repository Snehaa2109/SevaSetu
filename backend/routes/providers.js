const express = require('express');
const {
  registerProvider,
  getProviderByPhone,
  getProviderProfile,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
} = require('../controllers/providerController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

// Optional-auth middleware — attaches req.user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  // Reuse the real auth middleware but swallow errors
  auth(req, res, (err) => {
    // Even if token is invalid, let the request through (unauthenticated path)
    next();
  });
};

// @route   POST /api/provider/register
// @desc    Register as provider — works for both logged-in users and public (landing page form)
// @access  Public (with optional auth to link to existing account)
router.post('/register', optionalAuth, registerProvider);

// @route   GET /api/provider/profile/:phone
// @desc    Get provider profile by phone (for verification after registration)
// @access  Public
router.get('/profile/:phone', getProviderByPhone);

// @route   GET /api/provider/profile
// @desc    Get authenticated provider's profile
// @access  Private (PROVIDER)
router.get('/profile', auth, roleAuth('PROVIDER'), getProviderProfile);

// @route   GET /api/provider/bookings
// @desc    Get provider bookings
// @access  Private (PROVIDER)
router.get('/bookings', auth, roleAuth('PROVIDER'), getProviderBookings);

// @route   PUT /api/provider/booking/:id/accept
// @desc    Accept booking (in-app fallback if provider can't use WhatsApp)
// @access  Private (PROVIDER)
router.put('/booking/:id/accept', auth, roleAuth('PROVIDER'), acceptBooking);

// @route   PUT /api/provider/booking/:id/reject
// @desc    Reject booking
// @access  Private (PROVIDER)
router.put('/booking/:id/reject', auth, roleAuth('PROVIDER'), rejectBooking);

module.exports = router;
