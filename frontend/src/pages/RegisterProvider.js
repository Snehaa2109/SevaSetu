import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerAPI } from '../utils/api';
import { SERVICE_CATEGORIES, GZB_AREAS } from '../utils/constants';
import { useToast } from '../App';

export default function RegisterProvider() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', whatsapp: '', email: '',
    serviceCategory: '', serviceDescription: '',
    areas: [], experience: '', languages: ['Hindi'],
    priceMin: '', priceMax: '', priceUnit: 'per visit',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleArea = (area) => {
    setForm((prev) => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter((a) => a !== area)
        : [...prev.areas, area],
    }));
  };

  const toggleLang = (lang) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const validateStep1 = () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return false; }
    if (!form.phone.trim()) { showToast('Phone is required', 'error'); return false; }
    if (!form.serviceCategory) { showToast('Service category is required', 'error'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (form.areas.length === 0) { showToast('Select at least one area', 'error'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await providerAPI.register({
        name: form.name,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        email: form.email,
        serviceCategory: form.serviceCategory,
        serviceDescription: form.serviceDescription,
        areas: form.areas,
        experience: Number(form.experience) || 0,
        languages: form.languages,
        priceRange: {
          min: Number(form.priceMin) || 0,
          max: Number(form.priceMax) || 0,
          unit: form.priceUnit,
        },
      });
      setSuccess(true);
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        paddingTop: 64, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--light)',
      }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: '48px 40px',
          maxWidth: 480, width: '100%', textAlign: 'center',
          boxShadow: 'var(--shadow-lg)', margin: '0 20px',
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 12 }}>
            Registration Successful!
          </h2>
          <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: 32 }}>
            Welcome to HyperLocal! Your profile is under review. Once verified, customers in your area will be able to find and book your services.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }}
            onClick={() => navigate('/providers')}>
            View All Providers
          </button>
        </div>
      </div>
    );
  }

  const steps = ['Basic Info', 'Service Areas', 'Pricing'];

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--light)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 60px' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 6 }}>
            Join as Provider
          </h1>
          <p style={{ color: 'var(--mid)', fontSize: 15 }}>
            Register to start getting clients in Ghaziabad
          </p>
        </div>

        {/* Step indicator */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 32,
          background: 'white', borderRadius: 12, padding: 6,
          border: '1px solid var(--border)',
        }}>
          {steps.map((s, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <button
                key={s}
                onClick={() => n < step && setStep(n)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8,
                  background: active ? 'var(--brand)' : 'transparent',
                  color: active ? 'white' : done ? 'var(--success)' : 'var(--mid)',
                  fontWeight: 700, fontSize: 13, border: 'none', cursor: n < step ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                {done ? '✓ ' : `${n}. `}{s}
              </button>
            );
          })}
        </div>

        {/* Form card */}
        <div style={{ background: 'white', borderRadius: 16, padding: '28px 24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>

          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 4 }}>Basic Information</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="Ramesh Kumar" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="98765 43210" className="form-input" type="tel" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input name="whatsapp" value={form.whatsapp} onChange={handleChange}
                    placeholder="Same as phone if empty" className="form-input" type="tel" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" value={form.email} onChange={handleChange}
                    placeholder="optional" className="form-input" type="email" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Category *</label>
                <select name="serviceCategory" value={form.serviceCategory}
                  onChange={handleChange} className="form-input">
                  <option value="">Select your service</option>
                  {SERVICE_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Describe Your Services</label>
                <textarea name="serviceDescription" value={form.serviceDescription}
                  onChange={handleChange} className="form-input" rows={3}
                  placeholder="Tell customers what you offer, your specialties, etc..."
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input name="experience" value={form.experience} onChange={handleChange}
                    type="number" min="0" max="50" placeholder="0" className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Languages Spoken</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {['Hindi', 'English', 'Urdu', 'Punjabi'].map((lang) => (
                    <button
                      type="button" key={lang}
                      onClick={() => toggleLang(lang)}
                      style={{
                        padding: '7px 16px', borderRadius: 100,
                        border: form.languages.includes(lang) ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                        background: form.languages.includes(lang) ? 'var(--brand-pale)' : 'white',
                        color: form.languages.includes(lang) ? 'var(--brand)' : 'var(--mid)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >{lang}</button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '12px 28px' }}
                onClick={() => validateStep1() && setStep(2)}>
                Next: Service Areas →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 4 }}>
                Areas You Serve
              </h3>
              <p style={{ color: 'var(--mid)', fontSize: 13 }}>
                Select all areas in Ghaziabad where you provide services ({form.areas.length} selected)
              </p>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8,
              }}>
                {GZB_AREAS.map((area) => {
                  const selected = form.areas.includes(area);
                  return (
                    <button type="button" key={area} onClick={() => toggleArea(area)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                        border: selected ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                        background: selected ? 'var(--brand-pale)' : 'white',
                        color: selected ? 'var(--brand)' : 'var(--dark)',
                        fontWeight: selected ? 700 : 500,
                        fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {selected ? '✓ ' : '📍 '}{area}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={() => validateStep2() && setStep(3)}>
                  Next: Pricing →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 4 }}>
                Pricing Information
              </h3>
              <p style={{ color: 'var(--mid)', fontSize: 13 }}>
                Set your typical pricing so customers know what to expect
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Min Price (₹)</label>
                  <input name="priceMin" value={form.priceMin} onChange={handleChange}
                    type="number" min="0" placeholder="200" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Price (₹)</label>
                  <input name="priceMax" value={form.priceMax} onChange={handleChange}
                    type="number" min="0" placeholder="1000" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Per</label>
                  <select name="priceUnit" value={form.priceUnit} onChange={handleChange} className="form-input">
                    <option value="per visit">Per Visit</option>
                    <option value="per hour">Per Hour</option>
                    <option value="per project">Per Project</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>

              <div style={{
                background: 'var(--light)', borderRadius: 10, padding: '14px 16px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mid)', marginBottom: 10 }}>
                  REGISTRATION SUMMARY
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div><span style={{ color: 'var(--mid)' }}>Name: </span><strong>{form.name}</strong></div>
                  <div><span style={{ color: 'var(--mid)' }}>Service: </span><strong>{form.serviceCategory}</strong></div>
                  <div><span style={{ color: 'var(--mid)' }}>Phone: </span><strong>{form.phone}</strong></div>
                  <div><span style={{ color: 'var(--mid)' }}>Areas: </span><strong>{form.areas.length} selected</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}
                  style={{ padding: '12px 28px' }}>
                  {loading ? 'Registering...' : '✓ Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
