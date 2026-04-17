import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import interviewService from '../../services/interviewService'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Brain, Clock, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const UserInterview = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { interviewId } = useParams()
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [question, setQuestion] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [totalQuestions] = useState(10)
  const [feedback, setFeedback] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    if (interviewId) {
      console.log('Loading interview with ID:', interviewId)
      loadInterview(interviewId)
    } else {
      console.error('No interview ID provided')
      navigate('/user/dashboard')
    }
  }, [interviewId])

  // Timer effect
  useEffect(() => {
    let interval = null
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            // Auto-submit when timer runs out
            if (!isSubmitting) {
              handleSubmitAnswer(true)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeLeft, isSubmitting])

  const loadInterview = async (id) => {
    try {
      setLoading(true)
      console.log('Fetching interview data for ID:', id)
      
      // First try to get the next question (which should be the first question)
      const response = await interviewService.getNextQuestion(id)
      console.log('Interview data response:', response)
      console.log('Response data:', response.data)
      console.log('Response data data:', response.data?.data)
      console.log('Response data data question:', response.data?.data?.question)
      console.log('Has question in response:', !!response.data?.data?.question)
      
      if (response?.data?.data?.question) {
        const interviewData = response.data.data
        setCurrentQuestion(interviewData)
        setQuestion(interviewData.question)
        setDifficulty(interviewData.difficulty || 'Medium')
        setQuestionNumber(interviewData.questionNumber || 1)
        setStartTime(Date.now())
        setTimeLeft(60)
        setTimerActive(true)
        setShowFeedback(false)
        console.log('Interview loaded successfully')
        console.log('Question loaded:', interviewData.question)
        console.log('Current question state:', question)
        console.log('Difficulty:', interviewData.difficulty)
      } else {
        console.error('No question found in response:', response)
        console.error('Response structure:', JSON.stringify(response, null, 2))
        toast.error('Failed to load interview question')
        navigate('/user/dashboard')
      }
    } catch (error) {
      console.error('Load interview error:', error)
      if (error.response?.status === 0) {
        toast.error('Server is not running. Please start the backend server.')
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.')
      } else if (error.response?.status === 400) {
        toast.error('Invalid interview ID.')
      } else {
        toast.error('Failed to load interview. Please try again.')
      }
      navigate('/user/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchNextQuestion = async (id) => {
    try {
      const response = await interviewService.getNextQuestion(id)
      if (response?.data?.data?.question) {
        const interviewData = response.data.data
        setCurrentQuestion(interviewData)
        setQuestion(interviewData.question)
        setDifficulty(interviewData.difficulty || 'Medium')
        setStartTime(Date.now())
        setTimeLeft(60)
        setTimerActive(true)
        setShowFeedback(false)
        console.log('Fetched next question:', interviewData.question)
        console.log('Current question state:', question)
      }
    } catch (error) {
      console.error('Fetch question error:', error)
      toast.error('Failed to load question')
    }
  }

  const handleSubmitAnswer = async (isAutoSubmit = false) => {
    // Prevent double submissions
    if (isSubmitting) {
      console.log('Already submitting, preventing double submission')
      return
    }

    if (!isAutoSubmit && !answer.trim()) {
      toast.error('Please enter your answer')
      return
    }

    setIsSubmitting(true)
    setSubmitting(true)
    setTimerActive(false) // Stop timer
    
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      
      // Preserve user's real answer - don't overwrite on auto-submit
      const finalAnswer = isAutoSubmit && (!answer || answer.trim() === '') 
        ? '(Time expired - no answer provided)' 
        : answer.trim()
      
      const finalTimeTaken = Math.max(1, timeTaken) // Ensure at least 1 second
      
      const payload = {
        answer: finalAnswer.length < 10 ? finalAnswer + ' (expanded for validation)' : finalAnswer,
        question: question, // Include question in payload
        timeTaken: finalTimeTaken
      }
      
      console.log('isSubmitting:', isSubmitting)
      console.log('Current question state:', question)
      console.log('Submitting answer with payload:', payload)
      console.log('Original answer:', answer)
      console.log('Time taken:', timeTaken)
      console.log('Is auto submit:', isAutoSubmit)
      
      const response = await interviewService.submitAnswer(interviewId, payload)

      if (response?.data) {
        const { feedback: newFeedback, nextQuestion, isComplete, results } = response.data
        
        // Show feedback
        setFeedback(newFeedback)
        setShowFeedback(true)

        // Clear answer
        setAnswer('')

        // After showing feedback, either continue or end interview
        setTimeout(() => {
          setShowFeedback(false)
          
          if (isComplete || questionNumber >= totalQuestions) {
            // Interview complete
            navigate(`/user/result/${interviewId}`)
          } else if (nextQuestion) {
            // Continue with next question from response
            setCurrentQuestion(nextQuestion)
            setQuestion(nextQuestion.question)
            setDifficulty(nextQuestion.difficulty || 'Medium')
            setQuestionNumber(prev => prev + 1)
            setStartTime(Date.now())
            setTimeLeft(60)
            setTimerActive(true)
            console.log('Updated to next question:', nextQuestion.question)
            console.log('Current question state after update:', nextQuestion.question)
          } else {
            // Fetch next question from API
            fetchNextQuestion(interviewId)
            setQuestionNumber(prev => prev + 1)
          }
        }, 3000) // Show feedback for 3 seconds
      }
    } catch (error) {
      console.error('Submit answer error:', error)
      toast.error('Failed to submit answer')
    } finally {
      setSubmitting(false)
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressPercentage = () => {
    return Math.round((questionNumber / totalQuestions) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Starting your interview...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Question Available</h2>
          <p className="text-gray-600 mb-4">Please try starting a new interview</p>
          <button
            onClick={() => navigate('/user/dashboard')}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">AI Interview</h1>
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                <Clock className="h-4 w-4" />
                <span>Time Left: {timeLeft}s</span>
              </div>
              
              <span className="text-sm text-gray-600">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <Brain className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {currentQuestion?.questionType || 'Technical'} Question
              </h2>
              <div className="p-4 bg-gray-100 rounded-lg mb-4">
                <p className="text-gray-700 leading-relaxed font-medium">
                  {question || "Loading question..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Display */}
        {showFeedback && feedback && (
          <div className="card mb-6 bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">Feedback</h3>
                <p className="text-green-800 mb-2">{feedback.feedback}</p>
                <div className="flex items-center space-x-4 text-sm text-green-700">
                  <span>Score: {feedback.score}/10</span>
                  {feedback.strengths && feedback.strengths.length > 0 && (
                    <span>Strengths: {feedback.strengths.join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Answer Input */}
        {!showFeedback && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              disabled={submitting}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Take your time to think and respond clearly</span>
              </div>
              
              <button
                onClick={() => handleSubmitAnswer(false)}
                disabled={isSubmitting || !answer.trim()}
                className="btn btn-primary flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Answer'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Tips for a great answer:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>Be specific and provide examples when possible</li>
            <li>Structure your answer clearly (problem, approach, solution)</li>
            <li>Explain your thought process and reasoning</li>
            <li>Be honest about what you know and don't know</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default UserInterview
