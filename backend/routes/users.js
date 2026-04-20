const express = require('express');
const { getServices, createBookingRequest, getUserBookings } = require('../controllers/userController');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all verified providers
// @access  Public
router.get('/services', getServices);

// @route   POST /api/booking/request
// @desc    Create booking request
// @access  Private (USER)
router.post('/booking/request', auth, roleAuth('USER'), createBookingRequest);

// @route   GET /api/user/bookings
// @desc    Get user bookings
// @access  Private (USER)
router.get('/user/bookings', auth, roleAuth('USER'), getUserBookings);

module.exports = router;
