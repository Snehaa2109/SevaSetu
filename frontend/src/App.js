import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RequestService from './pages/RequestService';
import Support from './pages/Support';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import AuthSuccess from './pages/AuthSuccess';
import Toast from './components/Toast';

export const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);
export const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sevaSetuUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('sevaSetuUser');
      return null;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sevaSetuUser');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('sevaSetuUser');
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sevaSetuUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('sevaSetuUser');
    }
  }, [user]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const saveUser = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <ToastContext.Provider value={showToast}>
      <UserContext.Provider value={{ user, saveUser, logout }}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/landing" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/request-service" element={user ? <RequestService /> : <Navigate to="/login" />} />
          <Route path="/support" element={<Support />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          </Routes>
          <div className="toast-container">
            {toasts.map((t) => (
              <Toast key={t.id} message={t.message} type={t.type} />
            ))}
          </div>
        </Router>
      </UserContext.Provider>
    </ToastContext.Provider>
  );
}
