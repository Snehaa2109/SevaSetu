import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../App';
import { GZB_AREAS } from '../utils/constants';

const PROVIDER_SERVICES = [
  { value: 'Maid',         label: 'Maid',         icon: 'cleaning_services' },
  { value: 'Babysitter',   label: 'Babysitter',   icon: 'child_care' },
  { value: 'Elderly Care', label: 'Elderly Care', icon: 'elderly' },
];

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBEqxkVFzD7JkwMw2V0l8jzQSbuAqRZuQvQqVZx5Tl0ZELbIEaMGm_RU36RmwangrSfxbnW9af_-bY3bX8BPQQ2HX99NOwqHK_-sWPy-M5_SztDV4-C66SorAchC1YOLsMTA96v_YMbl2tcLeSLBvLnx5f1SvgwL8dQPmybQotaCqnsdbhO-MRuChpyfRReNy5QEvPf3fQRnEOOnzdGfPEf6rF0NErnSh5PpymJ0DVHGaM9sjUoxmAPSbwkxDw2GEeYDuUDtyPVi_EN';

export default function RegisterProvider() {
  const navigate  = useNavigate();
  const showToast = useToast();

  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [providerData, setProviderData] = useState(null);
  const [form, setForm] = useState({
    name:          '',
    phone:         '',
    area:          '',
    address:       '',
    serviceType:   '',
    experience:    '',
    serviceCharge: '',
    acceptTerms:   false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim())        err.name        = 'Full name is required';
    if (!form.phone.trim())       err.phone       = 'Phone number is required';
    if (!form.serviceType)        err.serviceType = 'Please select a service type';
    if (!form.area)               err.area        = 'Please select your area';
    if (!form.acceptTerms)        err.acceptTerms = 'You must accept the terms';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors below', 'error');
      return;
    }
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
      const token = localStorage.getItem('sevaSetuToken');
      const res = await fetch(`${backendUrl}/api/provider/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name:          form.name.trim(),
          phone:         form.phone.trim(),
          area:          form.area,
          address:       form.address.trim(),
          serviceType:   form.serviceType,
          experience:    form.experience || '0',
          serviceCharge: form.serviceCharge || '',
          role:          'PROVIDER',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Fetch the saved provider profile to verify data persistence
      try {
        const profileRes = await fetch(`${backendUrl}/api/provider/profile/${form.phone.trim()}`);
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setProviderData(profileData);
        }
      } catch (profileErr) {
        console.warn('Could not fetch provider profile:', profileErr.message);
      }

      setSubmitted(true);
      showToast('Application submitted! We will review and contact you.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not submit. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <main className="stitch-auth-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, padding: 40 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#10B981', display: 'block', marginBottom: 16 }}>
            check_circle
          </span>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Application Received!</h2>
          <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 28 }}>
            Thank you for joining Seva Setu. Our team will review your profile and reach out within 2–3 business days.
          </p>

          {/* Display saved provider data */}
          {providerData && (
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              textAlign: 'left',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>Your Registered Profile:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                <div>
                  <span style={{ color: '#6b7280', display: 'block', marginBottom: 4 }}>Name</span>
                  <strong style={{ color: '#111827' }}>{providerData.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280', display: 'block', marginBottom: 4 }}>Phone</span>
                  <strong style={{ color: '#111827' }}>{providerData.phone}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280', display: 'block', marginBottom: 4 }}>Service Type</span>
                  <strong style={{ color: '#111827' }}>{providerData.serviceType}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280', display: 'block', marginBottom: 4 }}>Area</span>
                  <strong style={{ color: '#111827' }}>{providerData.area}</strong>
                </div>
              </div>
              {providerData.experience && (
                <div style={{ marginTop: 16 }}>
                  <span style={{ color: '#6b7280', display: 'block', marginBottom: 4, fontSize: 13 }}>Experience</span>
                  <strong style={{ color: '#111827' }}>{providerData.experience} years</strong>
                </div>
              )}
            </div>
          )}

          {/* WhatsApp notification info */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            fontSize: 13,
            color: '#047857',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>message</span>
            <div>
              <strong>WhatsApp Notification Sent!</strong>
              <p style={{ margin: '4px 0 0', lineHeight: 1.5 }}>
                We've sent a welcome message to {form.phone} with your registration details.
              </p>
            </div>
          </div>

          <button className="stitch-auth-submit" onClick={() => navigate('/landing')}>
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="stitch-auth-page">

      {/* ── LEFT — editorial panel (same as Signup) ── */}
      <section className="stitch-auth-editorial">
        <div className="stitch-auth-editorial-content">
          <Link to="/landing" className="stitch-auth-brand">Seva Setu</Link>

          <h1>
            Join as a <span>Seva Provider</span> and grow your livelihood.
          </h1>

          <p>
            Register your skills and start receiving verified service requests from households in your area.
            We handle the matching — you focus on the seva.
          </p>

          {/* Service chips with Material Icons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            {PROVIDER_SERVICES.map(s => (
              <div key={s.value} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(143,78,0,.1)',
                border: '1px solid rgba(143,78,0,.2)',
                borderRadius: 999,
                padding: '8px 18px',
                color: 'var(--stitch-primary)',
                fontSize: 13, fontWeight: 600,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>

          <div className="stitch-auth-image-wrap">
            <div className="stitch-auth-image-glow" />
            <img src={HERO_IMAGE} alt="Caregiver and elder sharing a warm moment" />
            <aside className="stitch-auth-trust-card">
              <div>
                <span className="material-symbols-outlined">verified_user</span>
                <strong>Safe &amp; Verified Platform</strong>
              </div>
              <p>Every provider is background-checked and verified by our team before going live.</p>
            </aside>
          </div>
        </div>
      </section>

      {/* ── RIGHT — form panel ── */}
      <section className="stitch-auth-panel-section">
        <div className="stitch-auth-panel-wrap">
          <div className="stitch-auth-card stitch-auth-card-tall">

            <div className="stitch-auth-intro">
              <h2>Provider Registration</h2>
              <p>Fill in your details — we'll review and activate your profile shortly.</p>
            </div>

            <form className="stitch-auth-form stitch-auth-form-compact" onSubmit={handleSubmit} noValidate>

              {/* Name + Phone */}
              <div className="stitch-auth-form-grid">
                <label>
                  <span>Full Name *</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <small>{errors.name}</small>}
                </label>
                <label>
                  <span>Phone Number *</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <small>{errors.phone}</small>}
                </label>
              </div>

              {/* Service Type */}
              <label>
                <span>Service Type *</span>
                <select
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.serviceType)}
                >
                  <option value="">Select your service</option>
                  {PROVIDER_SERVICES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {errors.serviceType && <small>{errors.serviceType}</small>}
              </label>

              {/* Area */}
              <label>
                <span>Your Area *</span>
                <select
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.area)}
                >
                  <option value="">Select your area</option>
                  {GZB_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {errors.area && <small>{errors.area}</small>}
              </label>

              {/* Address + Experience */}
              <div className="stitch-auth-form-grid">
                <label>
                  <span>Full Address</span>
                  <textarea
                    name="address"
                    placeholder="House no., street, locality (optional)"
                    rows={2}
                    value={form.address}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  <span>Years of Experience</span>
                  <input
                    type="number"
                    name="experience"
                    min="0"
                    max="50"
                    placeholder="e.g. 3"
                    value={form.experience}
                    onChange={handleChange}
                  />
                </label>
              </div>

              {/* Service Charge */}
              <label>
                <span>Service Charge (per month / per visit)</span>
                <input
                  type="text"
                  name="serviceCharge"
                  placeholder="e.g. ₹3000/month or ₹500/visit"
                  value={form.serviceCharge}
                  onChange={handleChange}
                />
              </label>

              {/* Info banner */}
              <div style={{
                background: 'rgba(240,192,112,.15)',
                border: '1px solid rgba(240,192,112,.6)',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 13,
                color: '#7a4800',
                lineHeight: 1.6,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>schedule</span>
                Your profile will be reviewed by our team before going live. You'll be notified once approved.
              </div>

              {/* Terms */}
              <label className="stitch-auth-checkbox">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/support" style={{ color: 'var(--stitch-primary)' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/support" style={{ color: 'var(--stitch-primary)' }}>Privacy Policy</Link>
                </span>
              </label>
              {errors.acceptTerms && <small className="stitch-auth-terms-error">{errors.acceptTerms}</small>}

              <button type="submit" className="stitch-auth-submit" disabled={loading}>
                {loading ? 'Submitting Application…' : 'Submit Provider Application'}
              </button>
            </form>

            <p className="stitch-auth-switch">
              Need services instead?{' '}
              <Link to="/signup">Sign up as a user</Link>
            </p>
          </div>

          <div className="stitch-auth-footer-links">
            <Link to="/support">Help Center</Link>
            <Link to="/support">Privacy Policy</Link>
            <Link to="/support">Terms of Use</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
