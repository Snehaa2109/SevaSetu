/**
 * WhatsApp Webhook Route
 * POST /api/whatsapp/webhook
 *
 * Twilio will POST to this URL when a provider replies via WhatsApp.
 * Configure this URL in your Twilio sandbox settings:
 *   https://www.twilio.com/console/sms/whatsapp/sandbox
 *   → "WHEN A MESSAGE COMES IN" → set to:
 *     https://<your-ngrok-or-server-url>/api/whatsapp/webhook
 */
const express = require('express');
const { handleWhatsAppWebhook } = require('../controllers/whatsappWebhookController');

const router = express.Router();

// Twilio sends POST with application/x-www-form-urlencoded — no auth middleware needed
router.post('/webhook', handleWhatsAppWebhook);

module.exports = router;
