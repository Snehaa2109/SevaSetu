/**
 * WhatsApp Webhook Controller
 *
 * Twilio POSTs here when the provider responds to the booking notification.
 *
 * Handles ALL of the following response formats:
 *   A) ButtonPayload field  — most reliable, set by the template action id
 *   B) Button title text   — "Approve", "Accept", "Yes" / "Reject", "Decline", "No"
 *   C) Text reply          — "ACCEPT A3F9BC" or "REJECT A3F9BC"
 *
 * On approval  → booking.status = 'accepted'  (shows in user dashboard within 30s)
 * On rejection → booking.status = 'rejected'  (moves to Past Activity in dashboard)
 */

const Booking  = require('../models/Booking');
const Provider = require('../models/Provider');
const User     = require('../models/User');
const {
  sendWhatsAppMessage,
  sendBookingStatusToUser,
} = require('../services/whatsapp');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns 'accept' | 'reject' | null from any button payload or body text */
const detectAction = (payload, body) => {
  const p = (payload || '').toLowerCase().trim();
  const b = (body   || '').toLowerCase().trim();

  // Patterns that mean APPROVE
  const approveRx = /\b(accept|approve|yes|confirm|ok)\b/;
  // Patterns that mean REJECT
  const rejectRx  = /\b(reject|decline|no|cancel|deny)\b/;

  // Priority 1 — ButtonPayload field (set by template action id)
  if (approveRx.test(p)) return 'accept';
  if (rejectRx.test(p))  return 'reject';

  // Priority 2 — Body text (button title or manual text)
  if (approveRx.test(b) && !rejectRx.test(b)) return 'accept';
  if (rejectRx.test(b)  && !approveRx.test(b)) return 'reject';

  return null;
};

/** Extract 6-char shortId from text like "ACCEPT A3F9BC" */
const extractShortId = (body) => {
  const m = (body || '').match(/\b([A-Z0-9]{6})\b/i);
  return m ? m[1].toUpperCase() : null;
};

// ── Main handler ──────────────────────────────────────────────────────────────

// Twilio's own sandbox number — status callbacks come FROM this number, not real user replies
const TWILIO_SANDBOX_NUMBER = '+14155238886';

