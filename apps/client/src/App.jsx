import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
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

// Role-based components (to be created)
import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserInterview from './pages/user/UserInterview'
import UserResult from './pages/user/UserResult'
import AdminCandidates from './pages/admin/AdminCandidates'
import AdminInterviewDetails from './pages/admin/AdminInterviewDetails'

function App() {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('App useEffect:', { loading, isAuthenticated, user, currentPath: location.pathname })
    
    // Don't redirect while loading
    if (loading) return

    // Get current path
    const currentPath = location.pathname

    // Public routes
    const publicRoutes = ['/', '/login', '/register']
    const isPublicRoute = publicRoutes.includes(currentPath)

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      console.log('App: Not authenticated, redirecting to login')
      navigate('/login')
      return
    }

    // If authenticated and trying to access auth routes
    if (isAuthenticated && (currentPath === '/login' || currentPath === '/register')) {
      console.log('App: Authenticated on auth route, redirecting to dashboard')
      // Role-based redirect
      if (user?.role === 'interviewer') {
        navigate('/admin/dashboard')
      } else {
        navigate('/user/dashboard')
      }
      return
    }

    // If authenticated and on home page, redirect to appropriate dashboard
    if (isAuthenticated && currentPath === '/') {
      console.log('App: Authenticated on home, redirecting to dashboard')
      if (user?.role === 'interviewer') {
        navigate('/admin/dashboard')
      } else {
        navigate('/user/dashboard')
      }
      return
    }
  }, [loading, isAuthenticated, user, location.pathname, navigate])

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
          element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'interviewer' ? '/admin/dashboard' : '/user/dashboard'} />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to={user?.role === 'interviewer' ? '/admin/dashboard' : '/user/dashboard'} />} 
        />
        
        {/* User Routes */}
        <Route 
          path="/user/dashboard" 
          element={isAuthenticated && user?.role === 'user' ? <UserDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/user/interview/:interviewId" 
          element={isAuthenticated && user?.role === 'user' ? <UserInterview /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/user/result/:interviewId" 
          element={isAuthenticated && user?.role === 'user' ? <UserResult /> : <Navigate to="/login" />} 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={isAuthenticated && user?.role === 'interviewer' ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/candidates" 
          element={isAuthenticated && user?.role === 'interviewer' ? <AdminCandidates /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/interview/:interviewId" 
          element={isAuthenticated && user?.role === 'interviewer' ? <AdminInterviewDetails /> : <Navigate to="/login" />} 
        />
        
        {/* Legacy routes (redirect to role-based) */}
        <Route 
          path="/dashboard" 
          element={<Navigate to={user?.role === 'interviewer' ? '/admin/dashboard' : '/user/dashboard'} />} 
        />
        <Route 
          path="/interview/:interviewId" 
          element={<Navigate to={user?.role === 'interviewer' ? '/admin/interview/:interviewId' : '/user/interview'} />} 
        />
        <Route 
          path="/result/:interviewId" 
          element={<Navigate to={user?.role === 'interviewer' ? '/admin/interview/:interviewId' : '/user/result/:interviewId'} />} 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}

export default App
