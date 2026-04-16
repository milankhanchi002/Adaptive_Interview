import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brain, Target, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Questions",
      description: "Dynamic question generation tailored to your domain and skill level"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Adaptive Difficulty",
      description: "Questions adjust in real-time based on your performance"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Detailed Feedback",
      description: "Get comprehensive evaluation with strengths and improvement areas"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Assessment",
      description: "Immediate scoring and feedback as you progress"
    }
  ]

  const stats = [
    { label: "Questions Generated", value: "10K+" },
    { label: "Success Rate", value: "95%" },
    { label: "Domains Covered", value: "4+" },
    { label: "Avg. Interview Time", value: "15 min" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Your Interview with
              <span className="text-gradient"> Adaptive AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience intelligent interviews that adapt to your skill level in real-time. 
              Get personalized feedback and improve your performance with every session.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-primary text-lg px-8 py-3"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-secondary text-lg px-8 py-3"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Adaptive AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform uses cutting-edge AI to provide a personalized interview experience
              that helps you grow and succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Get started in minutes with our simple process</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account and set your profile preferences</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Take Interview</h3>
              <p className="text-gray-600">Start an adaptive interview in your chosen domain</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">Receive detailed feedback and improvement recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Interview Skills?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their interview performance 
            with our adaptive AI platform.
          </p>
          {!user && (
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3"
            >
              Get Started Now
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
