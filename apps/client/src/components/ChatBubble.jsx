import { User, Bot } from 'lucide-react'

const ChatBubble = ({ message, isUser, timestamp, difficulty }) => {
  const getDifficultyColor = (diff) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800 border-green-200',
      'Medium': 'bg-amber-100 text-amber-800 border-amber-200',
      'Hard': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[diff] || ''
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex items-start space-x-2 max-w-2xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-600' : 'bg-gray-200'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-gray-600" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col space-y-1">
          <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
          
          {/* Metadata */}
          <div className={`flex items-center space-x-2 text-xs text-gray-500 ${isUser ? 'justify-end' : ''}`}>
            {timestamp && (
              <span>{new Date(timestamp).toLocaleTimeString()}</span>
            )}
            {!isUser && difficulty && (
              <span className={`px-2 py-1 rounded-full border ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBubble
