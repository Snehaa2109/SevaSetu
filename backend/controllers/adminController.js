const User = require('../models/User');
const Booking = require('../models/Booking');
const { sendWhatsAppMessage } = require('../services/whatsapp');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (ADMIN)
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProviders, pendingProviders, totalBookings] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'PROVIDER', isVerified: true }),
      User.countDocuments({ role: 'PROVIDER', status: 'pending' }),
      Booking.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalProviders,
      pendingProviders,
      totalBookings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private (ADMIN)
const getStats = async (req, res) => {
  try {
    const [requestsReceived, approvedCount, rejectedCount] = await Promise.all([
      User.countDocuments({ role: 'PROVIDER' }),
      User.countDocuments({ role: 'PROVIDER', isVerified: true }),
      User.countDocuments({ role: 'PROVIDER', status: 'rejected' }),
    ]);

    res.json({
      requestsReceived,
      approvedCount,
      rejectedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get pending provider requests
// @route   GET /api/admin/providers/pending
// @access  Private (ADMIN)
const getPendingProviders = async (req, res) => {
  try {
    const providers = await User.find({
      role: 'PROVIDER',
      status: 'pending',
    }).select('name phone email serviceType experience address documents createdAt');

    res.json({ providers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Approve provider
// @route   PUT /api/admin/provider/:id/approve
// @access  Private (ADMIN)
const approveProvider = async (req, res) => {
  try {
    const provider = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'PROVIDER', status: 'pending' },
      {
        isVerified: true,
        status: 'active',
      },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found or already processed' });
    }

    // Send WhatsApp notification
    await sendWhatsAppMessage(
      provider.phone,
      `Congratulations! Your provider application has been approved. You can now start receiving booking requests.`
    );

    res.json({
      message: 'Provider approved successfully',
      provider: {
        id: provider._id,
        name: provider.name,
        phone: provider.phone,
        serviceType: provider.serviceType,
        isVerified: provider.isVerified,
        status: provider.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reject provider
// @route   PUT /api/admin/provider/:id/reject
// @access  Private (ADMIN)
const rejectProvider = async (req, res) => {
  try {
    const { comments } = req.body;

    const provider = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'PROVIDER', status: 'pending' },
      {
        status: 'rejected',
        // Could add rejection comments field to schema
      },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found or already processed' });
    }

    // Send WhatsApp notification
    await sendWhatsAppMessage(
      provider.phone,
      `Your provider application has been rejected. ${comments || 'Please contact support for more details.'}`
    );

    res.json({
      message: 'Provider rejected',
      provider: {
        id: provider._id,
        name: provider.name,
        status: provider.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Terminate provider
// @route   DELETE /api/admin/provider/:id
// @access  Private (ADMIN)
const terminateProvider = async (req, res) => {
  try {
    const provider = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'PROVIDER' },
      { status: 'terminated' },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ message: 'Provider terminated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  getStats,
  getPendingProviders,
  approveProvider,
  rejectProvider,
  terminateProvider,
};