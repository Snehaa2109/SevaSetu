const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: function() {
        return !this.googleId;
      },
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Allow multiple null emails
    },
    area: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['USER', 'PROVIDER', 'ADMIN'],
      default: 'USER',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected', 'terminated'],
      default: 'active',
    },
    // Provider specific fields
    serviceType: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    serviceCharge: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    documents: [{
      type: String, // URLs or file paths
    }],
    // OAuth fields
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
