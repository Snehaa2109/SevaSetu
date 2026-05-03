import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supportAPI } from '../utils/api';
import { useUser } from '../App';

/* ── colour palette (matches RequestService / screenshot) ── */
const cream   = '#f5f0e0';
const white   = '#ffffff';
const brownDk = '#8f4e00';
const brown   = '#c97a2a';
const border  = '#e0d5c5';
const tan     = '#ede8d8';
const textDk  = '#1a1a1a';
const textMid = '#6b6b6b';

const FAQS = [
  {
    q: 'How do I request a helper?',
    a: 'Go to Find Services, select the service type (Maid, Babysitter, or Elderly Care), set your schedule and location, then submit your request.',
  },
  {
    q: 'How are providers verified?',
    a: 'Every Seva Setu provider goes through a multi-layer verification process that includes identity checks, criminal background checks, and past employment verification.',
  },
  {
    q: 'Can I track my booking status?',
    a: 'Yes — visit My Bookings at any time to see the real-time status of all your service requests.',
  },
  {
    q: 'What if I need to reschedule or cancel?',
    a: 'Contact our support team by phone or email and we will update your booking. Cancellations more than 2 hours before the scheduled time carry no charge.',
  },
  {
    q: 'What areas do you currently serve?',
    a: 'We currently operate across Ghaziabad and NCR. Coverage is expanding — enter your area in the request form and we will confirm availability.',
  },
];

