import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import interviewService from '../../services/interviewService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  Users, 
  TrendingUp, 
  Brain, 
  Clock, 
  Target,
  Eye,
  UserCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data for now - you'll need to create admin-specific API endpoints
      const mockStats = {
        totalCandidates: 45,
        totalInterviews: 128,
        averageScore: 65,
        completionRate: 78
      }
      
      const mockCandidates = [
        {
          _id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          interviewCount: 5,
          averageScore: 72,
          lastInterview: new Date('2024-01-15'),
          domain: 'Computer Science'
        },
        {
          _id: '2',
          username: 'jane_smith',
          email: 'jane@example.com',
          interviewCount: 3,
          averageScore: 85,
          lastInterview: new Date('2024-01-14'),
          domain: 'Marketing'
        },
        {
          _id: '3',
          username: 'bob_wilson',
          email: 'bob@example.com',
          interviewCount: 8,
          averageScore: 68,
          lastInterview: new Date('2024-01-13'),
          domain: 'Finance'
        }
      ]
      
      setStats(mockStats)
      setCandidates(mockCandidates)
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
      // Set safe defaults
      setStats(null)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (!score && score !== 0) return 'text-gray-600'
    if (score >= 70) return 'text-success-600'
    if (score >= 40) return 'text-warning-600'
    return 'text-error-600'
  }

  const viewCandidateDetails = (candidateId) => {
    navigate(`/admin/candidates/${candidateId}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
            Interviewer Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor candidate performance and interview analytics
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/candidates')}
            className="btn btn-primary btn-lg flex items-center space-x-2"
          >
            <Users className="h-5 w-5" />
            <span>View All Candidates</span>
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</span>
              </div>
              <p className="text-gray-600">Total Candidates</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <Brain className="h-8 w-8 text-success-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</span>
              </div>
              <p className="text-gray-600">Total Interviews</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-warning-600" />
                <span className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </span>
              </div>
              <p className="text-gray-600">Average Score</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.completionRate}%</span>
              </div>
              <p className="text-gray-600">Completion Rate</p>
            </div>
          </div>
        )}

        {/* Recent Candidates */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Candidates</h3>
            <button
              onClick={() => navigate('/admin/candidates')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {!candidates || candidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
              <p className="text-gray-600">Candidates will appear here when they complete interviews</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Domain</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Interviews</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Interview</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{candidate.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{candidate.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {candidate.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{candidate.interviewCount}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getScoreColor(candidate.averageScore)}`}>
                          {candidate.averageScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(candidate.lastInterview).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => viewCandidateDetails(candidate._id)}
                          className="btn btn-secondary btn-sm flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
