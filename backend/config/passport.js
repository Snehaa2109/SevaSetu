const passport = require("passport");
const { configureGoogleStrategy } = require("../services/googleAuth");

// Configure Google OAuth Strategy
configureGoogleStrategy();

module.exports = passport;
