const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { registerUser, loginUser, getUserFromToken } = require("../services/jwtAuth");
const { handleGoogleAuthSuccess, isGoogleOAuthConfigured } = require("../services/googleAuth");
const passport = require("passport");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email, password, area, address, role, serviceType, experience } = req.body;
    const result = await registerUser({ name, phone, email, password, area, address, role, serviceType, experience });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;
    const result = await loginUser(phone, password);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization?.split(" ")[1]);
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
const googleAuth = (req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(501).json({ error: "Google OAuth not configured" });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = (req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(501).json({ error: "Google OAuth not configured" });
  }
  passport.authenticate("google", { failureRedirect: "/login", session: false })(req, res, next);
};

// @desc    Google OAuth success
// @route   GET /api/auth/google/success
// @access  Public
const googleAuthSuccess = handleGoogleAuthSuccess;

module.exports = {
  register,
  login,
  getMe,
  googleAuth,
  googleAuthCallback,
  googleAuthSuccess,
};
