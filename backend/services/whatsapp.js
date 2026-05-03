/**
 * WhatsApp Service — Twilio Sandbox (Test Environment)
 *
 * Sandbox setup (one-time, manual):
 *   1. Go to https://www.twilio.com/console/sms/whatsapp/sandbox
 *   2. Send "join <sandbox-keyword>" to +1 415 523 8886 from the provider's WhatsApp number
 *   3. Fill TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in .env
 *
 * The FROM number for sandbox is always: whatsapp:+14155238886
 */

const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// Sandbox FROM number — always this for the test sandbox
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

let client = null;

const getClient = () => {
  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    console.warn('[WhatsApp] Twilio credentials not set — messages will only be logged.');
    return null;
  }
  if (!client) client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  return client;
};

/**
 * Normalise any Indian phone number to E.164 WhatsApp format
 * e.g.  "9876543210"  →  "whatsapp:+919876543210"
 *        "+919876543210" →  "whatsapp:+919876543210"
 */
const toWhatsAppNumber = (phone) => {
  const digits = phone.replace(/\D/g, '');
  let e164;
  if (digits.startsWith('91') && digits.length === 12) {
    // Already has Indian country code: 919876543210 → +919876543210
    e164 = `+${digits}`;
  } else if (digits.length === 10) {
    // Bare Indian 10-digit number → add +91
    e164 = `+91${digits}`;
  } else {
    // Already a full international number (e.g. +14155238886 → 14155238886)
    e164 = `+${digits}`;
  }
  return `whatsapp:${e164}`;
};

/**
 * Send a plain WhatsApp text message via Twilio sandbox.
 * Returns { success, sid } or { success: false, error }
 */
