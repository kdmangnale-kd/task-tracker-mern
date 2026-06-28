import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor for consistent error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Task API Methods ─────────────────────────────────────────────
export const taskAPI = {
  getAll: (params = {}) => API.get('/tasks', { params }),
  getById: (id) => API.get(`/tasks/${id}`),
  create: (data) => API.post('/tasks', data),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => API.patch(`/tasks/${id}/status`, { status }),
  delete: (id) => API.delete(`/tasks/${id}`),
  getStats: () => API.get('/tasks/meta/stats'),
};

export default API;
