import { createContext, useContext, useReducer } from 'react'

const InterviewContext = createContext()

const interviewReducer = (state, action) => {
  switch (action.type) {
    case 'START_INTERVIEW':
      return {
        ...state,
        currentInterview: {
          id: action.payload.interviewId,
          domain: action.payload.domain,
          currentQuestion: action.payload.question,
          questionType: action.payload.questionType,
          difficulty: action.payload.difficulty,
          questionNumber: action.payload.questionNumber,
          startTime: Date.now()
        },
        answers: [],
        isInterviewActive: true,
        loading: false
      }
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        answers: [
          ...state.answers,
          {
            question: state.currentInterview.currentQuestion,
            answer: action.payload.answer,
            timeTaken: action.payload.timeTaken
          }
        ],
        loading: true
      }
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentInterview: {
          ...state.currentInterview,
          currentQuestion: action.payload.question,
          questionType: action.payload.questionType,
          difficulty: action.payload.difficulty,
          questionNumber: action.payload.questionNumber
        },
        lastEvaluation: action.payload.evaluation,
        loading: false
      }
    case 'COMPLETE_INTERVIEW':
      return {
        ...state,
        currentInterview: null,
        isInterviewActive: false,
        lastResult: action.payload,
        loading: false
      }
    case 'ABANDON_INTERVIEW':
      return {
        ...state,
        currentInterview: null,
        isInterviewActive: false,
        answers: [],
        loading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

const initialState = {
  currentInterview: null,
  answers: [],
  isInterviewActive: false,
  lastResult: null,
  lastEvaluation: null,
  loading: false,
  error: null
}

export const InterviewProvider = ({ children }) => {
  const [state, dispatch] = useReducer(interviewReducer, initialState)

  const startInterview = (interviewData) => {
    dispatch({ type: 'START_INTERVIEW', payload: interviewData })
  }

  const submitAnswer = (answer, timeTaken) => {
    dispatch({ type: 'SUBMIT_ANSWER', payload: { answer, timeTaken } })
  }

  const nextQuestion = (questionData) => {
    dispatch({ type: 'NEXT_QUESTION', payload: questionData })
  }

  const completeInterview = (result) => {
    dispatch({ type: 'COMPLETE_INTERVIEW', payload: result })
  }

  const abandonInterview = () => {
    dispatch({ type: 'ABANDON_INTERVIEW' })
  }

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    startInterview,
    submitAnswer,
    nextQuestion,
    completeInterview,
    abandonInterview,
    setLoading,
    setError,
    clearError
  }

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  )
}

export const useInterview = () => {
  const context = useContext(InterviewContext)
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider')
  }
  return context
}
