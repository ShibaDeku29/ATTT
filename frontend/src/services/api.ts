import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  getAllUsers: () => api.get('/auth/users'),
};

export const roomService = {
  createRoom: (name: string, description: string, isPrivate: boolean) =>
    api.post('/rooms', { name, description, isPrivate }),
  getRooms: () => api.get('/rooms'),
  getRoomById: (id: string) => api.get(`/rooms/${id}`),
  joinRoom: (id: string) => api.post(`/rooms/${id}/join`),
  leaveRoom: (id: string) => api.post(`/rooms/${id}/leave`),
};

export const messageService = {
  getMessages: (roomId: string, limit = 50, offset = 0) =>
    api.get(`/rooms/${roomId}/messages`, { params: { limit, offset } }),
  sendMessage: (roomId: string, text: string) =>
    api.post(`/rooms/${roomId}/messages`, { text }),
  deleteMessage: (roomId: string, messageId: string) =>
    api.delete(`/rooms/${roomId}/messages/${messageId}`),
};

export default api;
