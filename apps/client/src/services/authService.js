import api from './api'

const authService = {
  // Register new user
  register: async (userData) => {
    return await api.post('/auth/register', userData)
  },

  // Login user
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password })
  },

  // Get user profile
  getProfile: async () => {
    return await api.get('/auth/profile')
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData)
  },
}

export default authService
