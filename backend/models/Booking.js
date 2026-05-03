const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',   // providers live in the providers collection
      required: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
    },
    // Work schedule preference (Full-time / Part-time)
    schedule: {
      type: String,
      enum: ['Full-time', 'Part-time'],
      default: 'Full-time',
    },
    // Preferred timing slot string (e.g. "Morning (8:00 AM - 12:00 PM)")
    timing: {
      type: String,
      trim: true,
    },
    // Service location address provided by user
    address: {
      type: String,
      trim: true,
    },
    // Optional fixed date/time (kept for backward compat)
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