const handleWhatsAppWebhook = async (req, res) => {
  // Always ACK Twilio immediately to prevent retries
  res.set('Content-Type', 'text/xml');
  res.status(200).send('<Response></Response>');

  // Log the full raw payload for debugging
  console.log('[WA Webhook] ── Incoming ──────────────────────────────────');
  console.log('[WA Webhook] Body      :', req.body.Body);
  console.log('[WA Webhook] Payload   :', req.body.ButtonPayload);
  console.log('[WA Webhook] From      :', req.body.From);
  console.log('[WA Webhook] MsgStatus :', req.body.MessageStatus);
  console.log('[WA Webhook] ────────────────────────────────────────────────');

  const rawBody = (req.body.Body          || '').trim();
  const payload = (req.body.ButtonPayload || '').trim();
  const fromWA  = (req.body.From          || '').replace('whatsapp:', '').replace(/\s/g, '');

  // ── Guard: Drop Twilio status callbacks ──────────────────────────────────────
  // Status callbacks come FROM Twilio's own sandbox number with a MessageStatus field.
  // They have no Body or ButtonPayload — processing them wastes messages in a help loop.
  const isTwilioStatusCallback =
    fromWA === TWILIO_SANDBOX_NUMBER ||
    fromWA === TWILIO_SANDBOX_NUMBER.replace('+', '') ||
    !!req.body.MessageStatus;

  if (isTwilioStatusCallback) {
    console.log(`[WA Webhook] ↩ Ignoring status callback (MessageStatus: ${req.body.MessageStatus || 'n/a'})`);
    return;
  }

  // Determine approve / reject action
  const action = detectAction(payload, rawBody);

  if (!action) {
    console.log('[WA Webhook] Unrecognised message — sending help');
    await sendWhatsAppMessage(
      fromWA,
      'Hi! To respond to a booking:\n' +
      '• Tap *Approve* or *Reject* in the booking message, OR\n' +
      '• Type *ACCEPT <BookingID>* or *REJECT <BookingID>*\n\n' +
      'The Booking ID is the 6-character code shown in the notification.'
    );
    return;
  }

  // For text replies like "ACCEPT A3F9BC", extract the shortId
  const shortId  = extractShortId(rawBody.toUpperCase().includes('ACCEPT') || rawBody.toUpperCase().includes('REJECT') ? rawBody : '');
  const newStatus = action === 'accept' ? 'accepted' : 'rejected';

  console.log(`[WA Webhook] Action: ${action}  ShortId: ${shortId || '(button tap — will use latest pending)'}`);

  try {
    // ── 1. Resolve provider from their WhatsApp number ────────────────────────
    const digits  = fromWA.replace(/\D/g, '');
    const last10  = digits.slice(-10);

    console.log(`[WA Webhook] Looking up provider — last10: ${last10}`);

    let provider = await Provider.findOne({
      phone: { $in: [last10, `+91${last10}`, `91${last10}`, digits] },
    });

    if (!provider) {
      const fallbackUser = await User.findOne({
        role: 'PROVIDER',
        phone: { $in: [last10, `+91${last10}`, `91${last10}`, digits] },
      });
      if (fallbackUser) provider = fallbackUser;
    }

    if (!provider) {
      console.warn(`[WA Webhook] ❌ Provider not found for number: ${fromWA}`);
      await sendWhatsAppMessage(
        fromWA,
        `We could not identify your provider account (number: ${fromWA}).\n` +
        'Please contact support@sevasetu.com'
      );
      return;
    }

    console.log(`[WA Webhook] ✅ Provider: ${provider.name} (${provider._id})`);

    // ── 2. Find the booking ───────────────────────────────────────────────────
    const pendingBookings = await Booking.find({
      providerId: provider._id,
      status: 'pending',
    }).sort({ createdAt: -1 }).populate('userId', 'name phone');

    console.log(`[WA Webhook] Pending bookings: ${pendingBookings.length}`);

    let booking;

    if (shortId) {
      // Text mode — match by 6-char ID
      booking = pendingBookings.find(
        (b) => b._id.toString().slice(-6).toUpperCase() === shortId
      );
      if (!booking) {
        await sendWhatsAppMessage(fromWA, `No pending booking found with ID *${shortId}*.`);
        return;
      }
    } else {
      // Button tap — use the most recent pending booking
      if (pendingBookings.length === 0) {
        await sendWhatsAppMessage(fromWA, 'You have no pending booking requests right now.');
        return;
      }
      if (pendingBookings.length > 1) {
        const list = pendingBookings
          .map((b) => `• *${b._id.toString().slice(-6).toUpperCase()}* — ${b.serviceType || 'Service'} (${b.userId?.name || 'Customer'})`)
          .join('\n');
        await sendWhatsAppMessage(
          fromWA,
          `You have *${pendingBookings.length}* pending requests. Reply with the ID:\n\n${list}\n\nExample: *ACCEPT A3F9BC*`
        );
        return;
      }
      booking = pendingBookings[0];
    }

    console.log(`[WA Webhook] Updating booking ${booking._id} → ${newStatus}`);

    // ── 3. Atomically update status in DB ─────────────────────────────────────
    const updated = await Booking.findByIdAndUpdate(
      booking._id,
      { $set: { status: newStatus } },
      { new: true }
    ).populate('userId', 'name phone');

    if (!updated) {
      console.error(`[WA Webhook] ❌ findByIdAndUpdate returned null for ${booking._id}`);
      return;
    }

    console.log(`[WA Webhook] ✅ Booking ${updated._id} → ${updated.status}`);

    // ── 4. Confirm to provider ─────────────────────────────────────────────────
    const customerName = updated.userId?.name || 'the customer';
    const providerMsg  = newStatus === 'accepted'
      ? `✅ You have *accepted* the booking from *${customerName}*. They have been notified.`
      : `❌ You have *declined* the booking from *${customerName}*. They have been notified.`;

    await sendWhatsAppMessage(fromWA, providerMsg);

    // ── 5. Notify customer ─────────────────────────────────────────────────────
    if (updated.userId?.phone) {
      await sendBookingStatusToUser(updated, provider, updated.userId, newStatus);
    }

  } catch (err) {
    console.error('[WA Webhook] ❌ Error:', err.message, '\n', err.stack);
  }
};

module.exports = { handleWhatsAppWebhook };
