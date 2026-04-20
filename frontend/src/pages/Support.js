import React from 'react';
import { Link } from 'react-router-dom';

export default function Support() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--light)' }}>
      <div className="container" style={{ maxWidth: 820, padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', marginBottom: 10 }}>Seva Setu Support</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 14 }}>Need help with your request?</h1>
            <p style={{ color: 'var(--mid)', fontSize: 16, lineHeight: 1.8 }}>
              Our customer support team is here for households who need fast, trustworthy help. Reach out for booking assistance, status updates, or general questions.
            </p>
          </div>
          <div style={{ minWidth: 260, padding: 24, borderRadius: 24, background: 'white', boxShadow: 'var(--shadow)' }}>
            <div style={{ marginBottom: 18, fontWeight: 700, fontSize: 16 }}>Contact details</div>
            <div style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 16 }}>Call us or send a message and our team will respond quickly.</div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ borderRadius: 16, padding: 18, background: 'var(--brand-pale)' }}>
                <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 6 }}>Phone</div>
                <div style={{ fontWeight: 700 }}>+91 8000 SEVA SETU</div>
              </div>
              <div style={{ borderRadius: 16, padding: 18, background: 'var(--brand-pale)' }}>
                <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 6 }}>Email</div>
                <div style={{ fontWeight: 700 }}>support@sevasetu.com</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          {[
            { question: 'How do I request a helper?', answer: 'Go to Request Service, select the service type, choose a date and time, and submit your request. We will connect you with a verified helper.' },
            { question: 'Can I track my booking status?', answer: 'Yes. Visit My Bookings anytime to see the current status of your request.' },
            { question: 'What if I need to change my address?', answer: 'Contact support using the phone or email details above, and we will help update your request.' },
          ].map((item) => (
            <div key={item.question} style={{ background: 'white', borderRadius: 18, padding: 24, boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{item.question}</div>
              <div style={{ color: 'var(--mid)', fontSize: 14, lineHeight: 1.8 }}>{item.answer}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 42, textAlign: 'center' }}>
          <Link to="/request-service" className="btn btn-primary" style={{ padding: '14px 24px' }}>
            Request Service Now
          </Link>
        </div>
      </div>
    </div>
  );
}
