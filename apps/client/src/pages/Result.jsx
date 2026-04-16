import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import interviewService from '../services/interviewService'
import LoadingSpinner from '../components/LoadingSpinner'
import ProgressBar from '../components/ProgressBar'
import { 
  Download, 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Target,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

const Result = () => {
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [interviewId])

  const fetchResult = async () => {
    try {
      const response = await interviewService.getInterviewResult(interviewId)
      setResult(response.data)
    } catch (error) {
      toast.error('Failed to load interview results')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    // Create a simple text report
    const report = `
Adaptive AI Interview Report
============================

Candidate: ${user.username}
Domain: ${result.domain}
Date: ${new Date(result.completedAt).toLocaleDateString()}
Duration: ${Math.round(result.totalDuration / 60)} minutes

Overall Score: ${result.overallScore}/100
Level: ${result.level}

Skill Breakdown:
- Problem Solving: ${result.skillBreakdown.problemSolving}/100
- AI Knowledge: ${result.skillBreakdown.aiKnowledge}/100
- Communication: ${result.skillBreakdown.communication}/100

Recommendations:
${result.recommendations.map(rec => `- ${rec}`).join('\n')}

Interview Questions and Answers:
${result.questions.map((q, i) => `
Question ${i + 1} (${q.difficulty}):
${q.question}

Answer: ${q.answer}
Score: ${q.score}/10
Feedback: ${q.feedback}
`).join('\n')}
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-report-${interviewId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Report downloaded successfully')
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'success'
    if (score >= 40) return 'warning'
    return 'error'
  }

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Advanced':
        return <TrendingUp className="h-6 w-6 text-success-600" />
      case 'Intermediate':
        return <Target className="h-6 w-6 text-warning-600" />
      default:
        return <AlertCircle className="h-6 w-6 text-error-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Result Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Results</h1>
              <p className="text-gray-600 mt-1">{result.domain} • {result.questionCount} questions</p>
            </div>
          </div>
          <button
            onClick={downloadReport}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>

        {/* Overall Score Card */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {getLevelIcon(result.level)}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.level}</h3>
              <p className="text-gray-600">Performance Level</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {result.overallScore}
              </div>
              <div className="text-gray-600 mb-4">Overall Score</div>
              <ProgressBar 
                progress={result.overallScore} 
                color={getScoreColor(result.overallScore)}
                size="lg"
              />
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {Math.round(result.totalDuration / 60)}m {result.totalDuration % 60}s
              </h3>
              <p className="text-gray-600">Total Duration</p>
            </div>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="h-6 w-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Problem Solving</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {result.skillBreakdown.problemSolving}
            </div>
            <ProgressBar 
              progress={result.skillBreakdown.problemSolving} 
              color={getScoreColor(result.skillBreakdown.problemSolving)}
              size="sm"
            />
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="h-6 w-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">AI Knowledge</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {result.skillBreakdown.aiKnowledge}
            </div>
            <ProgressBar 
              progress={result.skillBreakdown.aiKnowledge} 
              color={getScoreColor(result.skillBreakdown.aiKnowledge)}
              size="sm"
            />
          </div>

          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="h-6 w-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Communication</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {result.skillBreakdown.communication}
            </div>
            <ProgressBar 
              progress={result.skillBreakdown.communication} 
              color={getScoreColor(result.skillBreakdown.communication)}
              size="sm"
            />
          </div>
        </div>

        {/* Recommendations */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Question Details */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Question Details</h3>
          <div className="space-y-6">
            {result.questions.map((question, index) => (
              <div key={index} className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    Question {index + 1} • {question.difficulty} • {question.questionType}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${
                    getScoreColor(question.score * 10) === 'success' ? 'green' :
                    getScoreColor(question.score * 10) === 'warning' ? 'amber' :
                    getScoreColor(question.score * 10) === 'error' ? 'red' : 'blue'
                  }-100 text-${
                    getScoreColor(question.score * 10) === 'success' ? 'green' :
                    getScoreColor(question.score * 10) === 'warning' ? 'amber' :
                    getScoreColor(question.score * 10) === 'error' ? 'red' : 'blue'
                  }-800`}>
                    {question.score}/10
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{question.question}</p>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                  <p className="text-gray-800">{question.answer}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-600 mb-1">Feedback:</p>
                  <p className="text-blue-800">{question.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Result
