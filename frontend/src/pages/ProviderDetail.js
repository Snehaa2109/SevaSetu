import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { providerAPI } from '../utils/api';
import { SERVICE_ICONS, STATUS_COLORS } from '../utils/constants';
import BookingModal from '../components/BookingModal';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    providerAPI.getById(id)
      .then((res) => setProvider(res.data))
      .catch(() => navigate('/providers'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!provider) return null;

  const icon = SERVICE_ICONS[provider.serviceCategory] || '🛠️';
  const initials = provider.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#E8440A', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
  const avatarColor = colors[provider.name.charCodeAt(0) % colors.length];

  const whatsappDirect = () => {
    const phone = (provider.whatsapp || provider.phone).replace(/\D/g, '');
    const full = phone.startsWith('91') ? phone : `91${phone}`;
    const msg = encodeURIComponent(`Hello ${provider.name}, I found you on Seva Setu. I need ${provider.serviceCategory} service. Are you available?`);
    window.location.href = `whatsapp://send?phone=${full}&text=${msg}`;
  };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--light)' }}>
      {/* Back */}
      <div className="container" style={{ paddingTop: 24 }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--mid)', fontWeight: 600, fontSize: 14,
          marginBottom: 20,
        }}>
          ← Back to Providers
        </button>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Main profile */}
          <div>
            {/* Header card */}
            <div className="card" style={{ padding: 28, marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20, background: avatarColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 28, fontWeight: 700, flexShrink: 0,
                  fontFamily: 'var(--font-display)',
                }}>
                  {initials}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
                      {provider.name}
                    </h1>
                    {provider.isVerified && (
                      <span style={{
                        background: 'var(--success)', color: 'white', fontSize: 11,
                        fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                      }}>✓ VERIFIED</span>
                    )}
                    <span style={{
                      background: provider.isAvailable ? '#E8F5E9' : '#F5F5F5',
                      color: provider.isAvailable ? 'var(--success)' : 'var(--mid)',
                      fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                    }}>
                      {provider.isAvailable ? '● Available' : '○ Unavailable'}
                    </span>
                  </div>

                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--brand-pale)', padding: '5px 12px',
                    borderRadius: 100, fontSize: 13, fontWeight: 600, color: 'var(--brand)',
                  }}>
                    {icon} {provider.serviceCategory}
                  </div>
                </div>
              </div>

              {provider.serviceDescription && (
                <p style={{
                  marginTop: 18, color: 'var(--mid)', fontSize: 14, lineHeight: 1.7,
                  padding: '14px 16px', background: 'var(--light)',
                  borderRadius: 10, borderLeft: '3px solid var(--brand)',
                }}>
                  {provider.serviceDescription}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>
                Service Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Experience', value: provider.experience ? `${provider.experience} years` : 'Not specified' },
                  { label: 'Languages', value: provider.languages?.join(', ') || 'Hindi' },
                  {
                    label: 'Price Range',
                    value: provider.priceRange?.min > 0
                      ? `₹${provider.priceRange.min}–${provider.priceRange.max} ${provider.priceRange.unit}`
                      : 'Contact for pricing'
                  },
                  { label: 'Rating', value: provider.rating > 0 ? `${provider.rating}/5 (${provider.totalReviews} reviews)` : 'No reviews yet' },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: 'var(--light)', padding: '14px 16px', borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.05em', marginBottom: 4 }}>
                      {item.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Areas */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.05em', marginBottom: 10 }}>
                  AREAS SERVED
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {provider.areas.map((area) => (
                    <span key={area} style={{
                      background: 'white', border: '1.5px solid var(--border)',
                      padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    }}>
                      📍 {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div style={{ position: 'sticky', top: 84 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 6 }}>
                Book this Provider
              </h3>
              <p style={{ color: 'var(--mid)', fontSize: 13, marginBottom: 20 }}>
                Send a booking request and they'll confirm with you shortly.
              </p>

              {provider.priceRange?.min > 0 && (
                <div style={{
                  background: 'var(--brand-pale)', border: '1px solid rgba(232,68,10,0.15)',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.05em' }}>PRICING</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--dark)', fontFamily: 'var(--font-display)' }}>
                    ₹{provider.priceRange.min}
                    {provider.priceRange.max > provider.priceRange.min && `–${provider.priceRange.max}`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mid)' }}>{provider.priceRange.unit}</div>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: 10, fontSize: 15, padding: '14px' }}
                onClick={() => setShowBooking(true)}
                disabled={!provider.isAvailable}
              >
                📅 Book Now
              </button>

              <button
                onClick={whatsappDirect}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  background: '#25D366', color: 'white', border: 'none',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s',
                }}
              >
                💬 WhatsApp Direct
              </button>

              {!provider.isAvailable && (
                <p style={{
                  marginTop: 12, fontSize: 12, color: 'var(--danger)', textAlign: 'center',
                }}>
                  This provider is currently unavailable
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal provider={provider} onClose={() => setShowBooking(false)} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
