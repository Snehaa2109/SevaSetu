// JWT Authentication Service
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Register user with JWT
const registerUser = async (userData) => {
  const { name, phone, email, password, area, address } = userData;
  // role is ALWAYS 'USER' from this endpoint — providers use /api/provider/register

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ phone }, { email: email ? email : null }],
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create user — always USER role, never PROVIDER via this path
  const user = await User.create({
    name,
    phone,
    email,
    area,
    address,
    password,
    role:       'USER',
    status:     'active',
    isVerified: false,
  });

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id:         user._id,
      name:       user.name,
      phone:      user.phone,
      email:      user.email,
      area:       user.area,
      address:    user.address,
      role:       user.role,
      status:     user.status,
      isVerified: user.isVerified,
    },
  };
};

// Login user with JWT
const loginUser = async (phoneOrEmail, password) => {
  // Check if user exists by phone or email
  const user = await User.findOne({
    $or: [
      { phone: phoneOrEmail },
      { email: phoneOrEmail }
    ]
  });
  
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  // Only USER-role accounts can log in through this endpoint
  if (user.role !== 'USER') {
    throw new Error('Provider accounts cannot log in here. Please use the Provider Portal.');
  }

  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }

  const token = generateToken(user._id);

  return {
    token,
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
    },
  };
};

// Get user from token
const getUserFromToken = async (token) => {
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new Error("User not found");
  }

  return {
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
  };
};

module.exports = {
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  getUserFromToken,
};
