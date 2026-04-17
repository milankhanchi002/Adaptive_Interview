import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import interviewService from '../../services/interviewService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  Brain, 
  Plus, 
  TrendingUp, 
  Clock, 
  Target, 
  Play,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const UserDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [user?.id]) // Re-fetch when user changes

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching dashboard data...')
      
      const [statsResponse, interviewsResponse] = await Promise.all([
        interviewService.getInterviewStats(),
        interviewService.getUserInterviews(1, 5)
      ])
      
      console.log('API responses:', { statsResponse, interviewsResponse })
      
      // Safely handle stats data
      if (statsResponse?.data) {
        console.log('Setting stats:', statsResponse.data)
        setStats(statsResponse.data)
      } else {
        console.log('No stats data available')
        setStats(null)
      }
      
      // Safely handle interviews data
      if (interviewsResponse?.data?.interviews) {
        console.log('Setting interviews:', interviewsResponse.data.interviews)
        setInterviews(interviewsResponse.data.interviews)
      } else {
        console.log('No interviews data available')
        setInterviews([])
      }
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
      // Set safe defaults
      setStats(null)
      setInterviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    console.log('Manual refresh triggered')
    await fetchDashboardData()
    toast.success('Dashboard refreshed!')
  }

  const startNewInterview = async () => {
    try {
      console.log('Starting new interview for domain:', user?.profile?.domain || 'Computer Science')
      const response = await interviewService.startInterview(user?.profile?.domain || 'Computer Science')
      console.log('Start interview response:', response)
      console.log('Response data:', response?.data)
      console.log('Response data data:', response?.data?.data)
      
      if (response?.data?.data?.interviewId) {
        console.log('Navigating to interview with ID:', response.data.data.interviewId)
        navigate(`/user/interview/${response.data.data.interviewId}`)
      } else {
        console.error('No interview ID in response:', response)
        toast.error('Failed to start interview - No interview ID received')
      }
    } catch (error) {
      console.error('Start interview error:', error)
      if (error.response?.status === 0) {
        toast.error('Server is not running. Please start the backend server.')
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.')
      } else if (error.response?.status === 400) {
        toast.error('Invalid request. Please check your profile.')
      } else {
        toast.error('Failed to start interview. Please try again.')
      }
    }
  }

  const getScoreColor = (score) => {
    if (!score && score !== 0) return 'text-gray-600'
    if (score >= 70) return 'text-success-600'
    if (score >= 40) return 'text-warning-600'
    return 'text-error-600'
  }

  const getLevelBadgeColor = (level) => {
    const colors = {
      'Advanced': 'bg-success-100 text-success-800',
      'Intermediate': 'bg-warning-100 text-warning-800',
      'Beginner': 'bg-error-100 text-error-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-gray-600">
            Track your progress and improve your interview skills
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={startNewInterview}
            className="btn btn-primary btn-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Start New Interview</span>
          </button>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <Clock className="h-5 w-5" />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <Brain className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalInterviews || 0}</span>
              </div>
              <p className="text-gray-600">Total Interviews</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-success-600" />
                <span className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore || 0}
                </span>
              </div>
              <p className="text-gray-600">Average Score</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-warning-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.highestScore || 0}</span>
              </div>
              <p className="text-gray-600">Highest Score</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round((stats.averageDuration || 0) / 60)}m
                </span>
              </div>
              <p className="text-gray-600">Avg. Duration</p>
            </div>
          </div>
        )}

        {/* Recent Interviews */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Interviews</h3>
            <button
              onClick={() => navigate('/user/interviews')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {!interviews || interviews.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
              <p className="text-gray-600 mb-4">Start your first interview to see your results here</p>
              <button
                onClick={startNewInterview}
                className="btn btn-primary flex items-center space-x-2 mx-auto"
              >
                <Play className="h-4 w-4" />
                <span>Start Interview</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div key={interview._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{interview.domain}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(interview.level)}`}>
                          {interview.level}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'Completed' ? 'bg-success-100 text-success-800' :
                          interview.status === 'In Progress' ? 'bg-warning-100 text-warning-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                        </div>
                        {interview.questionCount && (
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{interview.questionCount} questions</span>
                          </div>
                        )}
                        {interview.totalDuration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.round(interview.totalDuration / 60)}m</span>
                          </div>
                        )}
                        {interview.overallScore !== undefined && interview.overallScore !== null && (
                          <div className={`font-medium ${getScoreColor(interview.overallScore)}`}>
                            Score: {interview.overallScore}/100
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {interview.status === 'Completed' ? (
                        <button
                          onClick={() => navigate(`/user/result/${interview._id}`)}
                          className="btn btn-secondary flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      ) : interview.status === 'In Progress' ? (
                        <button
                          onClick={() => navigate(`/user/interview`)}
                          className="btn btn-primary flex items-center space-x-1"
                        >
                          <Play className="h-4 w-4" />
                          <span>Continue</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
