import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../App';

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useUser();
  const dropRef = useRef(null);

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Never show on auth pages
  if (['/login', '/signup', '/auth/success'].includes(location.pathname)) return null;

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // ── The three nav links the user wants ──
  const NAV_LINKS = [
    { to: '/dashboard',       label: 'Dashboard' },
    { to: '/request-service', label: 'Services'  },
    { to: '/support',         label: 'Support'   },
  ];

  return (
    <nav style={S.nav}>
      <div style={S.inner}>

        {/* Brand */}
        <Link to={user ? '/dashboard' : '/landing'} style={S.brand}>Seva Setu</Link>

        {/* Centre – Dashboard / Services / Support */}
        <div style={S.links}>
          {NAV_LINKS.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  ...S.link,
                  color:      active ? '#8f4e00' : '#2a2a2a',
                  fontWeight: active ? 700       : 500,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right – avatar / login buttons */}
        <div style={S.actions}>

          {user ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                style={S.avatar}
                onClick={() => setProfileOpen((p) => !p)}
                aria-label="Open profile menu"
              >
                {user.avatar
                  ? <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  : <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{initials}</span>
                }
              </button>
              {profileOpen && (
                <div style={S.dropdown}>
                  <Link to="/profile"     style={S.dropItem}>Profile</Link>
                  <button
                    style={{ ...S.dropItem, width: '100%', textAlign: 'left', color: '#c0392b', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    onClick={() => { logout(); navigate('/landing'); }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 4 }}>
              <Link to="/login"  style={S.loginBtn}>Login</Link>
              <Link to="/signup" style={S.joinBtn}>Sign Up</Link>
            </div>
          )}

          {/* Hamburger – only visible on small screens via CSS class */}
          <button
            className="navbar-hamburger"
            style={{ marginLeft: 8 }}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu" style={{ display: 'flex' }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="navbar-mobile-link">{l.label}</Link>
          ))}
          {user ? (
                      <>
              <Link to="/profile"     className="navbar-mobile-link">Profile</Link>
              <button
                className="navbar-mobile-link"
                style={{ background: 'none', border: 'none', color: '#c0392b', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer' }}
                onClick={() => { logout(); navigate('/landing'); }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="navbar-mobile-link">Login</Link>
              <Link to="/signup" className="navbar-mobile-link">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

/* ── Icon components ── */
const BellIcon  = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const ChatIcon  = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const HeartIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/* ── Styles – cream background matching the screenshot ── */
const S = {
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 999,
    background: '#f5f0e0',
    borderBottom: '1px solid #e8dfc8',
    fontFamily: "'Inter','Manrope',sans-serif",
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    gap: 24,
  },
  brand: {
    fontSize: 18,
    fontWeight: 800,
    color: '#c97a2a',
    textDecoration: 'none',
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    flexShrink: 0,
  },
  links: {
    display: 'flex',
    gap: 28,
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    textDecoration: 'none',
    transition: 'color .15s',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 7px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: '#2a2a2a',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: 6,
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 42,
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 8px 32px rgba(0,0,0,.12)',
    border: '1px solid #e8dfc8',
    minWidth: 160,
    overflow: 'hidden',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
  },
  dropItem: {
    display: 'block',
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#2a2a2a',
    textDecoration: 'none',
  },
  loginBtn: {
    fontSize: 14,
    fontWeight: 500,
    color: '#2a2a2a',
    textDecoration: 'none',
    padding: '6px 10px',
  },
  joinBtn: {
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    background: '#c97a2a',
    textDecoration: 'none',
    padding: '7px 16px',
    borderRadius: 999,
  },
};
