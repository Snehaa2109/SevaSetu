import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sevaSetuToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  googleAuth: () => api.get('/auth/google'),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
};

export const bookingAPI = {
  createRequest: (data) => api.post('/booking/request', data),
  getUserBookings: () => api.get('/user/bookings'),
  getWhatsAppLink: (id) => api.get(`/bookings/${id}/whatsapp`),
};

export const providerAPI = {
  getAll: (params) => api.get('/services', { params }),
  register: (data) => api.post('/provider/register', data),
  getBookings: () => api.get('/provider/bookings'),
  acceptBooking: (id) => api.put(`/provider/booking/${id}/accept`),
  rejectBooking: (id) => api.put(`/provider/booking/${id}/reject`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: () => api.get('/admin/stats'),
  getPendingProviders: () => api.get('/admin/providers/pending'),
  approveProvider: (id) => api.put(`/admin/provider/${id}/approve`),
  rejectProvider: (id, data) => api.put(`/admin/provider/${id}/reject`, data),
  terminateProvider: (id) => api.delete(`/admin/provider/${id}`),
};

export default api;
