import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Dashboard
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getActivity: () => api.get('/dashboard/activity'),
};

// Companies
export const companyAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getAllList: () => api.get('/companies/all'),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

// Risk
export const riskAPI = {
  getSummary: () => api.get('/risk/summary'),
  getBreakdown: () => api.get('/risk/breakdown'),
  getRecommendations: () => api.get('/risk/recommendations'),
  getHistory: () => api.get('/risk/history'),
};

// Breaches
export const breachAPI = {
  getAll: () => api.get('/breaches'),
  check: () => api.post('/breaches/check'),
  acknowledge: (id) => api.put(`/breaches/${id}/acknowledge`),
};

// Deletion
export const deletionAPI = {
  generate: (data) => api.post('/deletion/generate', data),
  getAll: () => api.get('/deletion/requests'),
  updateStatus: (id, status) => api.put(`/deletion/requests/${id}/status`, { status }),
  downloadPdf: (id) => api.get(`/deletion/requests/${id}/pdf`, { responseType: 'blob' }),
};

// AI
export const aiAPI = {
  summarize: (url) => api.post('/ai/summarize', { url }),
  saveSummary: (companyId, policyUrl) => api.post(`/ai/save-summary/${companyId}`, { policyUrl }),
  getCompanySummary: (companyId) => api.get(`/ai/summary/${companyId}`),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Settings
export const settingsAPI = {
  get: () => api.get('/settings'),
  updateAccount: (data) => api.put('/settings/account', data),
  updateSecurity: (data) => api.put('/settings/security', data),
  updateNotifications: (data) => api.put('/settings/notifications', data),
  export: () => api.get('/settings/export'),
};

export default api;
