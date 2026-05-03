const User     = require('../models/User');
const Provider = require('../models/Provider');
const Booking  = require('../models/Booking');
const {
  sendProviderRegistrationConfirmation,
  sendBookingRequestToProvider,
  sendBookingStatusToUser,
} = require('../services/whatsapp');

// @desc    Register as provider (unauthenticated — from the public landing page form)
// @route   POST /api/provider/register
// @access  Public (or Private if user is logged in)
const registerProvider = async (req, res) => {
  try {
    const {
      name,
      phone,
      area,
      address,
      serviceType,
      experience,
      serviceCharge,
    } = req.body;

    if (!name || !phone || !serviceType) {
      return res.status(400).json({ error: 'Name, phone, and service type are required' });
    }

    // ── Authenticated path ──────────────────────────────────────────────────────
    // Update the User record so role-based auth still works, THEN upsert the
    // detailed profile into the *providers* collection.
    if (req.user) {
      // 1. Flip the user's role to PROVIDER (so JWT auth gives them provider access)
      // NOTE: We do NOT overwrite name/phone on the User record — those are the user's
      // auth identity. Provider profile details live exclusively in the providers collection.
      await User.findByIdAndUpdate(
        req.user._id,
        {
          role:   'PROVIDER',
          status: 'active',
          isVerified: true,
        },
        { new: true, runValidators: true }
      );

      // 2. Upsert provider details into the providers collection
      const providerDoc = await Provider.findOneAndUpdate(
        { phone: phone || req.user.phone },
        {
          name: name || req.user.name,
          phone: phone || req.user.phone,
          areas: area ? [area] : [],
          serviceCategory: serviceType,
          serviceDescription: address || '',
          experience: Number(experience) || 0,
          priceRange: {
            min: 0,
            max: Number(serviceCharge) || 0,
            unit: 'per visit',
          },
          isVerified: true,           // visible on services/booking page immediately
          status: 'active',
          isAvailable: true,
          userId: req.user._id,
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );

      // 3. Send WhatsApp confirmation — fire-and-forget
      if (providerDoc.phone) {
        sendProviderRegistrationConfirmation(providerDoc.name, providerDoc.phone).catch((err) =>
          console.warn('[WhatsApp] Registration confirmation failed:', err.message)
        );
      }

      return res.status(201).json({
        message: 'Provider registration submitted for approval',
        provider: {
          id: providerDoc._id,
          name: providerDoc.name,
          serviceCategory: providerDoc.serviceCategory,
          isVerified: providerDoc.isVerified,
        },
      });
    }

    // ── Unauthenticated path (public landing page form) ────────────────────────
    // Upsert directly into the providers collection.
    const existingProvider = await Provider.findOneAndUpdate(
      { phone },
      {
        name,
        phone,
        areas: area ? [area] : [],
        serviceCategory: serviceType,
        serviceDescription: address || '',
        experience: Number(experience) || 0,
        priceRange: {
          min: 0,
          max: Number(serviceCharge) || 0,
          unit: 'per visit',
        },
        isVerified: true,             // visible on services/booking page immediately
        status: 'active',
        isAvailable: true,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Also flip User record if a user with this phone already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      existingUser.role     = 'PROVIDER';
      existingUser.status   = 'active';
      existingUser.isVerified = true;
      await existingUser.save();
    }

    // Send WhatsApp confirmation — fire-and-forget
    sendProviderRegistrationConfirmation(existingProvider.name, existingProvider.phone).catch((err) =>
      console.warn('[WhatsApp] Registration confirmation failed:', err.message)
    );

    res.status(201).json({
      message: 'Provider application received! We will review and contact you within 24–48 hours.',
      providerId: existingProvider._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get provider profile by phone (for verification after registration)
// @route   GET /api/provider/profile/:phone
// @access  Public
const getProviderByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Look up in the providers collection
    const provider = await Provider.findOne({ phone });
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({
      id: provider._id,
      name: provider.name,
      phone: provider.phone,
      areas: provider.areas,
      serviceCategory: provider.serviceCategory,
      serviceDescription: provider.serviceDescription,
      experience: provider.experience,
      priceRange: provider.priceRange,
      isVerified: provider.isVerified,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get provider profile (authenticated)
// @route   GET /api/provider/profile
// @access  Private (PROVIDER)
const getProviderProfile = async (req, res) => {
  try {
    // Look up by phone (link between User and Provider collections)
    const provider = await Provider.findOne({ phone: req.user.phone });
    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    res.json({
      id: provider._id,
      name: provider.name,
      phone: provider.phone,
      areas: provider.areas,
      serviceCategory: provider.serviceCategory,
      serviceDescription: provider.serviceDescription,
      experience: provider.experience,
      priceRange: provider.priceRange,
      isVerified: provider.isVerified,
      isAvailable: provider.isAvailable,
      rating: provider.rating,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
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

    // Notify user their booking was accepted
    if (booking.userId?.phone) {
      sendBookingStatusToUser(booking, req.user, booking.userId, 'accepted').catch((err) =>
        console.warn('[WhatsApp] Accept notification failed:', err.message)
      );
    }

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

    // Notify user their booking was rejected
    if (booking.userId?.phone) {
      sendBookingStatusToUser(booking, req.user, booking.userId, 'rejected').catch((err) =>
        console.warn('[WhatsApp] Reject notification failed:', err.message)
      );
    }

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerProvider,
  getProviderByPhone,
  getProviderProfile,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
};
