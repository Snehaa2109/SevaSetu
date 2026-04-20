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

const fallbackPastActivity = [
  {
    _id: 'fallback-cleaning',
    serviceType: 'General House Cleaning',
    status: 'completed',
    date: '2024-10-12',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA92XZCEqat5z6_lH9m1LxLkPc-oXfsvmTcIKmK2uCFMxF1y7I9UMKFv-UrIMUAfCujEjUHq8GOIy_WDH0iVBxqODX0ZzftEQUb7MYVyTuaFFP6BSJHyhhuwB7QQ3rqOtI67dkNEJm21BHjNivtbpmCeOlPjsJG-xlB8htHQZ40k5R4hQfutNwRlDxczl1Xde83MorKEdVDiJNgZPlM-VtJ5DnKYk_3HYmNvcIeO38CF995pcTiRay0ChiuESK5Qq0sAkOD6bIAm2UH',
  },
  {
    _id: 'fallback-yoga',
    serviceType: 'Personal Yoga Sessions',
    status: 'completed',
    date: '2024-09-30',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAsW_2TQj7QEh_wDyky1UrSTmKYDygo1ey5pQHFbD3pP9jlMekNL05uDU4BZXqQNx4mravq21IoDodF6j692t1k5yDTB3_bETPKE26b3QiQHFXdeDmu8T-nlpw0kqcurk6KPuViFrklKAgMDyOFDs37mRhc9oDbFSDasXTAGGZiw_eD7NSYKeBCGZk1vgPbp3-4cnYzVPW26GfvPSZqLbAvwsIXBdshBLAGaS3C7L6yXtvObThTuCcFFcR-rcVFa-dYCG4RcT1KyB6K',
  },
];

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
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingAPI.getUserBookings();
        setBookings(res.data.bookings || []);
      } catch (err) {
        showToast('Unable to load your booking history', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBookings();
  }, [showToast, user]);

  const bookingsForArea = useMemo(() => {
    if (!selectedArea) return bookings;
    return bookings.filter((booking) => {
      const regionText = `${booking.area || ''} ${booking.address || ''} ${booking.location || ''}`.toLowerCase();
      return !regionText.trim() || regionText.includes(selectedArea.toLowerCase());
    });
  }, [bookings, selectedArea]);

  const activeBookings = bookingsForArea.filter((booking) => ACTIVE_STATUSES.has(normalizeStatus(booking.status)));
  const pastBookings = bookingsForArea.filter((booking) => !ACTIVE_STATUSES.has(normalizeStatus(booking.status)));
  const visiblePastBookings = pastBookings.length ? pastBookings : fallbackPastActivity;
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
                      <Link to="/my-bookings">View Details</Link>
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
              {visiblePastBookings.slice(0, 4).map((booking) => {
                const status = getStatusMeta(booking.status);
                const serviceType = booking.serviceType || 'Service Request';
                return (
                  <article className="stitch-dashboard-activity-row" key={booking._id}>
                    <div className="stitch-dashboard-activity-main">
                      <div className="stitch-dashboard-activity-thumb">
                        {booking.image ? (
                          <img src={booking.image} alt={serviceType} />
                        ) : (
                          <span className="material-symbols-outlined">{SERVICE_ICON_MAP[serviceType] || 'home_health'}</span>
                        )}
                      </div>
                      <div>
                        <h3>{serviceType}</h3>
                        <p>Completed on {formatBookingDate(booking.date)}</p>
                      </div>
                    </div>
                    <div className="stitch-dashboard-activity-actions">
                      <span className="stitch-dashboard-status" style={{ background: status.bg, color: status.text }}>
                        {status.label}
                      </span>
                      <Link to="/support">
                        <span className="material-symbols-outlined">rate_review</span>
                        Add Review
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
