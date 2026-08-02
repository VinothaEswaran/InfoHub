import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the HttpOnly JWT cookie set by the backend
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Let route guards redirect to /login rather than forcing a hard reload here.
    }
    return Promise.reject(error)
  },
)

// ---- Auth ----
export const authApi = {
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  googleLoginUrl: () => `${API_BASE_URL}/api/auth/google/login`,
}

// ---- Companies ----
export const companiesApi = {
  list: (params?: { search?: string; industry?: string; sort_by?: string }) =>
    api.get('/api/companies', { params }),
  get: (id: string) => api.get(`/api/companies/${id}`),
  create: <T extends object>(data: T) => api.post('/api/companies', data),
  update: (id: string, data: Partial<Record<string, unknown>>) => api.patch(`/api/companies/${id}`, data),
  remove: (id: string) => api.delete(`/api/companies/${id}`),
}

// ---- Policies ----
export const policiesApi = {
  analyze: (data: { company_id: string; source_url?: string; raw_text?: string }) =>
    api.post('/api/policies/analyze', data),
  get: (companyId: string) => api.get(`/api/policies/${companyId}`),
}

// ---- Risk ----
export const riskApi = {
  recompute: (companyId: string) => api.post(`/api/risk/${companyId}/recompute`),
  history: (companyId: string) => api.get(`/api/risk/${companyId}/history`),
  topRisk: () => api.get('/api/risk/overview/top-risk'),
}

// ---- Breaches ----
export const breachesApi = {
  list: () => api.get('/api/breaches'),
  scan: (companyId: string) => api.post(`/api/breaches/${companyId}/scan`),
  resolve: (breachId: string) => api.patch(`/api/breaches/${breachId}/resolve`),
}

// ---- Deletion Requests ----
export const deletionApi = {
  list: () => api.get('/api/deletion-requests'),
  create: (data: { company_id: string; jurisdiction: string }) => api.post('/api/deletion-requests', data),
  download: (id: string) => `${API_BASE_URL}/api/deletion-requests/${id}/download`,
  updateStatus: (id: string, status: string) => api.patch(`/api/deletion-requests/${id}/status`, { status }),
}

// ---- Notifications ----
export const notificationsApi = {
  list: () => api.get('/api/notifications'),
  markRead: (id: string) => api.patch(`/api/notifications/${id}/read`),
  markAllRead: () => api.post('/api/notifications/read-all'),
}

// ---- Dashboard ----
export const dashboardApi = {
  overview: () => api.get('/api/dashboard/overview'),
  riskTrend: () => api.get('/api/dashboard/charts/risk-trend'),
  dataCategories: () => api.get('/api/dashboard/charts/data-categories'),
  deletionTimeline: () => api.get('/api/dashboard/charts/deletion-timeline'),
}
