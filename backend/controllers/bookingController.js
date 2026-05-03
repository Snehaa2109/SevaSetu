const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// Build WhatsApp message URL
const buildWhatsAppURL = (phone, booking, provider) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

  const date = new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const message = `🔔 *New Booking Request*\n\n` +
    `Hello ${provider.name}! You have a new service request on Seva Setu.\n\n` +
    `👤 *Customer:* ${booking.userName}\n` +
    `📞 *Phone:* ${booking.userPhone}\n` +
    `📍 *Address:* ${booking.userAddress}, ${booking.area}\n` +
    `🔧 *Service:* ${booking.serviceRequired}\n` +
    `📅 *Date:* ${date}\n` +
    `⏰ *Time:* ${booking.scheduledTime}\n` +
    (booking.notes ? `📝 *Notes:* ${booking.notes}\n` : '') +
    `\nPlease reply to confirm or call the customer directly.`;

  return `whatsapp://send?phone=${fullPhone}&text=${encodeURIComponent(message)}`;
};

// POST /api/bookings - Create booking

const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      userName,
      userPhone,
      userAddress,
      area,
      serviceRequired,
      scheduledDate,
      scheduledTime,
      notes,
    } = req.body;

    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    if (!provider.isAvailable) return res.status(400).json({ error: 'Provider is not available' });

    const booking = await Booking.create({
      provider: providerId,
      userName,
      userPhone,
      userAddress,
      area,
      serviceRequired,
      scheduledDate,
      scheduledTime,
      notes,
    });

    const whatsappNumber = provider.whatsapp || provider.phone;
    const whatsappURL = buildWhatsAppURL(whatsappNumber, booking, provider);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: await booking.populate('provider', 'name phone whatsapp serviceCategory'),
      whatsappURL,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};

// GET /api/bookings - List bookings (by phone for user)
const getBookings = async (req, res) => {
  try {
    const { phone, providerId, status } = req.query;

    const filter = {};
    if (phone) filter.userPhone = phone;
    if (providerId) filter.provider = providerId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('provider', 'name phone serviceCategory areas')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('provider');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/bookings/:id/status - Provider accepts/rejects
const updateBookingStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ['accepted', 'rejected', 'completed', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const booking = await Booking.findById(req.params.id).populate('provider');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = status;
    if (status === 'rejected' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }

    await booking.save();

    res.json({ message: `Booking ${status}`, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/bookings/:id/whatsapp - Regenerate WhatsApp link
const getWhatsAppLink = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('provider');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const provider = booking.provider;
    const whatsappNumber = provider.whatsapp || provider.phone;
    const whatsappURL = buildWhatsAppURL(whatsappNumber, booking, provider);

    res.json({ whatsappURL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getWhatsAppLink,
};
