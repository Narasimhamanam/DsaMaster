import api from './api';

export const authService = {
  firebaseLogin: (idToken) => api.post('/auth/firebase-login', { idToken }),
  completeProfile: (data) => api.post('/auth/complete-profile', data),
  getMe: () => api.get('/auth/me'),
};

export const userService = {
  getDashboard: () => api.get('/users/dashboard'),
  getAnalytics: () => api.get('/users/analytics'),
  updateProfile: (data) => api.put('/users/profile', data),
  getProfile: (id) => api.get(`/users/${id}/profile`),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationsRead: () => api.put('/users/notifications/read'),
};

export const problemService = {
  getAll: (params) => api.get('/problems', { params }),
  getTopics: () => api.get('/problems/topics'),
  getByTopic: (slug) => api.get(`/problems/topic/${slug}`),
  getById: (id) => api.get(`/problems/${id}`),
  updateProgress: (id, status) => api.post(`/problems/${id}/progress`, { status }),
  saveNotes: (id, notes) => api.post(`/problems/${id}/notes`, { notes }),
  resetProgress: (id) => api.delete(`/problems/${id}/progress`),
};

export const leaderboardService = {
  getDaily: () => api.get('/leaderboard/daily'),
  getWeekly: () => api.get('/leaderboard/weekly'),
  getMonthly: () => api.get('/leaderboard/monthly'),
  getAllTime: () => api.get('/leaderboard/alltime'),
  getMyRank: () => api.get('/leaderboard/my-rank'),
};

export const contestService = {
  getAll: (params) => api.get('/contests', { params }),
  getUpcoming: () => api.get('/contests/upcoming'),
  getById: (id) => api.get(`/contests/${id}`),
  register: (id) => api.post(`/contests/${id}/register`),
  submit: (id, data) => api.post(`/contests/${id}/submit`, data),
  getLeaderboard: (id) => api.get(`/contests/${id}/leaderboard`),
  create: (data) => api.post('/contests', data),
};

export const forumService = {
  getByProblem: (problemId, sort) => api.get(`/forum/problem/${problemId}`, { params: { sort } }),
  createPost: (data) => api.post('/forum', data),
  upvote: (id) => api.post(`/forum/${id}/upvote`),
  acceptAnswer: (id) => api.put(`/forum/${id}/accept`),
  deletePost: (id) => api.delete(`/forum/${id}`),
};

export const revisionService = {
  getToday: () => api.get('/revisions/today'),
  getStats: () => api.get('/revisions/stats'),
  complete: (id, success) => api.post(`/revisions/${id}/complete`, { success }),
  skip: (id) => api.post(`/revisions/${id}/skip`),
};

export const feedService = {
  getFeed: (page) => api.get('/feed', { params: { page } }),
};

export const mentorService = {
  getStudents: (params) => api.get('/mentor/students', { params }),
  getStudent: (id) => api.get(`/mentor/students/${id}`),
  getInactive: () => api.get('/mentor/inactive'),
  sendMessage: (id, message) => api.post(`/mentor/students/${id}/message`, { message }),
  addNote: (id, note, type) => api.post(`/mentor/students/${id}/notes`, { note, type }),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getProblems: () => api.get('/admin/problems'),
  createProblem: (data) => api.post('/admin/problems', data),
  updateProblem: (id, data) => api.put(`/admin/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/admin/problems/${id}`),
  getTopics: () => api.get('/admin/topics'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  getFeed: () => api.get('/admin/feed'),
};