export default function Support() {
  const { user }   = useUser();
  const [openFaq, setOpenFaq]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [apiError,  setApiError]    = useState('');
  const [form, setForm] = useState({
    name:    user?.name  || '',
    email:   user?.email || '',
    message: '',
  });
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSubmitting(true);
    setApiError('');
    try {
      await supportAPI.sendMessage(form);
      setSubmitted(true);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.grid}>

        {/* ─── LEFT SIDEBAR ─── */}
        <aside style={S.sidebar}>

          {/* Contact card */}
          <div style={S.contactCard}>
            <p style={S.cardTitle}>Contact Support</p>

            <div style={S.contactItem}>
              <div style={S.contactIcon}>📞</div>
              <div>
                <div style={S.contactLabel}>Phone</div>
                <div style={S.contactValue}>+91 8000 SEVA SETU</div>
              </div>
            </div>

            <div style={S.contactItem}>
              <div style={S.contactIcon}>✉️</div>
              <div>
                <div style={S.contactLabel}>Email</div>
                <div style={S.contactValue}>support@sevasetu.com</div>
              </div>
            </div>

            <div style={S.contactItem}>
              <div style={S.contactIcon}>🕐</div>
              <div>
                <div style={S.contactLabel}>Hours</div>
                <div style={S.contactValue}>Mon – Sat, 8 AM – 8 PM</div>
              </div>
            </div>
          </div>

          {/* Trust card */}
          <div style={S.trustCard}>
            <div style={S.trustBanner}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 17, letterSpacing: 6, display: 'block' }}>VERIFIED</span>
              <span style={{ color: '#ccc', fontWeight: 700, fontSize: 10, letterSpacing: 4, display: 'block', marginTop: 2 }}>SAFEGWORD</span>
            </div>
            <div style={{ padding: '14px 18px 18px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: brown, marginBottom: 8 }}>Trusted Care Guaranteed</h3>
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.75 }}>
                Every concern is addressed within 2 hours by our dedicated support team.
              </p>
              <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: brown }}>
                🛡️ Peace of mind for your family
              </div>
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main style={S.main}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={S.h1}>How can we help you?</h1>
            <p style={S.sub}>Our support team is here every step of the way.</p>
          </div>


          {/* FAQ accordion */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={S.sectionTitle}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQS.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} style={{ ...S.faqItem, border: open ? `1.5px solid ${brown}` : `1px solid ${border}` }}>
                    <button
                      style={S.faqQ}
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                    >
                      <span>{faq.q}</span>
                      <span style={{
                        fontSize: 18, color: brown,
                        transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform .2s',
                        flexShrink: 0,
                      }}>+</span>
                    </button>
                    {open && (
                      <div style={S.faqA}>{faq.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact form */}
          <div style={S.formCard}>
            <h2 style={S.sectionTitle}>Send us a message</h2>
            {submitted ? (
              <div style={S.successBox}>
                <span style={{ fontSize: 28 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Message received!</div>
                  <div style={{ fontSize: 13, color: textMid }}>We'll get back to you within 2 hours.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={S.formRow}>
                  <div>
                    <label style={S.label}>Your Name</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      style={S.input}
                    />
                  </div>
                </div>
                <div>
                  <label style={S.label}>Your Message</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue or question…"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                    style={S.textarea}
                  />
                </div>
                {apiError && (
                  <div style={{ fontSize: 13, color: '#c0392b', background: '#fff0f0', padding: '8px 12px', borderRadius: 8 }}>
                    {apiError}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={submitting} style={{ ...S.submitBtn, opacity: submitting ? .7 : 1 }}>
                    {submitting ? 'Sending…' : 'Send Message →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      {/* ─── FOOTER ─── */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div>
            <div style={S.footerBrand}>Seva Setu</div>
            <div style={S.footerCopy}>© 2024 SEVA SETU. SANCTUARY OF RELIABLE CARE.</div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Terms of Service', 'Privacy Policy', 'Safety Center', 'Contact Us'].map(l => (
              <span key={l} style={S.footerLink}>{l.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── styles ─── */
const S = {
  page: {
    minHeight: '100vh',
    background: cream,
    paddingTop: 56,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter','Manrope',sans-serif",
  },
  grid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: 32,
    maxWidth: 1060,
    margin: '0 auto',
    padding: '36px 28px 32px',
    width: '100%',
    alignItems: 'start',
  },

  /* Sidebar */
  sidebar: { display: 'flex', flexDirection: 'column', gap: 20 },

  contactCard: {
    background: tan,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: '18px 18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  cardTitle: { fontWeight: 700, fontSize: 14, color: textDk, marginBottom: 4 },
  contactItem: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  contactIcon: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  contactLabel: { fontSize: 11, color: textMid, marginBottom: 2 },
  contactValue: { fontSize: 13, fontWeight: 700, color: textDk },

  trustCard: {
    background: tan,
    border: `1.5px solid ${brown}`,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trustBanner: {
    background: '#1a1a1a',
    padding: '14px 20px',
    textAlign: 'center',
  },

  /* Main */
  main: { display: 'flex', flexDirection: 'column' },
  h1: {
    fontSize: 28,
    fontWeight: 800,
    color: textDk,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    marginBottom: 6,
  },
  sub: { fontSize: 14, color: textMid },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: textDk,
    marginBottom: 14,
  },

  quickRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 28,
  },
  quickCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: white,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: '14px 16px',
    textDecoration: 'none',
    transition: 'border-color .2s, box-shadow .2s',
  },
  quickIcon: { fontSize: 20 },
  quickLabel: { fontSize: 14, fontWeight: 600, color: textDk },

  faqItem: {
    background: white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqQ: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '15px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 600,
    color: textDk,
    fontFamily: 'inherit',
  },
  faqA: {
    padding: '0 16px 16px',
    fontSize: 13,
    color: textMid,
    lineHeight: 1.75,
    borderTop: `1px solid ${border}`,
    paddingTop: 12,
  },

  formCard: {
    background: white,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: '22px 20px',
  },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: textDk,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: '#fafaf6',
    fontSize: 13,
    color: '#333',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: '#fafaf6',
    fontSize: 13,
    color: '#444',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
    lineHeight: 1.65,
    boxSizing: 'border-box',
  },
  submitBtn: {
    background: brown,
    color: white,
    border: 'none',
    borderRadius: 999,
    padding: '12px 30px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(180,100,20,.28)',
  },
  successBox: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    background: '#f0faf0',
    border: '1px solid #a3d8a3',
    borderRadius: 12,
    padding: '18px 20px',
  },

  /* Footer */
  footer: {
    background: cream,
    borderTop: `1px solid ${border}`,
    padding: '26px 28px',
    marginTop: 8,
  },
  footerInner: {
    maxWidth: 1060,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
  },
  footerBrand: {
    fontWeight: 800,
    fontSize: 16,
    color: textDk,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    marginBottom: 4,
  },
  footerCopy: { fontSize: 10, color: '#aaa', letterSpacing: 0.8 },
  footerLink: { fontSize: 10, fontWeight: 600, color: '#999', letterSpacing: 0.8, cursor: 'pointer' },
};
