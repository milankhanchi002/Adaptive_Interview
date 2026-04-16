const Interview = require('../models/Interview');
const aiService = require('./aiService');
const difficultyService = require('./difficultyService');

class InterviewService {
  async startInterview(userId, domain) {
    try {
      // Create new interview document
      const interview = new Interview({
        user: userId,
        domain,
        status: 'In Progress',
        questions: [],
        questionCount: 0
      });

      await interview.save();

      // Generate first question (medium difficulty)
      const questionData = await aiService.generateQuestion(domain, 'Medium');

      return {
        interviewId: interview._id,
        question: questionData.question,
        questionType: questionData.type,
        difficulty: questionData.difficulty,
        questionNumber: 1
      };
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  }

  async submitAnswer(interviewId, answer, timeTaken) {
    try {
      const interview = await Interview.findById(interviewId).populate('user');
      if (!interview) {
        throw new Error('Interview not found');
      }

      if (interview.status !== 'In Progress') {
        throw new Error('Interview is not active');
      }

      // Get the last question to evaluate the answer
      const previousQuestions = interview.questions.map(q => q.question);
      const lastQuestion = previousQuestions[previousQuestions.length - 1];
      const lastDifficulty = interview.questions.length > 0 
        ? interview.questions[interview.questions.length - 1].difficulty 
        : 'Medium';

      // Evaluate the answer using AI
      const evaluation = await aiService.evaluateAnswer(
        lastQuestion,
        answer,
        lastDifficulty,
        interview.questions.length > 0 
          ? interview.questions[interview.questions.length - 1].questionType 
          : 'Technical'
      );

      // Add question-answer pair to interview
      interview.questions.push({
        question: lastQuestion,
        answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        difficulty: lastDifficulty,
        questionType: interview.questions.length > 0 
          ? interview.questions[interview.questions.length - 1].questionType 
          : 'Technical',
        timeTaken
      });

      interview.questionCount += 1;

      // Check if interview should end
      const scores = interview.questions.map(q => q.score);
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      const shouldEnd = difficultyService.shouldEndInterview(interview.questionCount, totalScore);

      if (shouldEnd) {
        // Calculate final results
        interview.calculateOverallScore();
        interview.determineLevel();
        interview.calculateSkillBreakdown();
        
        // Generate recommendations
        interview.recommendations = await aiService.generateRecommendations(
          interview.questions,
          interview.overallScore
        );

        interview.status = 'Completed';
        interview.totalDuration = interview.questions.reduce((sum, q) => sum + q.timeTaken, 0);

        await interview.save();

        return {
          isCompleted: true,
          results: {
            overallScore: interview.overallScore,
            level: interview.level,
            skillBreakdown: interview.skillBreakdown,
            recommendations: interview.recommendations,
            totalDuration: interview.totalDuration,
            questionCount: interview.questionCount
          }
        };
      } else {
        // Generate next question
        const nextDifficulty = difficultyService.calculateNextDifficulty(
          scores,
          lastDifficulty
        );

        const nextQuestionData = await aiService.generateQuestion(
          interview.domain,
          nextDifficulty,
          previousQuestions
        );

        // Store next question info (we'll need it for evaluation)
        interview.questions.push({
          question: nextQuestionData.question,
          answer: '', // Will be filled when user answers
          score: 0,
          feedback: '',
          strengths: [],
          weaknesses: [],
          difficulty: nextQuestionData.difficulty,
          questionType: nextQuestionData.type,
          timeTaken: 0
        });

        await interview.save();

        return {
          isCompleted: false,
          nextQuestion: {
            question: nextQuestionData.question,
            questionType: nextQuestionData.type,
            difficulty: nextQuestionData.difficulty,
            questionNumber: interview.questionCount + 1
          },
          evaluation: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses
          }
        };
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  async getInterviewResult(interviewId, userId) {
    try {
      const interview = await Interview.findOne({ _id: interviewId, user: userId });
      if (!interview) {
        throw new Error('Interview not found');
      }

      return {
        id: interview._id,
        domain: interview.domain,
        status: interview.status,
        overallScore: interview.overallScore,
        level: interview.level,
        skillBreakdown: interview.skillBreakdown,
        recommendations: interview.recommendations,
        questions: interview.questions,
        totalDuration: interview.totalDuration,
        questionCount: interview.questionCount,
        createdAt: interview.createdAt,
        completedAt: interview.updatedAt
      };
    } catch (error) {
      console.error('Error getting interview result:', error);
      throw error;
    }
  }

  async getUserInterviews(userId, page = 1, limit = 10) {
    try {
      const interviews = await Interview.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('domain status overallScore level questionCount totalDuration createdAt');

      const total = await Interview.countDocuments({ user: userId });

      return {
        interviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user interviews:', error);
      throw error;
    }
  }

  async abandonInterview(interviewId, userId) {
    try {
      const interview = await Interview.findOne({ _id: interviewId, user: userId });
      if (!interview) {
        throw new Error('Interview not found');
      }

      if (interview.status === 'In Progress') {
        interview.status = 'Abandoned';
        await interview.save();
      }

      return true;
    } catch (error) {
      console.error('Error abandoning interview:', error);
      throw error;
    }
  }
}

module.exports = new InterviewService();
