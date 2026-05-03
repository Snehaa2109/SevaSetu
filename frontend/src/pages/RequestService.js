import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, servicesAPI } from '../utils/api';
import { useToast, useUser } from '../App';
import { GZB_AREAS } from '../utils/constants';

const cream   = '#f5f0e0';
const white   = '#ffffff';
const brownDk = '#8f4e00';
const brown   = '#c97a2a';
const border  = '#e0d5c5';
const tan     = '#ede8d8';
const textDk  = '#1a1a1a';
const textMid = '#6b6b6b';

const SERVICE_OPTIONS = [
  { value: 'Maid',         label: 'Maid',         desc: 'Cleaning, cooking & household management.', bg: '#fde8d8', icon: 'cleaning_services' },
  { value: 'Babysitter',   label: 'Babysitter',   desc: 'Nurturing care for your little ones.',       bg: '#ffe0b2', icon: 'child_care' },
  { value: 'Elderly Care', label: 'Elderly Care', desc: 'Compassionate assistance for your elders.',  bg: '#dbeeff', icon: 'elderly' },
];

const TIMING_OPTIONS = [
  'Morning (8:00 AM – 12:00 PM)',
  'Afternoon (12:00 PM – 4:00 PM)',
  'Evening (4:00 PM – 8:00 PM)',
  'Full Day',
  'Flexible',
];

/* Derive active step from form state */
function getStep(form) {
  if (!form.serviceType) return 1;
  if (!form.area)        return 2;
  if (!form.providerId)  return 3;
  return 4;
}

const STEPS = [
  { n: 1, label: 'Choose Service',    sub: 'Maid, Babysitter, Elderly Care' },
  { n: 2, label: 'Select Location',   sub: 'Pick your area' },
  { n: 3, label: 'Pick a Provider',   sub: 'Live results near you' },
  { n: 4, label: 'Confirm Request',   sub: 'Schedule & submit' },
];

