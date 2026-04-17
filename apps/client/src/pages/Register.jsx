import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    profile: {
      firstName: '',
      lastName: '',
      domain: 'Computer Science',
      experience: 'Beginner'
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  
  const { register, error, clearError, loading, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Register useEffect:', { registrationSuccess, loading, isAuthenticated, user })
  }, [registrationSuccess, loading, navigate, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      // Prepare submission data
      const submissionData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      }

      // Only include profile data for candidates
      if (formData.role === 'user') {
        submissionData.profile = {
          firstName: formData.profile.firstName,
          lastName: formData.profile.lastName,
          domain: formData.profile.domain,
          experience: formData.profile.experience
        }
      } else {
        // For interviewers, include empty profile or minimal data
        submissionData.profile = {
          firstName: formData.profile.firstName,
          lastName: formData.profile.lastName
        }
      }

      const result = await register(submissionData)
      if (result.success) {
        toast.success(result.message || 'Account created successfully. Please login.')
        console.log('Registration successful, forcing redirect to login...')
        // Force redirect using window.location to avoid any React Router interference
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      } else {
        toast.error(result.error)
        clearError()
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Brain className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join our AI Interview Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose your role and get started with AI-powered interviews
          </p>
        </div>

        {/* Register Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="profile.firstName"
                  type="text"
                  value={formData.profile.firstName}
                  onChange={handleChange}
                  className="input"
                  placeholder="John"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="profile.lastName"
                  type="text"
                  value={formData.profile.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="johndoe"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to join as
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">Candidate</span>
                    <p className="text-sm text-gray-600">Take AI interviews and improve my skills</p>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="interviewer"
                    checked={formData.role === 'interviewer'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">Interviewer</span>
                    <p className="text-sm text-gray-600">Review candidate performance and analytics</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Profile fields only for candidates */}
            {formData.role === 'user' && (
              <>
                <div>
                  <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <select
                    id="domain"
                    name="profile.domain"
                    value={formData.profile.domain}
                    onChange={handleChange}
                    className="input"
                    disabled={isLoading}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    id="experience"
                    name="profile.experience"
                    value={formData.profile.experience}
                    onChange={handleChange}
                    className="input"
                    disabled={isLoading}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="•••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary flex justify-center items-center space-x-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {formData.role === 'user' ? 'Join as Candidate' : 'Join as Interviewer'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
