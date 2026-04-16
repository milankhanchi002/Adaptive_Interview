import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Interview from './pages/Interview'
import Result from './pages/Result'
import Dashboard from './pages/Dashboard'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Handle authentication redirects
    if (!loading && isAuthenticated) {
      navigate('/dashboard')
    } else if (!loading && !isAuthenticated && window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/interview/:interviewId" 
          element={isAuthenticated ? <Interview /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/result/:interviewId" 
          element={isAuthenticated ? <Result /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

export default App
