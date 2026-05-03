import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../utils/api';
import { GZB_AREAS } from '../utils/constants';
import { useToast, useUser } from '../App';

export default function BookingModal({ provider, onClose }) {
  const showToast = useToast();
  const { user } = useUser();
  const [form, setForm] = useState({
    userName: '',
    userPhone: '',
    userAddress: '',
    area: '',
    serviceRequired: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        userName: user.name || prev.userName,
        userPhone: user.phone || prev.userPhone,
        userAddress: user.address || prev.userAddress,
        area: user.area || prev.area,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.userPhone || !form.userAddress || !form.area || !form.serviceRequired || !form.scheduledDate || !form.scheduledTime) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await bookingAPI.create({ ...form, providerId: provider._id });
      setSuccess(res.data);
      showToast('Booking request sent!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>
              Booking Requested!
            </h2>
            <p style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 24 }}>
              Your request has been sent to <strong>{provider.name}</strong>. 
              You'll be contacted shortly to confirm.
            </p>

            <a
              href={success.whatsappURL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: '#25D366', color: 'white', padding: '14px 24px',
                borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 15,
                marginBottom: 12, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
              }}
            >
              <span style={{ fontSize: 20 }}>💬</span>
              Also Send via WhatsApp
            </a>

            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Book Service</h2>
                <p style={{ color: 'var(--mid)', fontSize: 13 }}>
                  with {provider.name} · {provider.serviceCategory}
                </p>
                <p style={{ color: 'var(--mid)', fontSize: 12, marginTop: 6 }}>
                  {user ? 'Using your saved profile details.' : 'Login or fill in your details to save them for future bookings.'}
                </p>
              </div>
              <button onClick={onClose} style={{
                background: 'var(--light)', border: 'none', width: 32, height: 32,
                borderRadius: 8, cursor: 'pointer', fontSize: 16, color: 'var(--mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input name="userName" value={form.userName} onChange={handleChange}
                    placeholder="Rahul Sharma" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input name="userPhone" value={form.userPhone} onChange={handleChange}
                    placeholder="98765 43210" className="form-input" type="tel" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Area *</label>
                <select name="area" value={form.area} onChange={handleChange} className="form-input">
                  <option value="">Select your area</option>
                  {GZB_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <input name="userAddress" value={form.userAddress} onChange={handleChange}
                  placeholder="House no., Street, Locality" className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">What do you need? *</label>
                <textarea name="serviceRequired" value={form.serviceRequired} onChange={handleChange}
                  placeholder={`Describe your ${provider.serviceCategory} requirement...`}
                  className="form-input" rows={2}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input name="scheduledDate" type="date" value={form.scheduledDate}
                    onChange={handleChange} className="form-input" min={today} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <select name="scheduledTime" value={form.scheduledTime}
                    onChange={handleChange} className="form-input">
                    <option value="">Select time</option>
                    {['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
                      '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM'].map(t =>
                      <option key={t} value={t}>{t}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  placeholder="Any special instructions..." className="form-input"
                  rows={2} style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={onClose}
                  style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}
                  style={{ flex: 2 }}>
                  {loading ? 'Sending...' : '📨 Send Booking Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
