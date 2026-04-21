const SupportMessage = require('../models/SupportMessage');

// @desc    Submit a support message
// @route   POST /api/support/message
// @access  Public (also accepts logged-in users)
const sendSupportMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const doc = await SupportMessage.create({
      name: name.trim(),
      email: email?.trim() || '',
      message: message.trim(),
      // Link to user if authenticated (optional)
      userId: req.user?._id || null,
    });

    res.status(201).json({
      message: 'Support message received. We will get back to you within 2 hours.',
      id: doc._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all support messages (admin)
// @route   GET /api/support/messages
// @access  Private (ADMIN)
const getSupportMessages = async (req, res) => {
  try {
    const messages = await SupportMessage.find()
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendSupportMessage, getSupportMessages };
