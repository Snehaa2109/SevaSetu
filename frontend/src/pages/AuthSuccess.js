import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useToast, useUser } from '../App';

//dedicated handler for Google (or Social) OAuth callbacks. 
export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { saveUser } = useUser();

  useEffect(() => {
    const token = searchParams.get('token');

    const finishGoogleAuth = async () => {
      if (!token) {
        showToast('Google sign in did not return a token', 'error');
        navigate('/login');
        return;
      }

      try {
        localStorage.setItem('sevaSetuToken', token);
        const res = await authAPI.getMe();
        if (res.data?.user) {
          saveUser(res.data.user);
          showToast('Signed in with Google successfully!', 'success');
          navigate('/dashboard');
        } else {
          throw new Error('Missing user profile');
        }
      } catch (error) {
        localStorage.removeItem('sevaSetuToken');
        showToast('Google sign in could not be completed', 'error');
        navigate('/login');
      }
    };

    finishGoogleAuth();
  }, [navigate, saveUser, searchParams, showToast]);

  return (
    <main className="stitch-auth-page stitch-auth-success-page">
      <section className="stitch-auth-success-card">
        <Link to="/landing" className="stitch-auth-brand">
          Seva Setu
        </Link>
        <h1>Completing Google sign in</h1>
        <p>We are securing your session and opening your dashboard.</p>
      </section>
    </main>
  );
}
