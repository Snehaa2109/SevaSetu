import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import { useToast, useUser } from '../App';
import { GZB_AREAS, SERVICE_CATEGORIES, STATUS_COLORS } from '../utils/constants';

const SERVICE_ICON_MAP = {
  Babysitter: 'child_care',
  Maid: 'cleaning_services',
  'House Maid': 'cleaning_services',
  Cleaning: 'cleaning_services',
  'Household Helper': 'home_repair_service',
  Plumbing: 'plumbing',
  Electrical: 'electrical_services',
  Carpentry: 'carpenter',
  Painting: 'format_paint',
  'AC Repair': 'ac_unit',
  'Appliance Repair': 'construction',
  'Beauty & Wellness': 'spa',
  Tutoring: 'school',
  Catering: 'restaurant',
  Other: 'home_health',
};

const ACTIVE_STATUSES = new Set(['pending', 'accepted', 'matched', 'in_progress']);



const formatBookingDate = (date) => {
  if (!date) return 'Date to be confirmed';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Date to be confirmed';
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const normalizeStatus = (status) => (status || 'pending').toLowerCase();

const getStatusMeta = (status) => {
  const key = normalizeStatus(status);
  if (key === 'matched') {
    return {
      bg: 'var(--stitch-tertiary-container)',
      text: 'var(--stitch-on-tertiary-container)',
      label: 'Matched',
    };
  }
  return STATUS_COLORS[key] || STATUS_COLORS.pending;
};

export default function Dashboard() {
  const { user } = useUser();
  const showToast = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      showToast('Please log in to view your dashboard.', 'error');
      navigate('/landing');
    }
  }, [navigate, showToast, user]);

  useEffect(() => {
    if (user?.area && GZB_AREAS.includes(user.area)) {
      setSelectedArea(user.area);
    } else if (!selectedArea) {
      setSelectedArea(GZB_AREAS[0]);
    }
  }, [selectedArea, user]);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const res = await bookingAPI.getUserBookings();
        setBookings(res.data.bookings || []);
      } catch (err) {
        // silent on poll failures — only show error on first load
      }
    };

    // Fetch immediately on mount
    setLoading(true);
    fetchBookings().finally(() => setLoading(false));

    // Then poll every 30 seconds so status updates from WhatsApp show up automatically
    const interval = setInterval(fetchBookings, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Remove this booking?')) return;
    setDeletingId(bookingId);
    try {
      await bookingAPI.deleteBooking(bookingId);
      // Optimistic update — remove instantly from local state
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      showToast('Booking removed', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not delete booking', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const bookingsForArea = useMemo(() => {
    if (!selectedArea) return bookings;
    return bookings.filter((booking) => {
      const regionText = `${booking.area || ''} ${booking.address || ''} ${booking.location || ''}`.toLowerCase();
      return !regionText.trim() || regionText.includes(selectedArea.toLowerCase());
    });
  }, [bookings, selectedArea]);

  // Active requests — show ALL active bookings regardless of selected area.
  // (booking.address is a free-text field that doesn't reliably match area names)
  const activeBookings = bookings.filter((booking) => ACTIVE_STATUSES.has(normalizeStatus(booking.status)));

  // Past activity filtered by area (best-effort)
  const pastBookings = bookingsForArea.filter((booking) => !ACTIVE_STATUSES.has(normalizeStatus(booking.status)));
  const firstName = user?.name?.split(' ')[0] || 'Guest';
  const initials = (user?.name || 'Guest')
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const availableServices = SERVICE_CATEGORIES.slice(0, 8);

  if (!user) {
    return null;
  }

  return (
    <main className="stitch-dashboard-page">
      <section className="stitch-dashboard-shell">
        <header className="stitch-dashboard-hero">
          <div className="stitch-dashboard-hero-pattern">
            <span className="material-symbols-outlined">home_health</span>
          </div>
          <div className="stitch-dashboard-hero-copy">
            <h1>Welcome back, {firstName}</h1>
            <p>Manage your service requests easily</p>
          </div>
          <Link to="/request-service" className="stitch-dashboard-primary-action">
            <span className="material-symbols-outlined">add_circle</span>
            <strong>Book a New Service</strong>
          </Link>
        </header>

        <section className="stitch-dashboard-profile-grid">
          <article className="stitch-dashboard-profile-card">
            <div className="stitch-dashboard-avatar">{initials}</div>
            <div>
              <span>User Profile Overview</span>
              <h2>{user.name}</h2>
              <p>{user.email || 'Email not added'} - {user.phone || 'Phone not added'}</p>
            </div>
          </article>

          <article className="stitch-dashboard-location-card">
            <div>
              <span>Location Awareness</span>
              <h3>{selectedArea}</h3>
              <p>Services filtered for your Ghaziabad region.</p>
            </div>
            <label>
              <span>Change region</span>
              <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
                {GZB_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>
          </article>
        </section>

        <div className="stitch-dashboard-grid">
          <section className="stitch-dashboard-section stitch-dashboard-active">
            <div className="stitch-dashboard-section-heading">
              <h2>
                <span />
                Active Requests
              </h2>
              <Link to="/my-bookings">View all</Link>
            </div>

            {loading ? (
              <div className="stitch-dashboard-empty">Loading your current services...</div>
            ) : activeBookings.length === 0 ? (
              <div className="stitch-dashboard-empty">
                No active services in {selectedArea}. Book a new service to get matched with a verified helper.
              </div>
            ) : (
              <div className="stitch-dashboard-request-grid">
                {activeBookings.slice(0, 3).map((booking) => {
                  const status = getStatusMeta(booking.status);
                  const serviceType = booking.serviceType || 'Service Request';
                  return (
                    <article className="stitch-dashboard-request-card" key={booking._id}>
                      <div className="stitch-dashboard-request-top">
                        <div className="stitch-dashboard-request-icon">
                          <span className="material-symbols-outlined">{SERVICE_ICON_MAP[serviceType] || 'home_health'}</span>
                        </div>
                        <span className="stitch-dashboard-status" style={{ background: status.bg, color: status.text }}>
                          {status.label}
                        </span>
                      </div>
                      <h3>{serviceType}</h3>
                      <p>
                        <span className="material-symbols-outlined">calendar_today</span>
                        Requested for {formatBookingDate(booking.date)}
                      </p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                        <Link to="/my-bookings">View Details</Link>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          disabled={deletingId === booking._id}
                          title="Remove booking"
                          style={{
                            marginLeft: 'auto', background: 'none', border: '1px solid #fca5a5',
                            borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
                            color: '#ef4444', display: 'flex', alignItems: 'center', gap: 2,
                            fontSize: 12, opacity: deletingId === booking._id ? 0.5 : 1,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                          {deletingId === booking._id ? '…' : 'Remove'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="stitch-dashboard-service-panel">
            <div className="stitch-dashboard-section-heading compact">
              <h2>
                <span />
                Available Nearby
              </h2>
            </div>
            <div className="stitch-dashboard-service-chips">
              {availableServices.map((service) => (
                <Link key={service} to="/request-service">
                  <span className="material-symbols-outlined">{SERVICE_ICON_MAP[service] || 'home_health'}</span>
                  {service}
                </Link>
              ))}
            </div>
          </aside>

          <section className="stitch-dashboard-section stitch-dashboard-past">
            <div className="stitch-dashboard-section-heading tertiary">
              <h2>
                <span />
                Past Activity
              </h2>
            </div>
            <div className="stitch-dashboard-activity-list">
              {loading ? (
                <div className="stitch-dashboard-empty">Loading past activity…</div>
              ) : pastBookings.length === 0 ? (
                <div className="stitch-dashboard-empty" style={{ padding: '32px 0', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#c97a2a', display: 'block', marginBottom: 8 }}>history</span>
                  No past activity yet. Completed bookings will appear here.
                </div>
              ) : (
                pastBookings.slice(0, 4).map((booking) => {
                  const status = getStatusMeta(booking.status);
                  const serviceType = booking.serviceType || 'Service Request';
                  return (
                    <article className="stitch-dashboard-activity-row" key={booking._id}>
                      <div className="stitch-dashboard-activity-main">
                        <div className="stitch-dashboard-activity-thumb">
                          <span className="material-symbols-outlined">{SERVICE_ICON_MAP[serviceType] || 'home_health'}</span>
                        </div>
                        <div>
                          <h3>{serviceType}</h3>
                          <p>Completed on {formatBookingDate(booking.date || booking.createdAt)}</p>
                        </div>
                      </div>
                      <div className="stitch-dashboard-activity-actions">
                        <span className="stitch-dashboard-status" style={{ background: status.bg, color: status.text }}>
                          {status.label}
                        </span>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          disabled={deletingId === booking._id}
                          title="Remove booking"
                          style={{
                            background: 'none', border: '1px solid #fca5a5',
                            borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
                            color: '#ef4444', display: 'flex', alignItems: 'center', gap: 2,
                            fontSize: 12, opacity: deletingId === booking._id ? 0.5 : 1,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                          {deletingId === booking._id ? '…' : 'Remove'}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
