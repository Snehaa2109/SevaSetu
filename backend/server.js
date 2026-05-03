// ⚠️ dotenv MUST be the very first thing — env vars must be loaded
// before passport is required, because config/passport immediately
// calls configureGoogleStrategy() which reads process.env.GOOGLE_CLIENT_ID.
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
// Required for Twilio webhook — it posts application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api',           require('./routes/users'));
app.use('/api/provider',  require('./routes/providers'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/bookings',  require('./routes/bookings'));
app.use('/api/support',   require('./routes/support'));
app.use('/api/whatsapp',  require('./routes/whatsapp'));

// Absorbs Twilio delivery-status callbacks — keeps them away from the message webhook
app.post('/api/whatsapp/status-callback', (req, res) => {
  res.set('Content-Type', 'text/xml').status(200).send('<Response></Response>');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Seva Setu API running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