export default function RequestService() {
  const { user }  = useUser();
  const navigate  = useNavigate();
  const showToast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [providers,  setProviders]  = useState([]);
  const [loadingPv,  setLoadingPv]  = useState(false);

  const [form, setForm] = useState({
    serviceType: '',
    area:        '',
    providerId:  '',
    providerName:'',
    schedule:    'Full-time',
    timing:      TIMING_OPTIONS[0],
    address:     '',
    notes:       '',
  });

  const step = getStep(form);

  /* Fetch providers whenever service + area are both set */
  useEffect(() => {
    if (!form.serviceType || !form.area) {
      setProviders([]);
      return;
    }
    setLoadingPv(true);
    servicesAPI.getAll({ serviceType: form.serviceType, area: form.area })
      .then(r => setProviders(r.data.providers || []))
      .catch(() => setProviders([]))
      .finally(() => setLoadingPv(false));
  }, [form.serviceType, form.area]);

  const selectProvider = (pv) =>
    setForm(f => ({ ...f, providerId: pv._id, providerName: pv.name }));

  const handleSubmit = async () => {
    if (!form.providerId) { showToast('Please select a provider', 'error'); return; }
    if (!form.address.trim()) { showToast('Please enter your home address', 'error'); return; }

    setSubmitting(true);
    try {
      await bookingAPI.createRequest({
        providerId:  form.providerId,
        serviceType: form.serviceType,
        schedule:    form.schedule,
        timing:      form.timing,
        address:     form.address.trim(),
        notes:       form.notes.trim(),
      });
      showToast('Service request sent successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* Avatar colour helper */
  const avatarColor = (name = '') => {
    const colors = ['#E8440A', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div style={pg.page}>
      <div style={pg.grid}>

        {/* ─── LEFT SIDEBAR ─── */}
        <aside style={pg.sidebar}>
          {/* Stepper */}
          <div style={pg.stepCard}>
            <p style={pg.stepTitle}>Requesting Care</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {STEPS.map(s => {
                const active = s.n === step;
                const done   = s.n  <  step;
                return (
                  <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      ...pg.stepCircle,
                      background: active ? brownDk : done ? brown : 'transparent',
                      border: active || done ? 'none' : `2px solid ${border}`,
                      color: active || done ? white : textMid,
                    }}>
                      {done ? '✓' : s.n}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? brown : done ? brown : textMid, lineHeight: 1.3 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 11, color: '#9a9a9a', marginTop: 2 }}>{s.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary card (step 4) */}
          {step === 4 && (
            <div style={{ ...pg.stepCard, borderColor: brown, borderWidth: 1.5 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: brown, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Your Selection
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Service',  form.serviceType],
                  ['Area',     form.area],
                  ['Provider', form.providerName],
                ].map(([k, v]) => (
                  <div key={k} style={{ fontSize: 13 }}>
                    <span style={{ color: textMid }}>{k}: </span>
                    <strong style={{ color: textDk }}>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified badge */}
          <div style={pg.verifiedCard}>
            <div style={pg.verifiedBanner}>
              <span style={{ color: white, fontWeight: 900, fontSize: 18, letterSpacing: 6, display: 'block' }}>VERIFIED</span>
              <span style={{ color: '#ccc',  fontWeight: 700, fontSize: 10, letterSpacing: 4, display: 'block', marginTop: 2 }}>PLATFORM</span>
            </div>
            <div style={{ padding: '14px 18px 18px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: brown, marginBottom: 10 }}>Verified Backgrounds</h3>
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.75, marginBottom: 14 }}>
                Every provider undergoes a multi-layer verification including criminal records and past employment checks.
              </p>
              <div style={{ fontSize: 12, fontWeight: 700, color: brown }}>🛡️ Peace of mind for your family</div>
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main style={pg.main}>

          {/* ── STEP 1: Choose service ── */}
          <section>
            <div style={{ marginBottom: 22 }}>
              <h1 style={pg.h1}>What service do you need?</h1>
              <p style={pg.sub}>Select the primary care category to begin.</p>
            </div>
            <div style={pg.cardRow}>
              {SERVICE_OPTIONS.map(opt => {
                const sel = form.serviceType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, serviceType: opt.value, area: '', providerId: '', providerName: '' }))}
                    style={{
                      ...pg.serviceCard,
                      border:    sel ? `2px solid ${brown}` : `1.5px solid ${border}`,
                      boxShadow: sel ? `0 0 0 3px rgba(201,122,42,.15)` : 'none',
                    }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 26, color: '#8f4e00' }}>{opt.icon}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: textDk, marginBottom: 6 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: textMid, lineHeight: 1.6 }}>{opt.desc}</div>
                    {sel && <div style={{ marginTop: 12, fontSize: 11, color: brown, fontWeight: 700 }}>✓ Selected</div>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── STEP 2: Choose area ── */}
          {form.serviceType && (
            <section style={{ marginTop: 8 }}>
              <div style={pg.detailPanel}>
                <label style={pg.label}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>location_on</span>
                  Select Your Area
                  <span style={{ fontWeight: 400, color: textMid, marginLeft: 8, fontSize: 12 }}>
                    — we'll show available {form.serviceType}s nearby
                  </span>
                </label>
                <div style={{ position: 'relative', maxWidth: 360 }}>
                  <select
                    value={form.area}
                    onChange={e => setForm(f => ({ ...f, area: e.target.value, providerId: '', providerName: '' }))}
                    style={pg.select}
                  >
                    <option value="">Select area…</option>
                    {GZB_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <span style={pg.chevron}>▾</span>
                </div>
              </div>
            </section>
          )}

          {/* ── STEP 3: Live provider list ── */}
          {form.serviceType && form.area && (
            <section style={{ marginTop: 8 }}>
              <div style={pg.detailPanel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <label style={{ ...pg.label, margin: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>search</span>
                    Available {form.serviceType}s in {form.area}
                  </label>
                  {loadingPv && <span style={{ fontSize: 12, color: brown }}>Loading…</span>}
                </div>

                {!loadingPv && providers.length === 0 && (
                  <div style={pg.emptyState}>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#c97a2a', display: 'block', marginBottom: 10 }}>person_search</span>
                    <div style={{ fontWeight: 600, color: textDk, marginBottom: 6 }}>No providers found in {form.area}</div>
                    <div style={{ fontSize: 13, color: textMid }}>Try a different area or check back soon.</div>
                  </div>
                )}

                {!loadingPv && providers.length > 0 && (
                  <div style={pg.providerGrid}>
                    {providers.map(pv => {
                      const sel = form.providerId === pv._id;
                      const initials = (pv.name || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      const ac = avatarColor(pv.name);
                      return (
                        <button
                          key={pv._id}
                          type="button"
                          onClick={() => selectProvider(pv)}
                          style={{
                            ...pg.providerCard,
                            border:    sel ? `2px solid ${brown}` : `1.5px solid ${border}`,
                            boxShadow: sel ? `0 0 0 3px rgba(201,122,42,.12)` : 'none',
                            background: sel ? '#fffaf3' : white,
                          }}
                        >
                          {/* Avatar */}
                          <div style={{ width: 50, height: 50, borderRadius: '50%', background: ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {pv.avatar
                              ? <img src={pv.avatar} alt={pv.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                              : <span style={{ color: white, fontSize: 16, fontWeight: 700 }}>{initials}</span>
                            }
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: textDk }}>{pv.name}</div>
                            <div style={{ fontSize: 12, color: textMid, marginTop: 2 }}>
                              {pv.serviceType || form.serviceType} · {pv.area || form.area}
                            </div>
                            {pv.experience && (
                              <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>
                                {pv.experience} yrs experience
                              </div>
                            )}
                          </div>

                          {/* Badge */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                            <div style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>
                              ✓ VERIFIED
                            </div>
                            {sel && (
                              <div style={{ background: brown, color: white, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>
                                SELECTED
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── STEP 4: Schedule + Confirm ── */}
          {form.providerId && (
            <section style={{ marginTop: 8 }}>
              <div style={pg.detailPanel}>
                <label style={{ ...pg.label, marginBottom: 18 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>event_note</span>
                  Schedule Details
                </label>

                <div style={pg.detailRow}>
                  {/* Location */}
                  <div>
                    <label style={pg.label}>Home Address</label>
                    <div style={pg.addrWrap}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#8f4e00' }}>location_on</span>
                      <input
                        type="text"
                        placeholder="Enter your full home address"
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        style={pg.addrInput}
                      />
                    </div>
                  </div>

                  {/* Work schedule */}
                  <div>
                    <label style={pg.label}>Work Schedule</label>
                    <div style={pg.toggle}>
                      {['Full-time', 'Part-time'].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, schedule: s }))}
                          style={{
                            ...pg.toggleBtn,
                            background: form.schedule === s ? brownDk : 'transparent',
                            color:      form.schedule === s ? white   : textMid,
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <label style={{ ...pg.label, marginTop: 20 }}>Preferred Timing</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={form.timing}
                        onChange={e => setForm(f => ({ ...f, timing: e.target.value }))}
                        style={pg.select}
                      >
                        {TIMING_OPTIONS.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span style={pg.chevron}>▾</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginTop: 22 }}>
                  <label style={pg.label}>Additional Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="Mention any specific needs, languages, or preferences…"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={pg.textarea}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={pg.actions}>
                <button
                  type="button"
                  style={pg.draftBtn}
                  onClick={() => setForm(f => ({ ...f, providerId: '', providerName: '' }))}
                >
                  ← Change Provider
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  style={{ ...pg.submitBtn, opacity: submitting ? 0.72 : 1 }}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Submitting…' : 'Send Request'}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ─── FOOTER ─── */}
      <footer style={pg.footer}>
        <div style={pg.footerInner}>
          <div>
            <div style={pg.footerBrand}>Seva Setu</div>
            <div style={pg.footerCopy}>© 2024 SEVA SETU. SANCTUARY OF RELIABLE CARE.</div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Terms of Service', 'Privacy Policy', 'Safety Center', 'Contact Us'].map(l => (
              <span key={l} style={pg.footerLink}>{l.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── Styles ─────────── */
const pg = {
  page: {
    minHeight: '100vh',
    background: cream,
    paddingTop: 56,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', 'Manrope', sans-serif",
  },
  grid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: 28,
    maxWidth: 1080,
    margin: '0 auto',
    padding: '36px 28px 32px',
    width: '100%',
    alignItems: 'start',
  },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 20 },
  stepCard: {
    background: tan,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: '20px 18px 22px',
  },
  stepTitle: { fontWeight: 700, fontSize: 14, color: textDk, marginBottom: 20 },
  stepCircle: {
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  verifiedCard: {
    background: tan,
    border: `1.5px solid ${brown}`,
    borderRadius: 16,
    overflow: 'hidden',
  },
  verifiedBanner: {
    background: '#1a1a1a',
    padding: '16px 20px',
    textAlign: 'center',
  },
  main: { display: 'flex', flexDirection: 'column', gap: 4 },
  h1: {
    fontSize: 28, fontWeight: 800, color: textDk,
    lineHeight: 1.15,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginBottom: 6,
  },
  sub: { fontSize: 14, color: textMid },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginBottom: 8,
  },
  serviceCard: {
    textAlign: 'left',
    padding: '20px 18px',
    borderRadius: 16,
    cursor: 'pointer',
    background: white,
    transition: 'box-shadow .2s, border-color .2s',
    fontFamily: 'inherit',
  },
  detailPanel: {
    background: white,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: '22px 20px',
    marginBottom: 8,
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: textDk,
    marginBottom: 10,
  },
  select: {
    width: '100%',
    padding: '10px 36px 10px 14px',
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: '#fafaf6',
    fontSize: 13, color: '#333',
    appearance: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  chevron: {
    position: 'absolute', right: 12, top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 12, color: '#777', pointerEvents: 'none',
  },
  emptyState: {
    textAlign: 'center',
    padding: '36px 20px',
    color: textMid,
    fontSize: 13,
    background: '#fafaf6',
    borderRadius: 12,
    border: `1px dashed ${border}`,
  },
  providerGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  providerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    borderRadius: 14,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color .2s, box-shadow .2s, background .15s',
  },
  addrWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    border: `1px solid ${border}`,
    borderRadius: 10,
    padding: '10px 14px',
    background: '#fafaf6',
    marginBottom: 12,
  },
  addrInput: {
    border: 'none', background: 'transparent', outline: 'none',
    fontSize: 13, color: '#555', width: '100%', fontFamily: 'inherit',
  },
  toggle: {
    display: 'inline-flex',
    background: '#ede8d8',
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    padding: '8px 18px',
    borderRadius: 999,
    border: 'none',
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
    transition: 'background .2s, color .2s',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '13px 15px',
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: '#fafaf6',
    fontSize: 13, color: '#444',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
    lineHeight: 1.65,
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  draftBtn: {
    background: 'none', border: 'none',
    fontSize: 14, fontWeight: 600, color: '#555',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  submitBtn: {
    background: brown,
    color: white,
    border: 'none',
    borderRadius: 999,
    padding: '13px 36px',
    fontSize: 15, fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 18px rgba(180,100,20,.3)',
    transition: 'opacity .2s',
  },
  footer: {
    background: cream,
    borderTop: `1px solid ${border}`,
    padding: '28px 28px',
    marginTop: 8,
  },
  footerInner: {
    maxWidth: 1080, margin: '0 auto',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-end', flexWrap: 'wrap', gap: 16,
  },
  footerBrand: { fontWeight: 800, fontSize: 17, color: textDk, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 },
  footerCopy: { fontSize: 10, color: '#aaa', letterSpacing: 0.8 },
  footerLink: { fontSize: 10, fontWeight: 600, color: '#999', letterSpacing: 0.8, cursor: 'pointer' },
};
