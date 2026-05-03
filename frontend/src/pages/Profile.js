import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, useUser } from '../App';
import { profileAPI } from '../utils/api';
import { GZB_AREAS } from '../utils/constants';

/* ── colour tokens (matches rest of app) ── */
const cream   = '#f5f0e0';
const white   = '#ffffff';
const brown   = '#c97a2a';
const border  = '#e0d5c5';
const tan     = '#ede8d8';
const textDk  = '#1a1a1a';
const textMid = '#6b6b6b';

export default function Profile() {
  const { user, saveUser, logout } = useUser();
  const navigate   = useNavigate();
  const showToast  = useToast();
  const [editing,  setEditing]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    email:   user?.email   || '',
    area:    user?.area    || '',
    address: user?.address || '',
  });

  const initials = (user?.name || 'U')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    setLoading(true);
    try {
      const res = await profileAPI.update(form);
      saveUser(res.data.user);
      showToast('Profile updated successfully!', 'success');
      setEditing(false);
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('You have been logged out', 'info');
    navigate('/login');
  };

  return (
    <div style={S.page}>
      <div style={S.grid}>

        {/* ── LEFT: Avatar card ── */}
        <aside style={S.sidebar}>
          <div style={S.avatarCard}>
            <div style={S.avatarCircle}>
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span style={{ fontSize: 32, fontWeight: 800, color: white }}>{initials}</span>
              }
            </div>
            <div style={S.avatarName}>{user?.name || 'User'}</div>
            <div style={S.avatarRole}>{user?.role || 'USER'}</div>
            <div style={S.avatarBadge}>
              {user?.isVerified ? '✅ Verified Account' : '⏳ Unverified'}
            </div>
          </div>

          <div style={S.quickCard}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Quick Links</p>
            {[
              { label: '📋 My Bookings',     to: '/my-bookings'      },
              { label: '🔧 Request Service', to: '/request-service'  },
              { label: '🆘 Support',          to: '/support'          },
            ].map(l => (
              <button
                key={l.to}
                style={S.quickLink}
                onClick={() => navigate(l.to)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button onClick={handleLogout} style={S.logoutBtn}>
            Sign out
          </button>
        </aside>

        {/* ── RIGHT: Profile details ── */}
        <main>
          <div style={{ marginBottom: 24 }}>
            <h1 style={S.h1}>Your Profile</h1>
            <p style={{ fontSize: 14, color: textMid }}>Manage your personal information</p>
          </div>

          <div style={S.card}>
            <div style={S.cardHeader}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Account Information</span>
              {!editing && (
                <button style={S.editBtn} onClick={() => setEditing(true)}>
                  ✏️ Edit
                </button>
              )}
            </div>

            {editing ? (
              /* ─ EDIT FORM ─ */
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={S.formRow}>
                  <div>
                    <label style={S.label}>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required style={S.input} placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={S.label}>Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange} style={S.input} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>

                <div>
                  <label style={S.label}>Email Address</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} style={S.input} placeholder="name@example.com" />
                </div>

                <div style={S.formRow}>
                  <div>
                    <label style={S.label}>Area</label>
                    <select name="area" value={form.area} onChange={handleChange} style={S.input}>
                      <option value="">Select your area</option>
                      {GZB_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Address</label>
                    <input name="address" value={form.address} onChange={handleChange} style={S.input} placeholder="Street, sector, city" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" style={S.cancelBtn} onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} style={{ ...S.saveBtn, opacity: loading ? .7 : 1 }}>
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              /* ─ VIEW MODE ─ */
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { icon: '👤', label: 'Full Name',   value: user?.name    || '—' },
                  { icon: '📞', label: 'Phone',        value: user?.phone   || 'Not set' },
                  { icon: '✉️', label: 'Email',        value: user?.email   || 'Not set' },
                  { icon: '📍', label: 'Area',         value: user?.area    || 'Not set' },
                  { icon: '🏠', label: 'Address',      value: user?.address || 'Not set' },
                ].map(row => (
                  <div key={row.label} style={S.fieldRow}>
                    <div style={S.fieldLabel}>{row.icon} {row.label}</div>
                    <div style={S.fieldValue}>{row.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account meta */}
          <div style={{ ...S.card, marginTop: 16 }}>
            <div style={S.cardHeader}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Account Details</span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { label: 'Account Type',  value: user?.role   || 'USER'  },
                { label: 'Status',        value: user?.status || 'active' },
                { label: 'Verification',  value: user?.isVerified ? 'Verified ✅' : 'Pending ⏳' },
              ].map(row => (
                <div key={row.label} style={S.fieldRow}>
                  <div style={S.fieldLabel}>{row.label}</div>
                  <div style={{ ...S.fieldValue, textTransform: 'capitalize' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Seva Setu</div>
            <div style={{ fontSize: 10, color: '#aaa', letterSpacing: 0.8 }}>© 2024 SEVA SETU. SANCTUARY OF RELIABLE CARE.</div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Terms of Service', 'Privacy Policy', 'Safety Center', 'Contact Us'].map(l => (
              <span key={l} style={{ fontSize: 10, fontWeight: 600, color: '#999', letterSpacing: 0.8, cursor: 'pointer' }}>{l.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

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
    gridTemplateColumns: '220px 1fr',
    gap: 28,
    maxWidth: 960,
    margin: '0 auto',
    padding: '36px 28px 32px',
    width: '100%',
    alignItems: 'start',
  },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 16 },
  avatarCard: {
    background: tan,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: '28px 18px 22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 72, height: 72,
    borderRadius: '50%',
    background: '#8f4e00',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  avatarName: { fontWeight: 800, fontSize: 15, color: textDk },
  avatarRole: { fontSize: 11, color: textMid, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  avatarBadge: { fontSize: 11, color: brown, fontWeight: 600, marginTop: 4 },
  quickCard: {
    background: tan,
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: '16px 14px',
  },
  quickLink: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: textDk,
    padding: '8px 4px',
    borderBottom: `1px solid ${border}`,
    fontFamily: 'inherit',
  },
  logoutBtn: {
    background: 'none',
    border: `1px solid #e0bcbc`,
    color: '#c0392b',
    borderRadius: 10,
    padding: '10px 0',
    width: '100%',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  h1: {
    fontSize: 26,
    fontWeight: 800,
    color: textDk,
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    marginBottom: 4,
  },
  card: {
    background: white,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: '20px 20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  editBtn: {
    background: 'none',
    border: `1px solid ${border}`,
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    color: brown,
    fontFamily: 'inherit',
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${border}`,
    paddingBottom: 10,
  },
  fieldLabel: { fontSize: 12, color: textMid, fontWeight: 600 },
  fieldValue: { fontSize: 14, fontWeight: 700, color: textDk },

  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: textDk, marginBottom: 6 },
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
  cancelBtn: {
    background: 'none',
    border: `1px solid ${border}`,
    borderRadius: 999,
    padding: '10px 22px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    color: textMid,
    fontFamily: 'inherit',
  },
  saveBtn: {
    background: brown,
    color: white,
    border: 'none',
    borderRadius: 999,
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  footer: {
    background: cream,
    borderTop: `1px solid ${border}`,
    padding: '24px 28px',
    marginTop: 8,
  },
  footerInner: {
    maxWidth: 960,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
  },
};
