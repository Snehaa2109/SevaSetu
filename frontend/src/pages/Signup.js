import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useToast, useUser } from '../App';
import { GZB_AREAS } from '../utils/constants';

const AUTH_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBEqxkVFzD7JkwMw2V0l8jzQSbuAqRZuQvQqVZx5Tl0ZELbIEaMGm_RU36RmwangrSfxbnW9af_-bY3bX8BPQQ2HX99NOwqHK_-sWPy-M5_SztDV4-C66SorAchC1YOLsMTA96v_YMbl2tcLeSLBvLnx5f1SvgwL8dQPmybQotaCqnsdbhO-MRuChpyfRReNy5QEvPf3fQRnEOOnzdGfPEf6rF0NErnSh5PpymJ0DVHGaM9sjUoxmAPSbwkxDw2GEeYDuUDtyPVi_EN';

export default function Signup() {
  const { user, saveUser } = useUser();
  const navigate = useNavigate();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    area: '',
    address: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';
    return newErrors;
  };

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors below', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        area: form.area,
        address: form.address.trim(),
      });

      if (res.data?.user && res.data?.token) {
        localStorage.setItem('sevaSetuToken', res.data.token);
        saveUser(res.data.user);
        showToast('Account created successfully!', 'success');
        navigate('/request-service');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="stitch-auth-page">
      <section className="stitch-auth-editorial">
        <div className="stitch-auth-editorial-content">
          <Link to="/landing" className="stitch-auth-brand">
            Seva Setu
          </Link>
          <h1>
            Sanctuary and <span>reliable care</span> for every home.
          </h1>
          <p>
            Join a community built on trust, warmth, and the human connection that turns a service into a lasting
            relationship.
          </p>
          <div className="stitch-auth-image-wrap">
            <div className="stitch-auth-image-glow" />
            <img src={AUTH_IMAGE} alt="Caregiver and elder sharing a warm moment" />
            <aside className="stitch-auth-trust-card">
              <div>
                <span className="material-symbols-outlined">verified_user</span>
                <strong>Trusted by Thousands</strong>
              </div>
              <p>Over 50,000 families find their peace of mind with Seva Setu every day.</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="stitch-auth-panel-section">
        <div className="stitch-auth-panel-wrap">
          <div className="stitch-auth-card stitch-auth-card-tall">
            <div className="stitch-auth-tabs">
              <Link to="/login">Login</Link>
              <button type="button" className="active">
                Sign Up
              </button>
            </div>

            <div className="stitch-auth-intro">
              <h2>Create Your Account</h2>
              <p>Tell us a little about your home so we can serve you well</p>
            </div>

            <form className="stitch-auth-form stitch-auth-form-compact" onSubmit={handleSubmit}>
              <div className="stitch-auth-form-grid">
                <label>
                  <span>Full Name</span>
                  <input type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} />
                  {errors.name && <small>{errors.name}</small>}
                </label>
                <label>
                  <span>Phone Number</span>
                  <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} />
                  {errors.phone && <small>{errors.phone}</small>}
                </label>
              </div>

              <label>
                <span>Email Address</span>
                <input type="email" name="email" placeholder="name@example.com" value={form.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} />
                {errors.email && <small>{errors.email}</small>}
              </label>

              <div className="stitch-auth-form-grid">
                <label>
                  <span>Password</span>
                  <input type="password" name="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} />
                  {errors.password && <small>{errors.password}</small>}
                </label>
                <label>
                  <span>Confirm Password</span>
                  <input type="password" name="confirmPassword" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} aria-invalid={Boolean(errors.confirmPassword)} />
                  {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
                </label>
              </div>

              <label>
                <span>Area</span>
                <select name="area" value={form.area} onChange={handleChange}>
                  <option value="">Select your area</option>
                  {GZB_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Address</span>
                <textarea name="address" placeholder="Optional" rows={2} value={form.address} onChange={handleChange} />
              </label>

              <label className="stitch-auth-checkbox">
                <input type="checkbox" name="acceptTerms" checked={form.acceptTerms} onChange={handleChange} />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
              {errors.acceptTerms && <small className="stitch-auth-terms-error">{errors.acceptTerms}</small>}

              <button type="submit" className="stitch-auth-submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="stitch-auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
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

