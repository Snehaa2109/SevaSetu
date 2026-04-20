import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../utils/api';
import { STATUS_COLORS } from '../utils/constants';
import { useToast, useUser } from '../App';

function BookingCard({ booking, user }) {
  const showToast = useToast();
  const provider = booking.providerId || {};
  const status = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
  const date = new Date(booking.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const openWhatsApp = async () => {
    try {
      const res = await bookingAPI.getWhatsAppLink(booking._id);
      window.open(res.data.whatsappURL, '_blank');
    } catch {
      showToast('Could not get WhatsApp link', 'error');
    }
  };

  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            {provider.name || 'Provider'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--mid)' }}>
            {booking.serviceType || provider.serviceType || 'Service'}
          </div>
        </div>
        <span style={{
          background: status.bg, color: status.text,
          padding: '4px 12px', borderRadius: 100,
          fontSize: 12, fontWeight: 700,
        }}>
          {status.label}
        </span>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        background: 'var(--light)', borderRadius: 10, padding: '12px 14px',
      }}>
        {[
          { icon: '📋', label: 'Service', val: booking.serviceType || provider.serviceType || 'N/A' },
          { icon: '📅', label: 'Date', val: `${date} at ${booking.time || booking.scheduledTime || 'TBD'}` },
          { icon: '📍', label: 'Address', val: user?.address || booking.address || 'Not available' },
          { icon: '👤', label: 'Contact', val: user?.phone || booking.phone || 'Not available' },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ fontSize: 11, color: 'var(--mid)', fontWeight: 600, marginBottom: 2 }}>
              {item.icon} {item.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-word' }}>{item.val}</div>
          </div>
        ))}
      </div>

      {booking.notes && (
        <div style={{ fontSize: 13, color: 'var(--mid)', fontStyle: 'italic', padding: '0 2px' }}>
          "{booking.notes}"
        </div>
      )}

      {booking.rejectionReason && (
        <div style={{
          fontSize: 12, color: 'var(--danger)',
          background: '#FFEBEE', padding: '8px 12px', borderRadius: 8,
        }}>
          Rejection reason: {booking.rejectionReason}
        </div>
      )}

      <button
        onClick={openWhatsApp}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 8,
          background: '#25D366', color: 'white', border: 'none',
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        💬 Contact on WhatsApp
      </button>
    </div>
  );
}

export default function MyBookings() {
  const showToast = useToast();
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getUserBookings();
      setBookings(res.data.bookings || []);
    } catch {
      showToast('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--light)' }}>
      <div className="container" style={{ padding: '40px 20px 60px', maxWidth: 800 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 6 }}>
          My Bookings
        </h1>
        <p style={{ color: 'var(--mid)', marginBottom: 32 }}>
          Track all your service requests
        </p>

        {user && (
          <div style={{
            background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: 14,
            padding: 20, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Logged in as {user.name}</div>
                <div style={{ color: 'var(--mid)', fontSize: 13 }}>Your bookings are loaded automatically.</div>
              </div>
              <a href="/profile" className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>Edit profile</a>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" />
          </div>
        )}

        {!loading && (
          <>
            {bookings.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                {['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'].map((s) => {
                  const count = s === 'all' ? bookings.length : bookings.filter((b) => b.status === s).length;
                  if (count === 0 && s !== 'all') return null;
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      style={{
                        padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
                        border: filter === s ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                        background: filter === s ? 'var(--brand-pale)' : 'white',
                        color: filter === s ? 'var(--brand)' : 'var(--mid)',
                        fontWeight: 700, fontSize: 12,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'white', borderRadius: 14, border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                  {bookings.length === 0 ? 'No bookings found' : 'No bookings in this category'}
                </h3>
                <p style={{ color: 'var(--mid)', fontSize: 14 }}>
                  {bookings.length === 0 ? 'You have no bookings yet.' : 'Try a different filter'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filtered.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} user={user} />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && bookings.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'white', borderRadius: 14, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
            <p style={{ color: 'var(--mid)', fontSize: 15 }}>
              Your booking history will appear here once you request a service.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
