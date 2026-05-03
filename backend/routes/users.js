const express = require('express');
const { getServices, createBookingRequest, getUserBookings, updateProfile, deleteBooking } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all verified providers
// @access  Public
router.get('/services', getServices);

// @route   POST /api/booking/request
// @desc    Create booking request
// @access  Private (any logged-in user)
router.post('/booking/request', auth, createBookingRequest);

// @route   GET /api/user/bookings
// @desc    Get user bookings
// @access  Private
router.get('/user/bookings', auth, getUserBookings);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/user/profile', auth, updateProfile);

// @route   DELETE /api/user/booking/:id
// @desc    Delete a booking (owner only)
// @access  Private
router.delete('/user/booking/:id', auth, deleteBooking);

module.exports = router;
