import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  googleLogin: () => window.location.href = `${API_URL}/auth/google/login`,
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Course APIs
export const courseAPI = {
  list: (params?: any) => api.get('/courses', { params }),
  get: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (courseId: string) => api.post(`/courses/${courseId}/enroll`),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data: any) => api.post('/payments/razorpay/orders', data),
  verifyPayment: (data: any) => api.post('/payments/razorpay/verify', data),
  getOrders: () => api.get('/payments/orders'),
};

// Upload APIs
export const uploadAPI = {
  getPresignedUrl: (filename: string, contentType: string) => 
    api.post('/uploads/presign', { filename, content_type: contentType }),
  completeUpload: (key: string, sizeBytes: number) => 
    api.post('/uploads/complete', { key, size_bytes: sizeBytes }),
};

// Live Class APIs
export const liveAPI = {
  listRooms: (courseId?: string) => api.get('/live/rooms', { params: { course_id: courseId } }),
  createRoom: (data: any) => api.post('/live/rooms', data),
  joinRoom: (roomId: string) => api.post(`/live/rooms/${roomId}/join`),
  leaveRoom: (roomId: string) => api.post(`/live/rooms/${roomId}/leave`),
};

// Comment APIs
export const commentAPI = {
  getComments: (lessonId: string) => api.get(`/comments/lesson/${lessonId}`),
  createComment: (data: any) => api.post('/comments', data),
  updateComment: (id: string, data: any) => api.put(`/comments/${id}`, data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
};