const sendWhatsAppMessage = async (phone, message) => {
  const to = toWhatsAppNumber(phone);
  console.log(`[WhatsApp] → ${to}\n${message}\n`);

  const cl = getClient();
  if (!cl) return { success: true, sid: 'mock-no-credentials' };

  try {
    const msg = await cl.messages.create({
      from: FROM_NUMBER,
      to,
      body: message,
    });
    console.log(`[WhatsApp] Sent SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error('[WhatsApp] Send error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send a WhatsApp message using Twilio Content Template.
 * Supports dynamic variable substitution for template placeholders.
 * @param {string} phone - Recipient phone number
 * @param {string} contentSid - Template Content SID from Twilio
 * @param {object} variables - Object with variables to substitute in template (e.g., { name: 'John' })
 * @returns {object} { success, sid } or { success: false, error }
 */
const sendWhatsAppTemplate = async (phone, contentSid, variables = {}) => {
  const to = toWhatsAppNumber(phone);
  console.log(`[WhatsApp Template] → ${to}\nTemplate SID: ${contentSid}\nVariables:`, variables);

  const cl = getClient();
  if (!cl) {
    console.warn('[WhatsApp Template] No credentials - message not sent');
    return { success: true, sid: 'mock-no-credentials' };
  }

  try {
    // Twilio Content API requires contentVariables as a JSON object
    // with numeric string keys: {"1": "value1", "2": "value2", ...}
    const variablesObj = {};
    Object.values(variables).forEach((val, idx) => {
      variablesObj[String(idx + 1)] = String(val);
    });

    const msg = await cl.messages.create({
      from: FROM_NUMBER,
      to,
      contentSid: contentSid,
      contentVariables: JSON.stringify(variablesObj),
    });
    console.log(`[WhatsApp Template] Sent SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error('[WhatsApp Template] Send error:', err.message);
    // Fallback to plain text if template fails
    console.log('[WhatsApp Template] Falling back to plain text message');
    const fallbackMessage = `Welcome to Seva Setu, ${variables.name || 'Provider'}! Your registration has been received.`;
    return sendWhatsAppMessage(phone, fallbackMessage);
  }
};

/**
 * Send the provider registration confirmation message using Twilio template.
 * Called right after a provider fills the "Become a Seva Provider" form.
 * Uses a template message if TWILIO_PROVIDER_WELCOME_TEMPLATE_SID is configured,
 * otherwise falls back to plain text message.
 */
const sendProviderRegistrationConfirmation = async (providerName, phone) => {
  const templateSid = process.env.TWILIO_PROVIDER_WELCOME_TEMPLATE_SID;

  // If template SID is configured, use template-based message
  if (templateSid) {
    console.log('[WhatsApp] Using template-based welcome message');
    return sendWhatsAppTemplate(phone, templateSid, { name: providerName });
  }

  // Fallback to plain text message
  const message =
    `✅ *Welcome to Seva Setu, ${providerName}!*\n\n` +
    `Your provider application has been received. Our team will verify your profile within 24–48 hours.\n\n` +
    `Once approved you will start receiving service requests directly on this WhatsApp number.\n\n` +
    `Questions? Reply to this message or email support@sevasetu.com\n\n` +
    `— Team Seva Setu 🙏`;

  return sendWhatsAppMessage(phone, message);
};

/**
 * Send a booking approval request to the provider via Twilio Content Template.
 *
 * Template variables (numbered keys):
 *   {{1}} = providerName
 *   {{2}} = customerName
 *   {{3}} = serviceType
 *   {{4}} = address
 *   {{5}} = bookingShortId
 *
 * The provider replies:
 *   ACCEPT <shortId>  — to confirm
 *   REJECT <shortId>  — to decline
 *
 * Handled by /api/whatsapp/webhook.
 */
const sendBookingRequestToProvider = async (booking, provider, user) => {
  const shortId = booking._id.toString().slice(-6).toUpperCase();
  const templateSid = process.env.TWILIO_BOOKING_REQUEST_TEMPLATE_SID;

  if (templateSid) {
    console.log('[WhatsApp] Sending booking request via Twilio template to provider:', provider.phone);
    return sendWhatsAppTemplate(provider.phone, templateSid, {
      providerName: provider.name,       // {{1}}
      customerName: user.name,           // {{2}}
      serviceType: booking.serviceType, // {{3}}
      requestId: shortId,             // {{4}} — real 6-char booking ID from MongoDB
    });
  }

  // ── Plain-text fallback ────────────────────────────────────────────────────
  const message =
    `🔔 *New Service Request — Seva Setu*\n\n` +
    `Hello *${provider.name}*! You have a new booking request.\n\n` +
    `👤 *Customer:* ${user.name}\n` +
    `📞 *Phone:* ${user.phone || 'Not provided'}\n` +
    `🛠 *Service:* ${booking.serviceType}\n` +
    `📅 *Schedule:* ${booking.schedule || 'Full-time'}\n` +
    `⏰ *Timing:* ${booking.timing || 'Flexible'}\n` +
    `📍 *Address:* ${booking.address || 'Not specified'}\n` +
    (booking.notes ? `📝 *Notes:* ${booking.notes}\n` : '') +
    `\n*Booking ID:* ${shortId}\n\n` +
    `✅ Reply *ACCEPT ${shortId}* to confirm this booking\n` +
    `❌ Reply *REJECT ${shortId}* to decline\n\n` +
    `Your response will be immediately reflected on the customer's dashboard.`;

  return sendWhatsAppMessage(provider.phone, message);
};

/**
 * Notify the user (customer) that their booking was accepted or rejected.
 */
const sendBookingStatusToUser = async (booking, provider, user, status) => {
  const isAccepted = status === 'accepted';

  const message = isAccepted
    ? `✅ *Booking Confirmed — Seva Setu*\n\n` +
    `Great news, ${user.name}! Your ${booking.serviceType} request has been *accepted* by ${provider.name}.\n\n` +
    `📞 You can reach ${provider.name} at: ${provider.phone || 'contact via app'}\n\n` +
    `Thank you for using Seva Setu! 🙏`
    : `❌ *Booking Update — Seva Setu*\n\n` +
    `Hi ${user.name}, unfortunately your ${booking.serviceType} request has been *declined* by ${provider.name}.\n\n` +
    `Please visit the app to choose another provider in your area.\n\n` +
    `— Team Seva Setu`;

  return sendWhatsAppMessage(user.phone, message);
};

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  sendProviderRegistrationConfirmation,
  sendBookingRequestToProvider,
  sendBookingStatusToUser,
  toWhatsAppNumber,
};