import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  Users, 
  Search, 
  Filter, 
  Eye,
  UserCheck,
  TrendingUp,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminCandidates = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDomain, setFilterDomain] = useState('all')

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data - replace with actual API call
      const mockCandidates = [
        {
          _id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            domain: 'Computer Science',
            experience: 'Intermediate'
          },
          interviewCount: 5,
          averageScore: 72,
          highestScore: 85,
          lastInterview: new Date('2024-01-15'),
          totalDuration: 45,
          status: 'active'
        },
        {
          _id: '2',
          username: 'jane_smith',
          email: 'jane@example.com',
          profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            domain: 'Marketing',
            experience: 'Advanced'
          },
          interviewCount: 3,
          averageScore: 85,
          highestScore: 92,
          lastInterview: new Date('2024-01-14'),
          totalDuration: 38,
          status: 'active'
        },
        {
          _id: '3',
          username: 'bob_wilson',
          email: 'bob@example.com',
          profile: {
            firstName: 'Bob',
            lastName: 'Wilson',
            domain: 'Finance',
            experience: 'Beginner'
          },
          interviewCount: 8,
          averageScore: 68,
          highestScore: 78,
          lastInterview: new Date('2024-01-13'),
          totalDuration: 52,
          status: 'active'
        }
      ]
      
      setCandidates(mockCandidates)
      
    } catch (error) {
      console.error('Fetch candidates error:', error)
      setError('Failed to load candidates')
      toast.error('Failed to load candidates')
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

  const getExperienceColor = (experience) => {
    const colors = {
      'Beginner': 'bg-error-100 text-error-800',
      'Intermediate': 'bg-warning-100 text-warning-800',
      'Advanced': 'bg-success-100 text-success-800'
    }
    return colors[experience] || 'bg-gray-100 text-gray-800'
  }

  const viewCandidateDetails = (candidateId) => {
    navigate(`/admin/interview/${candidateId}`)
  }

  const exportData = () => {
    toast.info('Export feature coming soon!')
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${candidate.profile.firstName} ${candidate.profile.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDomain = filterDomain === 'all' || candidate.profile.domain === filterDomain
    
    return matchesSearch && matchesDomain
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCandidates}
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
            <button
              onClick={exportData}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
          <p className="text-gray-600">
            View and manage all candidates who have taken interviews
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Domains</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">{candidates.length}</span>
            </div>
            <p className="text-gray-600">Total Candidates</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-success-600" />
              <span className="text-2xl font-bold text-gray-900">
                {candidates.length > 0 ? Math.round(candidates.reduce((sum, c) => sum + c.averageScore, 0) / candidates.length) : 0}%
              </span>
            </div>
            <p className="text-gray-600">Average Score</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="h-8 w-8 text-warning-600" />
              <span className="text-2xl font-bold text-gray-900">
                {candidates.filter(c => c.averageScore >= 70).length}
              </span>
            </div>
            <p className="text-gray-600">High Performers</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <Eye className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                {candidates.reduce((sum, c) => sum + c.interviewCount, 0)}
              </span>
            </div>
            <p className="text-gray-600">Total Interviews</p>
          </div>
        </div>

        {/* Candidates Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">All Candidates</h3>
            <span className="text-sm text-gray-600">
              {filteredCandidates.length} of {candidates.length} candidates
            </span>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600">
                {searchTerm || filterDomain !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No candidates have completed interviews yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Candidate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Domain</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Experience</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Interviews</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Highest</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Interview</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <UserCheck className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {candidate.profile.firstName} {candidate.profile.lastName}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">{candidate.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {candidate.profile.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(candidate.profile.experience)}`}>
                          {candidate.profile.experience}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{candidate.interviewCount}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getScoreColor(candidate.averageScore)}`}>
                          {candidate.averageScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getScoreColor(candidate.highestScore)}`}>
                          {candidate.highestScore}%
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
                          <span>View Details</span>
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

export default AdminCandidates
