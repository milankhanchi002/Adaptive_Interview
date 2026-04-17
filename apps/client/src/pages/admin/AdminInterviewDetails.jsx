import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminInterviewDetails = () => {
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [interview, setInterview] = useState(null)
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInterviewDetails()
  }, [interviewId])

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data - replace with actual API calls
      const mockInterview = {
        _id: interviewId,
        domain: 'Computer Science',
        status: 'Completed',
        overallScore: 78,
        level: 'Intermediate',
        questionCount: 8,
        totalDuration: 1800, // 30 minutes
        createdAt: new Date('2024-01-15'),
        questions: [
          {
            question: "Explain the concept of RESTful API design and its key principles.",
            answer: "RESTful API is an architectural style that uses HTTP methods to perform operations on resources. Key principles include statelessness, client-server architecture, cacheability, and uniform interface.",
            score: 8,
            feedback: "Good understanding of REST principles. Could provide more specific examples of HTTP methods and status codes.",
            strengths: ["Clear explanation", "Covered main principles"],
            weaknesses: ["Lacked specific examples", "Could mention HATEOAS"],
            difficulty: "Medium",
            questionType: "Technical",
            timeTaken: 120
          },
          {
            question: "How would you optimize a database query that's running slowly?",
            answer: "I would first analyze the query execution plan, then add appropriate indexes, consider query rewriting, and evaluate database configuration.",
            score: 7,
            feedback: "Good approach to query optimization. More specific techniques like covering indexes or query caching could be mentioned.",
            strengths: ["Systematic approach", "Mentioned execution plan"],
            weaknesses: ["Could be more specific about optimization techniques"],
            difficulty: "Hard",
            questionType: "Problem Solving",
            timeTaken: 180
          }
        ],
        skillBreakdown: {
          problemSolving: 75,
          aiKnowledge: 80,
          communication: 70
        },
        recommendations: [
          "Practice more database optimization problems",
          "Study specific indexing strategies",
          "Work on providing concrete examples in answers"
        ]
      }
      
      const mockCandidate = {
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
        averageScore: 72
      }
      
      setInterview(mockInterview)
      setCandidate(mockCandidate)
      
    } catch (error) {
      console.error('Fetch interview details error:', error)
      setError('Failed to load interview details')
      toast.error('Failed to load interview details')
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

  const getLevelBadgeColor = (level) => {
    const colors = {
      'Advanced': 'bg-success-100 text-success-800',
      'Intermediate': 'bg-warning-100 text-warning-800',
      'Beginner': 'bg-error-100 text-error-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading interview details...</p>
        </div>
      </div>
    )
  }

  if (error || !interview || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Interview details could not be loaded'}</p>
          <button
            onClick={() => navigate('/admin/candidates')}
            className="btn btn-primary"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/candidates')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Candidates</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Details</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{candidate.profile.firstName} {candidate.profile.lastName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Name</p>
              <p className="font-medium text-gray-900">
                {candidate.profile.firstName} {candidate.profile.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-medium text-gray-900">{candidate.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Experience Level</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(candidate.profile.experience)}`}>
                {candidate.profile.experience}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className={`font-medium ${getScoreColor(candidate.averageScore)}`}>
                {candidate.averageScore}%
              </p>
            </div>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="card mb-8 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overall Performance</h2>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="text-5xl font-bold text-primary-600">
                {interview.overallScore}
              </div>
              <div className="text-2xl text-gray-600">/100</div>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBadgeColor(interview.level)}`}>
                {interview.level} Level
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {interview.status}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {interview.domain}
              </span>
            </div>
          </div>
        </div>

        {/* Interview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">{interview.questionCount}</span>
            </div>
            <p className="text-gray-600">Questions Answered</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-success-600" />
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(interview.totalDuration / 60)}m
              </span>
            </div>
            <p className="text-gray-600">Total Duration</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-warning-600" />
              <span className="text-2xl font-bold text-gray-900">
                {interview.questions ? Math.round(interview.questions.reduce((sum, q) => sum + q.score, 0) / interview.questions.length * 10) : 0}
              </span>
            </div>
            <p className="text-gray-600">Average Score</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">{candidate.interviewCount}</span>
            </div>
            <p className="text-gray-600">Total Interviews</p>
          </div>
        </div>

        {/* Skill Breakdown */}
        {interview.skillBreakdown && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Skill Breakdown</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">Problem Solving</h4>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {interview.skillBreakdown.problemSolving}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${interview.skillBreakdown.problemSolving}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">AI Knowledge</h4>
                <div className="text-3xl font-bold text-success-600 mb-2">
                  {interview.skillBreakdown.aiKnowledge}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success-600 h-2 rounded-full"
                    style={{ width: `${interview.skillBreakdown.aiKnowledge}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">Communication</h4>
                <div className="text-3xl font-bold text-warning-600 mb-2">
                  {interview.skillBreakdown.communication}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-warning-600 h-2 rounded-full"
                    style={{ width: `${interview.skillBreakdown.communication}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Breakdown */}
        {interview.questions && interview.questions.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Question Breakdown</h3>
            <div className="space-y-4">
              {interview.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {question.questionType}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {question.timeTaken}s
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{question.question}</p>
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>Candidate Answer:</strong> {question.answer}
                      </p>
                      <p className="text-gray-700 text-sm">
                        <strong>AI Feedback:</strong> {question.feedback}
                      </p>
                    </div>
                    <div className="ml-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(question.score * 10)}`}>
                        {question.score * 10}
                      </div>
                      <div className="text-xs text-gray-500">/10</div>
                    </div>
                  </div>
                  
                  {question.strengths && question.strengths.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Strengths:</span>
                      </div>
                      <div className="text-sm text-green-700">
                        {question.strengths.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {question.weaknesses && question.weaknesses.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Areas to improve:</span>
                      </div>
                      <div className="text-sm text-yellow-700">
                        {question.weaknesses.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {interview.recommendations && interview.recommendations.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">AI Recommendations</h3>
            <div className="space-y-3">
              {interview.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminInterviewDetails
