import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, servicesAPI } from '../utils/api';
import { useToast, useUser } from '../App';

const SERVICE_OPTIONS = [
  { value: 'Maid', label: 'Maid (Bai)', description: 'Household cleaning, cooking, and daily help.' },
  { value: 'Babysitter', label: 'Babysitter', description: 'Safe care for children while you manage the home.' },
  { value: 'Household Helper', label: 'Household Helper', description: 'General household assistance for chores and support.' },
];

export default function RequestService() {
  const { user } = useUser();
  const navigate = useNavigate();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({
    serviceType: '',
    date: '',
    time: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await servicesAPI.getAll();
        setProviders(res.data.providers || []);
      } catch (err) {
        showToast('Unable to load helpers right now', 'error');
      }
    };
    loadProviders();
  }, [showToast]);

  const selectedProvider = useMemo(() => {
    if (!form.serviceType) return null;
    return providers.find((provider) => provider.serviceType === form.serviceType);
  }, [form.serviceType, providers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceType) {
      showToast('Please choose a service type', 'error');
      return;
    }
    if (!form.date) {
      showToast('Please choose a preferred date', 'error');
      return;
    }
    if (!form.time) {
      showToast('Please choose a preferred time', 'error');
      return;
    }
    if (!form.address.trim()) {
      showToast('Please enter your address', 'error');
      return;
    }
    if (!selectedProvider) {
      showToast('No verified helper is available for this service type right now.', 'error');
      return;
    }

    setLoading(true);
    try {
      await bookingAPI.createRequest({
        providerId: selectedProvider._id,
        serviceType: form.serviceType,
        date: form.date,
        time: form.time,
        notes: form.notes.trim(),
      });
      showToast('Your service request has been sent successfully!', 'success');
      navigate('/my-bookings');
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not submit request';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--light)' }}>
      <div className="container" style={{ maxWidth: 760, padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', marginBottom: 8 }}>Request Service</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 12 }}>
              Book a helper in three simple steps.
            </h1>
            <p style={{ color: 'var(--mid)', fontSize: 15, lineHeight: 1.8 }}>
              Select the service you need, set your preferred schedule, and we’ll route your request to a verified helper in your area.
            </p>
          </div>
          <div style={{ minWidth: 220, padding: 20, borderRadius: 20, background: 'white', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Need support?</div>
            <div style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 12 }}>Call us at</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand)' }}>+91 8000 SEVA SETU</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gap: 14, background: 'white', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ fontWeight: 700, fontSize: 14 }}>Choose service</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {SERVICE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, serviceType: option.value }))}
                    style={{
                      textAlign: 'left', padding: 18, borderRadius: 18,
                      border: form.serviceType === option.value ? '2px solid var(--brand)' : '1px solid var(--border)',
                      background: form.serviceType === option.value ? 'var(--brand-pale)' : 'white',
                      cursor: 'pointer', minHeight: 130,
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 10 }}>{option.value === 'Maid' ? '🧹' : option.value === 'Babysitter' ? '👶' : '🏠'}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{option.label}</div>
                    <div style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.6 }}>{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow)', display: 'grid', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Preferred date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--border)', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Preferred time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--border)', fontSize: 14 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Address</label>
              <textarea
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your home address"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--border)', fontSize: 14, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Additional notes</label>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                placeholder="Share any special instructions for the helper"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid var(--border)', fontSize: 14, resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, background: 'white', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Match details</div>
                <div style={{ color: 'var(--mid)', fontSize: 13 }}>We will connect you with a verified helper for the selected service.</div>
              </div>
              <div style={{ color: selectedProvider ? '#047857' : '#B91C1C', fontWeight: 700 }}>
                {selectedProvider ? 'We found a helper for your request.' : 'No helper available yet.'}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px 18px', borderRadius: 16,
                background: loading ? 'var(--mid)' : 'var(--brand)',
                color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 15,
              }}
            >
              {loading ? 'Sending request...' : 'Send Service Request'}
            </button>
          </div>

          <div style={{ fontSize: 14, color: 'var(--mid)' }}>
            {selectedProvider ? (
              <span>
                Your request will be sent to a verified helper who can provide <strong>{form.serviceType}</strong> support.
              </span>
            ) : (
              <span>
                If no helper is available immediately, our support team will contact you with next steps.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
