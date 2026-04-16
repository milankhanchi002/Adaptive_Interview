# Adaptive AI Interview Platform

A full-stack monorepo application that dynamically conducts AI-driven interviews where questions adapt in real-time based on user answers.

## 🏗️ Monorepo Structure

```
adaptive-interview/
├── apps/
│   ├── client/          # React frontend (Vite)
│   └── server/          # Node.js backend (Express)
├── packages/
│   └── shared/          # Shared utilities and types
├── docs/                # Documentation
└── package.json         # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key

### Installation

1. **Install all dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**
   ```bash
   # In apps/server directory
   cp .env.example .env
   ```
   
   Edit `apps/server/.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/adaptive-interview
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key-here
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start development servers**
   ```bash
   # Start both client and server concurrently
   npm run dev
   
   # Or start individually
   npm run dev:client  # Frontend on http://localhost:3000
   npm run dev:server  # Backend on http://localhost:5000
   ```

## 📦 Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run build` - Build the client for production
- `npm run start` - Start the server in production mode
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Clean all node_modules directories
- `npm run test` - Run tests across all workspaces

## 🎯 Features

- **Adaptive Interview System**: Questions adjust difficulty based on performance
- **AI-Powered**: OpenAI integration for question generation and evaluation
- **Real-time Chat Interface**: Conversational interview experience
- **Comprehensive Analytics**: Detailed feedback and skill breakdowns
- **Modern Tech Stack**: React 18, Node.js, MongoDB, Tailwind CSS

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./docs/contributing.md)

## 🏃‍♂️ Development Workflow

This monorepo uses npm workspaces for efficient dependency management:

1. All dependencies are managed from the root
2. Shared packages can be easily shared between apps
3. Concurrent development of frontend and backend
4. Consistent tooling and configurations

## 📦 Workspaces

### Client (`apps/client`)
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication

### Server (`apps/server`)
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- OpenAI API integration

### Shared (`packages/shared`)
- Common types and interfaces
- Shared utilities
- Validation schemas
- Constants and enums

## 🚀 Deployment

### Client Deployment
```bash
npm run build
# Deploy apps/client/dist to your hosting platform
```

### Server Deployment
```bash
npm run build:server
npm run start
# Deploy apps/server to your hosting platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across all workspaces
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.
