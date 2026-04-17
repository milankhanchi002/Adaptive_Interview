import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain, LogOut, User, BarChart3 } from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleHomeClick = () => {
    if (user) {
      // If logged in, redirect to appropriate dashboard
      if (user.role === 'interviewer') {
        navigate('/admin/dashboard')
      } else {
        navigate('/user/dashboard')
      }
    } else {
      // If not logged in, go to home page
      navigate('/')
    }
  }

  const handleLogout = () => {
    logout()
    // Redirect will be handled by App.jsx useEffect
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button onClick={handleHomeClick} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">AdaptiveAI</span>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`
                }
              >
                Home
              </NavLink>
              {user && (
                <>
                  {user.role === 'user' ? (
                    <>
                      <NavLink
                        to="/user/dashboard"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`
                        }
                      >
                        Dashboard
                      </NavLink>
                      <NavLink
                        to="/user/interview"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`
                        }
                      >
                        Interview
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`
                        }
                      >
                        Dashboard
                      </NavLink>
                      <NavLink
                        to="/admin/candidates"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`
                        }
                      >
                        Candidates
                      </NavLink>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <NavLink
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="btn btn-primary text-sm"
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 Adaptive AI Interview Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
