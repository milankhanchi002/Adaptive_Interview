import api from './api'

const interviewService = {
  // Start new interview
  startInterview: async (domain) => {
    return await api.post('/interview/start', { domain })
  },

  // Submit answer
  submitAnswer: async (interviewId, answer, timeTaken) => {
    return await api.post(`/interview/${interviewId}/answer`, { answer, timeTaken })
  },

  // Get interview result
  getInterviewResult: async (interviewId) => {
    return await api.get(`/interview/result/${interviewId}`)
  },

  // Get user's interview history
  getUserInterviews: async (page = 1, limit = 10) => {
    return await api.get(`/interview/history?page=${page}&limit=${limit}`)
  },

  // Abandon interview
  abandonInterview: async (interviewId) => {
    return await api.post(`/interview/${interviewId}/abandon`)
  },

  // Get interview statistics
  getInterviewStats: async () => {
    return await api.get('/interview/stats')
  },
}

export default interviewService
