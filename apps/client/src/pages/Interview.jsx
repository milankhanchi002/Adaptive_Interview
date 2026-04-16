import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInterview } from '../context/InterviewContext'
import { useAuth } from '../context/AuthContext'
import interviewService from '../services/interviewService'
import ChatBubble from '../components/ChatBubble'
import ProgressBar from '../components/ProgressBar'
import LoadingSpinner from '../components/LoadingSpinner'
import { Send, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Interview = () => {
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    currentInterview,
    answers,
    isInterviewActive,
    lastEvaluation,
    loading,
    startInterview,
    submitAnswer,
    nextQuestion,
    completeInterview,
    abandonInterview
  } = useInterview()

  const [currentAnswer, setCurrentAnswer] = useState('')
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showEvaluation, setShowEvaluation] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [answers, currentInterview, showEvaluation])

  useEffect(() => {
    if (interviewId && !currentInterview) {
      // Load existing interview or start new one
      loadInterview()
    }
  }, [interviewId])

  const loadInterview = async () => {
    try {
      // For now, we'll assume this is a new interview
      // In a real app, you might want to check if it's an existing interview
      const response = await interviewService.startInterview('Computer Science')
      const { interviewId: id, ...interviewData } = response.data
      
      startInterview({
        interviewId: id,
        ...interviewData
      })
      setQuestionStartTime(Date.now())
    } catch (error) {
      toast.error('Failed to load interview')
      navigate('/dashboard')
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please enter an answer')
      return
    }

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)
    
    try {
      submitAnswer(currentAnswer, timeTaken)
      setCurrentAnswer('')
      
      const response = await interviewService.submitAnswer(
        currentInterview.id,
        currentAnswer,
        timeTaken
      )

      if (response.data.isCompleted) {
        completeInterview(response.data.results)
        navigate(`/result/${currentInterview.id}`)
      } else {
        nextQuestion(response.data.nextQuestion)
        setShowEvaluation(true)
        setQuestionStartTime(Date.now())
        
        // Hide evaluation after 3 seconds and continue
        setTimeout(() => {
          setShowEvaluation(false)
        }, 3000)
      }
    } catch (error) {
      toast.error('Failed to submit answer')
    }
  }

  const handleAbandon = async () => {
    if (window.confirm('Are you sure you want to abandon this interview?')) {
      try {
        await interviewService.abandonInterview(currentInterview.id)
        abandonInterview()
        navigate('/dashboard')
        toast.success('Interview abandoned')
      } catch (error) {
        toast.error('Failed to abandon interview')
      }
    }
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'success',
      'Medium': 'warning',
      'Hard': 'error'
    }
    return colors[difficulty] || 'primary'
  }

  if (loading && !currentInterview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentInterview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview Not Found</h2>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">AI Interview</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Question {currentInterview.questionNumber}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${
                  getDifficultyColor(currentInterview.difficulty) === 'success' ? 'green' :
                  getDifficultyColor(currentInterview.difficulty) === 'warning' ? 'amber' :
                  getDifficultyColor(currentInterview.difficulty) === 'error' ? 'red' : 'blue'
                }-100 text-${
                  getDifficultyColor(currentInterview.difficulty) === 'success' ? 'green' :
                  getDifficultyColor(currentInterview.difficulty) === 'warning' ? 'amber' :
                  getDifficultyColor(currentInterview.difficulty) === 'error' ? 'red' : 'blue'
                }-800`}>
                  {currentInterview.difficulty}
                </span>
              </div>
              <button
                onClick={handleAbandon}
                className="btn btn-secondary text-sm"
              >
                End Interview
              </button>
            </div>
          </div>
          <ProgressBar 
            progress={(currentInterview.questionNumber / 10) * 100} 
            size="sm"
            className="mt-3"
          />
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {/* Initial Question */}
            <ChatBubble
              message={currentInterview.currentQuestion}
              isUser={false}
              difficulty={currentInterview.difficulty}
            />

            {/* Previous Answers */}
            {answers.map((answer, index) => (
              <div key={index}>
                <ChatBubble
                  message={answer.answer}
                  isUser={true}
                />
              </div>
            ))}

            {/* Current Answer */}
            {currentAnswer && (
              <ChatBubble
                message={currentAnswer}
                isUser={true}
              />
            )}

            {/* Evaluation Feedback */}
            {showEvaluation && lastEvaluation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-slide-up">
                <h4 className="font-medium text-blue-900 mb-2">Evaluation</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Score:</strong> {lastEvaluation.score}/10</p>
                  <p><strong>Feedback:</strong> {lastEvaluation.feedback}</p>
                  {lastEvaluation.strengths.length > 0 && (
                    <p><strong>Strengths:</strong> {lastEvaluation.strengths.join(', ')}</p>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitAnswer()
                  }
                }}
                placeholder="Type your answer here..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                disabled={loading}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || loading}
                className="btn btn-primary self-end flex items-center space-x-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Submit</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to submit, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Interview
