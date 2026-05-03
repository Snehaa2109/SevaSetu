const User     = require('../models/User');
const Provider = require('../models/Provider');
const Booking  = require('../models/Booking');
const {
  sendBookingRequestToProvider,
} = require('../services/whatsapp');

// @desc    Get all verified providers with optional filters
// @route   GET /api/services?service=Maid&area=Indirapuram&search=Ramesh
// @access  Public
const getServices = async (req, res) => {
  try {
    const { service, area, search } = req.query;

    // Build MongoDB filter — always require active + verified
    const filter = {
      isVerified: true,
      status: 'active',
    };

    // Filter by service category (case-insensitive exact match)
    if (service && service.trim()) {
      filter.serviceCategory = { $regex: new RegExp(`^${service.trim()}$`, 'i') };
    }

    // Filter by area (match any item in the areas array, case-insensitive)
    if (area && area.trim()) {
      filter.areas = { $elemMatch: { $regex: new RegExp(area.trim(), 'i') } };
    }

    // Text search on name or service description
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: re },
        { serviceCategory: re },
        { serviceDescription: re },
      ];
    }

    const providers = await Provider.find(filter)
      .select('name phone serviceCategory serviceDescription experience areas priceRange rating avatar isAvailable')
      .sort({ rating: -1, createdAt: -1 });

    res.json({ providers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create booking request
// @route   POST /api/booking/request
// @access  Private (USER or PROVIDER)
const createBookingRequest = async (req, res) => {
  try {
    const { providerId, serviceType, schedule, timing, address, date, time, notes } = req.body;

    if (!providerId) return res.status(400).json({ error: 'Provider ID is required' });
    if (!serviceType) return res.status(400).json({ error: 'Service type is required' });

    // Look up provider in the providers collection
    const provider = await Provider.findOne({
      _id: providerId,
      isVerified: true,
      status: 'active',
    });

    if (!provider) {
      return res.status(400).json({ error: 'No active provider found with that ID' });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      providerId,
      serviceType,
      schedule: schedule || 'Full-time',
      timing: timing || null,
      address: address || req.user.address || '',
      date: date ? new Date(date) : null,
      time: time || null,
      notes: notes || '',
    });

    // Populate for response
    await booking.populate('providerId', 'name phone serviceCategory');

    // Notify provider via WhatsApp
    if (provider.phone) {
      console.log(`[Booking] Sending WhatsApp to provider phone: "${provider.phone}"`);
      try {
        const waResult = await sendBookingRequestToProvider(booking, provider, req.user);
        console.log('[Booking] WhatsApp result:', JSON.stringify(waResult));
      } catch (waErr) {
        console.error('[Booking] WhatsApp send FAILED:', waErr.message, waErr.stack);
      }
    } else {
      console.warn('[Booking] Provider has no phone number — WhatsApp skipped. Provider:', provider._id);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
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
      .populate('providerId', 'name phone serviceCategory avatar isVerified isAvailable')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, email, area, address } = req.body;

    // Build update object — only set fields that were sent
    const update = {};
    if (name?.trim())    update.name    = name.trim();
    if (phone?.trim())   update.phone   = phone.trim();
    if (email?.trim())   update.email   = email.trim().toLowerCase();
    if (area?.trim())    update.area    = area.trim();
    if (address?.trim()) update.address = address.trim();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    // Check uniqueness of phone if being changed
    if (update.phone && update.phone !== req.user.phone) {
      const existing = await User.findOne({ phone: update.phone });
      if (existing) return res.status(400).json({ error: 'Phone number already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password -googleId');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        area: user.area,
        address: user.address,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a booking (owner only)
// @route   DELETE /api/user/booking/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    // Only the user who created the booking can delete it
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorised to delete this booking' });
    }
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getServices,
  createBookingRequest,
  getUserBookings,
  updateProfile,
  deleteBooking,
};
