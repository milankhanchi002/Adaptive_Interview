const mongoose = require('mongoose');

const questionAnswerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  feedback: {
    type: String,
    default: ''
  },
  strengths: [String],
  weaknesses: [String],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  questionType: {
    type: String,
    enum: ['Scenario', 'Technical', 'Behavioral', 'Problem Solving'],
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    enum: ['Computer Science', 'Marketing', 'Finance', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Abandoned'],
    default: 'In Progress'
  },
  questions: [questionAnswerSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  skillBreakdown: {
    communication: {
      score: { type: Number, min: 0, max: 100 },
      maxScore: { type: Number, min: 0, max: 100 },
      minScore: { type: Number, min: 0, max: 100 },
      consistency: { type: Number, min: 0, max: 100 }
    },
    technicalKnowledge: {
      score: { type: Number, min: 0, max: 100 },
      maxScore: { type: Number, min: 0, max: 100 },
      minScore: { type: Number, min: 0, max: 100 },
      consistency: { type: Number, min: 0, max: 100 }
    },
    problemSolving: {
      score: { type: Number, min: 0, max: 100 },
      maxScore: { type: Number, min: 0, max: 100 },
      minScore: { type: Number, min: 0, max: 100 },
      consistency: { type: Number, min: 0, max: 100 }
    },
    timeManagement: {
      score: { type: Number, min: 0, max: 100 },
      averageTimePerQuestion: { type: Number, min: 0 },
      totalTime: { type: Number, min: 0 },
      efficiency: { type: Number, min: 0, max: 100 }
    }
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },
  recommendations: [{
    type: {
      type: String,
      enum: ['strength', 'improvement'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  totalDuration: {
    type: Number // in seconds
  },
  questionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

interviewSchema.methods.calculateOverallScore = function() {
  if (this.questions.length === 0) return 0;
  
  const totalScore = this.questions.reduce((sum, qa) => sum + qa.score, 0);
  this.overallScore = Math.round((totalScore / this.questions.length) * 10);
  
  return this.overallScore;
};

interviewSchema.methods.determineLevel = function() {
  const score = this.overallScore || this.calculateOverallScore();
  
  if (score >= 70) {
    this.level = 'Advanced';
  } else if (score >= 40) {
    this.level = 'Intermediate';
  } else {
    this.level = 'Beginner';
  }
  
  return this.level;
};

interviewSchema.methods.calculateSkillBreakdown = function() {
  const problemSolvingQuestions = this.questions.filter(q => 
    q.questionType === 'Problem Solving' || q.questionType === 'Technical'
  );
  const aiKnowledgeQuestions = this.questions.filter(q => 
    q.questionType === 'Technical'
  );
  const communicationQuestions = this.questions.filter(q => 
    q.questionType === 'Behavioral' || q.questionType === 'Scenario'
  );
  
  this.skillBreakdown = {
    problemSolving: this.calculateCategoryScore(problemSolvingQuestions),
    aiKnowledge: this.calculateCategoryScore(aiKnowledgeQuestions),
    communication: this.calculateCategoryScore(communicationQuestions)
  };
  
  return this.skillBreakdown;
};

interviewSchema.methods.calculateCategoryScore = function(questions) {
  if (questions.length === 0) return 0;
  
  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
  return Math.round((totalScore / questions.length) * 10);
};

module.exports = mongoose.model('Interview', interviewSchema);
