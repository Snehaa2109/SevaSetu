import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useToast, useUser } from '../App';

const AUTH_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBEqxkVFzD7JkwMw2V0l8jzQSbuAqRZuQvQqVZx5Tl0ZELbIEaMGm_RU36RmwangrSfxbnW9af_-bY3bX8BPQQ2HX99NOwqHK_-sWPy-M5_SztDV4-C66SorAchC1YOLsMTA96v_YMbl2tcLeSLBvLnx5f1SvgwL8dQPmybQotaCqnsdbhO-MRuChpyfRReNy5QEvPf3fQRnEOOnzdGfPEf6rF0NErnSh5PpymJ0DVHGaM9sjUoxmAPSbwkxDw2GEeYDuUDtyPVi_EN';

export default function Login() {
  const { user, saveUser } = useUser();
  const navigate = useNavigate();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ phone: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const validateLoginForm = () => {
    const newErrors = {};
    if (!form.phone.trim()) newErrors.phone = 'Email or phone number is required';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleLoginChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGoogleAuth = () => {
    window.location.assign(`${process.env.REACT_APP_API_URL || '/api'}/auth/google`);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateLoginForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the errors below', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({
        phone: form.phone.trim(),
        password: form.password,
      });

      if (res.data?.user && res.data?.token) {
        localStorage.setItem('sevaSetuToken', res.data.token);
        saveUser(res.data.user);
        showToast('Logged in successfully!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
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
          <div className="stitch-auth-card">
            <div className="stitch-auth-tabs">
              <button type="button" className="active">
                Login
              </button>
              <Link to="/signup">Sign Up</Link>
            </div>

            <div className="stitch-auth-intro">
              <h2>Welcome Back</h2>
              <p>Please enter your details to continue</p>
            </div>

            <form className="stitch-auth-form" onSubmit={handleLoginSubmit}>
              <label>
                <span>Email or Phone Number</span>
                <input
                  type="text"
                  name="phone"
                  placeholder="name@example.com"
                  value={form.phone}
                  onChange={handleLoginChange}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && <small>{errors.phone}</small>}
              </label>

              <label>
                <span className="stitch-auth-label-row">
                  Password
                  <Link to="/support">Forgot password?</Link>
                </span>
                <span className="stitch-password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleLoginChange}
                    aria-invalid={Boolean(errors.password)}
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} aria-label="Toggle password visibility">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </span>
                {errors.password && <small>{errors.password}</small>}
              </label>

              <label className="stitch-auth-checkbox">
                <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleLoginChange} />
                <span>Keep me logged in</span>
              </label>

              <button type="submit" className="stitch-auth-submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="stitch-auth-divider">
              <span>Or continue with</span>
            </div>

            <button type="button" className="stitch-google-button" onClick={handleGoogleAuth}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <p className="stitch-auth-switch">
              Don't have an account? <Link to="/signup">Create an account</Link>
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


