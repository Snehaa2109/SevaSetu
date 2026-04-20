import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../App';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useUser();

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/request-service', label: 'Request Service' },
    { to: '/support', label: 'Support' },
  ];

  const landingLinks = [
    { to: '/landing#story', label: 'Our Story' },
    { to: '/landing#services', label: 'Services' },
    { to: '/landing#support', label: 'Safety' },
  ];

  if (['/login', '/signup', '/auth/success'].includes(location.pathname)) {
    return null;
  }

  if (location.pathname === '/dashboard') {
    const initials = (user?.name || 'U')
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <nav className="stitch-dashboard-nav">
        <div className="stitch-dashboard-nav-inner">
          <Link to="/landing" className="stitch-dashboard-nav-brand">
            Seva Setu
          </Link>
          <div className="stitch-dashboard-nav-links">
            <Link to="/dashboard" className="active">
              Dashboard
            </Link>
            <Link to="/request-service">Services</Link>
            <Link to="/support">Support</Link>
          </div>
          <div className="stitch-dashboard-nav-actions">
            <Link to="/request-service" className="stitch-dashboard-nav-button">
              <span className="material-symbols-outlined">add</span>
              New
            </Link>
            <Link to="/profile" className="stitch-dashboard-nav-avatar" aria-label="Open profile">
              {user?.avatar ? <img src={user.avatar} alt={user.name || 'User profile'} /> : <span>{initials}</span>}
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  if (location.pathname === '/landing' || location.pathname === '/') {
    return (
      <nav className="stitch-navbar">
        <div className="stitch-nav-inner">
          <Link to="/landing" className="stitch-nav-brand">
            Seva Setu
          </Link>

          <div className="stitch-nav-links">
            {landingLinks.map((link) => (
              <a key={link.to} href={link.to}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="stitch-nav-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="stitch-nav-login">
                  Dashboard
                </Link>
                <button type="button" className="stitch-nav-join" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="stitch-nav-login">
                  Login
                </Link>
                <Link to="/signup" className="stitch-nav-join">
                  Join Community
                </Link>
              </>
            )}
          </div>

          <button
            className="navbar-hamburger stitch-nav-menu-button"
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {menuOpen && (
          <div className="stitch-mobile-menu">
            {landingLinks.map((link) => (
              <a key={link.to} href={link.to}>
                {link.label}
              </a>
            ))}
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button type="button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup" className="stitch-nav-join">
                  Join Community
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <div className="brand-mark">SS</div>
          <div>
            <div className="brand-title">Seva Setu</div>
            <div className="brand-subtitle">Trusted Care</div>
          </div>
        </Link>

        <div className="navbar-links desktop-nav">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-link ${active ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="navbar-actions desktop-nav">
          <Link to="/request-service" className="btn btn-primary btn-cta">
            Book Now
          </Link>

          {user ? (
            <div className="profile-menu">
              <button
                type="button"
                className="profile-button"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <Link to="/profile" className="profile-dropdown-link">
                    Profile
                  </Link>
                  <button type="button" className="profile-dropdown-link" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          className="navbar-hamburger"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-mobile-link ${active ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link to="/request-service" className="btn btn-primary btn-block">
            Book Now
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="navbar-mobile-link">
                Profile
              </Link>
              <button type="button" className="navbar-mobile-link" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <> 
              <Link to="/login" className="navbar-mobile-link">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-block">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
