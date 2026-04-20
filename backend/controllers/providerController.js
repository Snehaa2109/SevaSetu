const User = require('../models/User');
const Booking = require('../models/Booking');
const { sendWhatsAppMessage } = require('../services/whatsapp');

// @desc    Register as provider
// @route   POST /api/provider/register
// @access  Private (USER)
const registerProvider = async (req, res) => {
  try {
    const { serviceType, experience, address, documents } = req.body;

    // Update user to provider role with pending status
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        role: 'PROVIDER',
        status: 'pending',
        serviceType,
        experience,
        address,
        documents: documents || [],
      },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      message: 'Provider registration submitted for approval',
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        status: user.status,
        serviceType: user.serviceType,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get provider bookings
// @route   GET /api/provider/bookings
// @access  Private (PROVIDER)
const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.user._id })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Accept booking
// @route   PUT /api/provider/booking/:id/accept
// @access  Private (PROVIDER)
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, providerId: req.user._id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    ).populate('userId', 'name phone');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or already processed' });
    }

    // Send WhatsApp notification to user
    await sendWhatsAppMessage(
      booking.userId.phone,
      `Your booking request for ${booking.serviceType} has been accepted by ${req.user.name}`
    );

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reject booking
// @route   PUT /api/provider/booking/:id/reject
// @access  Private (PROVIDER)
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, providerId: req.user._id, status: 'pending' },
      { status: 'rejected' },
      { new: true }
    ).populate('userId', 'name phone');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or already processed' });
    }

    // Send WhatsApp notification to user
    await sendWhatsAppMessage(
      booking.userId.phone,
      `Your booking request for ${booking.serviceType} has been rejected by ${req.user.name}`
    );

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerProvider,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
};
