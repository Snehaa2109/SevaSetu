import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICE_ICONS } from '../utils/constants';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#F59E0B', fontSize: 13 }}>
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      </span>
      <span style={{ fontSize: 12, color: 'var(--mid)', fontWeight: 600 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProviderCard({ provider }) {
  const navigate = useNavigate();
  const providerName = provider.name || 'Service Provider';
  const serviceCategory = provider.serviceCategory || provider.serviceType || 'Service';
  const icon = SERVICE_ICONS[serviceCategory] || '🛠️';
  const areas = Array.isArray(provider.areas) ? provider.areas : [];
  const rating = typeof provider.rating === 'number' ? provider.rating : 0;
  const experience = typeof provider.experience === 'number' ? provider.experience : 0;
  const priceRange = provider.priceRange || {};

  const initials = providerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = ['#E8440A', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
  const colorIndex = providerName.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <div
      className="card"
      onClick={() => navigate(`/providers/${provider._id}`)}
      style={{
        cursor: 'pointer',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Verified badge */}
      {provider.isVerified && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'var(--success)', color: 'white',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          padding: '3px 8px', borderRadius: 100,
        }}>
          ✓ VERIFIED
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: avatarColor, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontWeight: 700,
          fontSize: 18, fontFamily: 'var(--font-display)',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--dark)', marginBottom: 2 }}>
            {provider.name}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--brand-pale)', padding: '3px 10px',
            borderRadius: 100, fontSize: 12, fontWeight: 600, color: 'var(--brand)',
          }}>
            <span>{icon}</span> {serviceCategory}
          </div>
        </div>
      </div>

      {/* Description */}
      {provider.serviceDescription && (
        <p style={{
          fontSize: 13, color: 'var(--mid)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {provider.serviceDescription}
        </p>
      )}

      {/* Areas */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {areas.slice(0, 3).map((area) => (
          <span key={area} style={{
            fontSize: 11, fontWeight: 600, color: 'var(--mid)',
            background: 'var(--light)', padding: '3px 8px', borderRadius: 6,
            border: '1px solid var(--border)',
          }}>
            📍 {area}
          </span>
        ))}
        {areas.length > 3 && (
          <span style={{ fontSize: 11, color: 'var(--mid)', padding: '3px 0' }}>
            +{areas.length - 3} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1px solid var(--border)',
      }}>
        <div>
          {rating > 0 ? (
            <StarRating rating={rating} />
          ) : (
            <span style={{ fontSize: 12, color: 'var(--mid)' }}>No reviews yet</span>
          )}
          {experience > 0 && (
            <div style={{ fontSize: 11, color: 'var(--mid)', marginTop: 2 }}>
              {experience} yr{experience !== 1 ? 's' : ''} exp
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          {priceRange.min > 0 && (
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)' }}>
              ₹{priceRange.min}
              {priceRange.max > priceRange.min && `–${priceRange.max}`}
            </div>
          )}
          {priceRange.unit && (
            <div style={{ fontSize: 10, color: 'var(--mid)' }}>{priceRange.unit}</div>
          )}
        </div>
      </div>

      {/* Availability indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: provider.isAvailable ? 'var(--success)' : 'var(--border)',
        opacity: provider.isAvailable ? 1 : 0.5,
      }} />
    </div>
  );
}
