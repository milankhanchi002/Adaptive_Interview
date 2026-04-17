import api from './api'

const interviewService = {
  // Start new interview
  startInterview: async (domain) => {
    try {
      const response = await api.post('/interview/start', { domain })
      return response
    } catch (error) {
      console.error('Start interview API error:', error)
      throw error
    }
  },

  // Submit answer
  submitAnswer: async (interviewId, payload) => {
    try {
      const response = await api.post(`/interview/${interviewId}/answer`, payload)
      return response
    } catch (error) {
      console.error('Submit answer API error:', error)
      throw error
    }
  },

  // Get interview result
  getInterviewResult: async (interviewId) => {
    try {
      const response = await api.get(`/interview/result/${interviewId}`)
      return response
    } catch (error) {
      console.error('Get interview result API error:', error)
      throw error
    }
  },

  // Get user's interview history
  getUserInterviews: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/interview/history?page=${page}&limit=${limit}`)
      return response
    } catch (error) {
      console.error('Get user interviews API error:', error)
      throw error
    }
  },

  // Abandon interview
  abandonInterview: async (interviewId) => {
    try {
      const response = await api.post(`/interview/${interviewId}/abandon`)
      return response
    } catch (error) {
      console.error('Abandon interview API error:', error)
      throw error
    }
  },

  // Get interview statistics
  getInterviewStats: async () => {
    try {
      const response = await api.get('/interview/stats')
      return response
    } catch (error) {
      console.error('Get interview stats API error:', error)
      throw error
    }
  },

  // Get next question (for continuing interview)
  getNextQuestion: async (interviewId) => {
    try {
      const response = await api.get(`/interview/${interviewId}/next`)
      return response
    } catch (error) {
      console.error('Get next question API error:', error)
      throw error
    }
  },

  // Get interview results
  getInterviewResult: async (interviewId) => {
    try {
      const response = await api.get(`/interview/result/${interviewId}`)
      return response
    } catch (error) {
      console.error('Get interview result API error:', error)
      throw error
    }
  },

  // Get user's interview history
  getUserInterviews: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/interview/history?page=${page}&limit=${limit}`)
      return response
    } catch (error) {
      console.error('Get user interviews API error:', error)
      throw error
    }
  },

  // Get interview statistics
  getInterviewStats: async () => {
    try {
      const response = await api.get('/interview/stats')
      return response
    } catch (error) {
      console.error('Get interview stats API error:', error)
      throw error
    }
  }
}

export default interviewService
