const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getWhatsAppLink,
} = require('../controllers/bookingController');

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.patch('/:id/status', updateBookingStatus);
router.get('/:id/whatsapp', getWhatsAppLink);

module.exports = router;
