import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, useUser } from '../App';

export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const showToast = useToast();

  const handleLogout = () => {
    logout();
    showToast('You have been logged out', 'info');
    navigate('/login');
  };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--light)' }}>
      <div className="container" style={{ maxWidth: 760, padding: '40px 20px 80px' }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', marginBottom: 8 }}>My Profile</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, margin: 0 }}>Your account details</h1>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '14px 24px' }}>
              Logout
            </button>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ color: 'var(--mid)', fontSize: 13 }}>Name</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.name || 'Guest'}</div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ color: 'var(--mid)', fontSize: 13 }}>Phone</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.phone || 'Not available'}</div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ color: 'var(--mid)', fontSize: 13 }}>Email</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.email || 'Not available'}</div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ color: 'var(--mid)', fontSize: 13 }}>Need help?</div>
              <div style={{ fontSize: 14, color: 'var(--brand)' }}>support@sevasetu.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
