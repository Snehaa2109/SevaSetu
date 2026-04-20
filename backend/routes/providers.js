const express = require('express');
const {
  registerProvider,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
} = require('../controllers/providerController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/provider/register
// @desc    Register as provider
// @access  Private (USER)
router.post('/register', auth, roleAuth('USER'), registerProvider);

// @route   GET /api/provider/bookings
// @desc    Get provider bookings
// @access  Private (PROVIDER)
router.get('/bookings', auth, roleAuth('PROVIDER'), getProviderBookings);

// @route   PUT /api/provider/booking/:id/accept
// @desc    Accept booking
// @access  Private (PROVIDER)
router.put('/booking/:id/accept', auth, roleAuth('PROVIDER'), acceptBooking);

// @route   PUT /api/provider/booking/:id/reject
// @desc    Reject booking
// @access  Private (PROVIDER)
router.put('/booking/:id/reject', auth, roleAuth('PROVIDER'), rejectBooking);

module.exports = router;
