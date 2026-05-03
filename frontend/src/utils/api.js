import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

// Add JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sevaSetuToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login', data),
  getMe:    ()       => api.get('/auth/me'),
  googleAuth: ()     => api.get('/auth/google'),
};

export const servicesAPI = {
  // Returns list of active verified providers
  getAll: (params) => api.get('/services', { params }),
};

export const bookingAPI = {
  createRequest:   (data) => api.post('/booking/request', data),
  getUserBookings: ()     => api.get('/user/bookings'),
  getWhatsAppLink: (id)   => api.get(`/bookings/${id}/whatsapp`),
  deleteBooking:   (id)   => api.delete(`/user/booking/${id}`),
};

export const profileAPI = {
  // Update the logged-in user's profile fields
  update: (data) => api.put('/user/profile', data),
};

export const supportAPI = {
  // Submit a support message (stored in DB)
  sendMessage: (data) => api.post('/support/message', data),
};

export const providerAPI = {
  getAll:         (params) => api.get('/services', { params }),
  register:       (data)   => api.post('/provider/register', data),
  getBookings:    ()       => api.get('/provider/bookings'),
  acceptBooking:  (id)     => api.put(`/provider/booking/${id}/accept`),
  rejectBooking:  (id)     => api.put(`/provider/booking/${id}/reject`),
};

export const adminAPI = {
  getDashboard:       ()       => api.get('/admin/dashboard'),
  getStats:           ()       => api.get('/admin/stats'),
  getPendingProviders:()       => api.get('/admin/providers/pending'),
  approveProvider:    (id)     => api.put(`/admin/provider/${id}/approve`),
  rejectProvider:     (id, d)  => api.put(`/admin/provider/${id}/reject`, d),
  terminateProvider:  (id)     => api.delete(`/admin/provider/${id}`),
};

export default api;
