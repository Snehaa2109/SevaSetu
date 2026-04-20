const User = require('../models/User');
const Booking = require('../models/Booking');
const { sendWhatsAppMessage } = require('../services/whatsapp');

// @desc    Get all verified providers (services)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const providers = await User.find({
      role: 'PROVIDER',
      isVerified: true,
      status: 'active',
    }).select('name phone serviceType experience address avatar');

    res.json({ providers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create booking request
// @route   POST /api/booking/request
// @access  Private (USER)
const createBookingRequest = async (req, res) => {
  try {
    const { providerId, serviceType, date, time, notes } = req.body;

    // Check if provider exists and is verified
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'PROVIDER' || !provider.isVerified) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      providerId,
      serviceType,
      date,
      time,
      notes,
    });

    // Send WhatsApp notification to provider
    await sendWhatsAppMessage(
      provider.phone,
      `New booking request from ${req.user.name} for ${serviceType} on ${date} at ${time}`
    );

    res.status(201).json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/user/bookings
// @access  Private (USER)
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('providerId', 'name phone serviceType')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getServices,
  createBookingRequest,
  getUserBookings,
};
