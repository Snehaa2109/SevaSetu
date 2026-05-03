const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    serviceCategory: {
      type: String,
      required: [true, 'Service category is required'],
      // Not strictly enforcing enum so form free-text values are accepted
      trim: true,
    },
    serviceDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    areas: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: Number, // years
      default: 0,
    },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      unit: {
        type: String,
        enum: ['per hour', 'per visit', 'per project', 'negotiable'],
        default: 'per visit',
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    languages: [
      {
        type: String,
        default: ['Hindi'],
      },
    ],
    // Reference back to the User document (set when an authenticated user registers)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    // Approval status (mirrors User.status for admin workflows)
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'terminated'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Text search index
providerSchema.index({ name: 'text', serviceCategory: 'text', serviceDescription: 'text' });

module.exports = mongoose.model('Provider', providerSchema);
