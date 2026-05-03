// Google OAuth Authentication Service
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { generateToken } = require("./jwtAuth");

// Configure Google OAuth Strategy
const configureGoogleStrategy = () => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("Google OAuth credentials not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
    return;
  }

  // callbackURL must be an absolute URL that Google's OAuth server can redirect back to.
  // Using a relative path sends Google to the wrong origin when frontend and backend differ.
  const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user and sync identity from Google.
            // Always force role=USER and status=active — Google OAuth is only for
            // service seekers, not provider accounts.
            user.googleId   = profile.id;
            user.avatar     = profile.photos[0].value;
            user.name       = profile.displayName;
            user.role       = 'USER';
            user.status     = 'active';
            user.isVerified = true;
            await user.save();
            return done(null, user);
          }

          // Create new user from Google profile — always USER role
          user = new User({
            name:       profile.displayName,
            email:      profile.emails[0].value,
            googleId:   profile.id,
            avatar:     profile.photos[0].value,
            role:       'USER',
            status:     'active',
            isVerified: true,
          });

          await user.save();
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Handle Google OAuth success
const handleGoogleAuthSuccess = (req, res) => {
  const token = generateToken(req.user._id);
  // Redirect to frontend with token
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/auth/success?token=${token}`);
};

// Check if Google OAuth is configured
const isGoogleOAuthConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

module.exports = {
  configureGoogleStrategy,
  handleGoogleAuthSuccess,
  isGoogleOAuthConfigured,
};
