const interviewService = require('../services/interviewService');
const Joi = require('joi');

// Validation schemas
const startInterviewSchema = Joi.object({
  domain: Joi.string().valid('Computer Science', 'Marketing', 'Finance', 'Other').required()
});

const submitAnswerSchema = Joi.object({
  answer: Joi.string().required(),
  timeTaken: Joi.number().optional(),
  question: Joi.string().optional()
});

class InterviewController {
  async startInterview(req, res, next) {
    try {
      const { error } = startInterviewSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check database connection
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
          error: 'Database is not connected. Please check server configuration.' 
        });
      }

      const { domain } = req.body;
      const userId = req.user._id;

      const result = await interviewService.startInterview(userId, domain);

      console.log('Interview service result:', result);
      console.log('Sending response:', {
        success: true,
        message: 'Interview started successfully',
        data: result
      });

      res.json({
        success: true,
        message: 'Interview started successfully',
        data: result
      });
    } catch (error) {
      console.error('Start interview controller error:', error);
      if (error.name === 'MongooseServerSelectionError') {
        return res.status(503).json({ 
          error: 'Database connection failed. Please check MongoDB Atlas configuration.' 
        });
      }
      next(error);
    }
  }

  async getNextQuestion(req, res, next) {
    try {
      const interviewId = req.params.interviewId;
      const userId = req.user._id;

      console.log('getNextQuestion called with interviewId:', interviewId, 'userId:', userId);
      
      // Validate ObjectId format
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        console.error('Invalid ObjectId format in getNextQuestion:', interviewId);
        return res.status(400).json({
          success: false,
          message: "Invalid interview ID format"
        });
      }
      
      const interview = await interviewService.getNextQuestion(interviewId, userId);
      console.log('getNextQuestion result:', interview);
      
      res.json({
        success: true,
        data: interview
      });
    } catch (error) {
      console.error('getNextQuestion controller error:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }

  async submitAnswer(req, res, next) {
    try {
      // Log request details for debugging
      console.error('=== SUBMIT ANSWER DEBUG ===');
      console.error('req.body:', req.body);
      console.error('req.params.id:', req.params.id);
      
      // Extract data from request body
      const { answer, question, timeTaken } = req.body;

      // Validate only the answer field (must be non-empty)
      if (!answer || answer.trim() === '') {
        console.error('Validation failed: Answer is required or empty');
        return res.status(400).json({
          success: false,
          message: "Answer is required"
        });
      }

      // Get interview ID from params
      const interviewId = req.params.interviewId;
      console.error('Processing answer submission for interview:', interviewId);

      // Import Interview model and mongoose for ObjectId validation
      const Interview = require('../models/Interview');
      const mongoose = require('mongoose');
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        console.error('Invalid ObjectId format:', interviewId);
        return res.status(400).json({
          success: false,
          message: "Invalid interview ID format"
        });
      }
      
      // Fetch interview using Interview.findById
      const interview = await Interview.findById(interviewId);
      
      // Return 404 if interview does not exist
      if (!interview) {
        console.error('Interview not found with ID:', interviewId);
        return res.status(404).json({
          success: false,
          message: "Interview not found"
        });
      }

      // Check authentication
      if (!req.user) {
        console.error('Authentication failed: req.user is undefined');
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      // Ensure interview.questions exists (initialize to empty array if undefined)
      if (!interview.questions) {
        console.error('Initializing questions array (was undefined)');
        interview.questions = [];
      }

      console.error('Current questions count before push:', interview.questions.length);

      // Safely push { question, answer, timeTaken } into interview.questions
      const answerData = {
        question: question || "Unknown question",
        answer: answer.trim(),
        timeTaken: Number(timeTaken) || 0,
        score: 5, // Default score
        feedback: "Answer recorded successfully",
        strengths: [],
        weaknesses: [],
        difficulty: "Medium",
        questionType: "Technical"
      };

      interview.questions.push(answerData);

      // Save the interview document
      await interview.save();
      console.error('Interview saved successfully');

      // Check if interview should be completed (after 10 questions)
      const MAX_QUESTIONS = 10;
      const isComplete = interview.questions.length >= MAX_QUESTIONS;

      if (isComplete) {
        // Mark interview as completed
        interview.status = 'Completed';
        await interview.save();
        
        console.error('Interview completed after', interview.questions.length, 'questions');
        console.error('=== SUBMIT ANSWER COMPLETE ===');

        return res.json({
          success: true,
          message: "Interview completed successfully",
          data: {
            isComplete: true,
            totalQuestions: interview.questions.length,
            redirectUrl: `/user/result/${interviewId}`
          }
        });
      }

      // Generate next question (safe, no AI/OpenAI calls to prevent crashes)
      const nextQuestion = "What is the difference between abstract classes and interfaces in OOP?";

      // Return success response with next question
      const responseData = {
        question: nextQuestion,
        difficulty: "Medium",
        questionNumber: interview.questions.length + 1,
        isComplete: false
      };

      console.error('Answer saved, returning next question:', responseData.questionNumber);
      console.error('=== SUBMIT ANSWER SUCCESS ===');

      return res.json({
        success: true,
        message: "Answer submitted successfully",
        data: responseData
      });

    } catch (err) {
      // Comprehensive error logging
      console.error('=== SUBMIT ANSWER ERROR ===');
      console.error('Error details:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Request body was:', req.body);
      console.error('Request params were:', req.params);
      console.error('=== END ERROR ===');
      
      // Always return JSON response even in error cases
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message
      });
    }
  }

  async getInterviewResult(req, res, next) {
    try {
      const interviewId = req.params.interviewId;
      const userId = req.user._id;

      console.log('getInterviewResult called with interviewId:', interviewId, 'userId:', userId);

      // Validate ObjectId format
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        console.error('Invalid ObjectId format in getInterviewResult:', interviewId);
        return res.status(400).json({
          success: false,
          message: "Invalid interview ID format"
        });
      }

      const result = await interviewService.getInterviewResult(interviewId, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('getInterviewResult controller error:', error);
      console.error('Error details:', error.message);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }

  async getUserInterviews(req, res, next) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await interviewService.getUserInterviews(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async abandonInterview(req, res, next) {
    try {
      const { interviewId } = req.params;
      const userId = req.user._id;

      await interviewService.abandonInterview(interviewId, userId);

      res.json({
        success: true,
        message: 'Interview abandoned successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewStats(req, res, next) {
    try {
      const userId = req.user._id;
      const Interview = require('../models/Interview');

      const stats = await Interview.aggregate([
        { $match: { user: userId, status: 'Completed' } },
        {
          $group: {
            _id: null,
            totalInterviews: { $sum: 1 },
            averageScore: { $avg: '$overallScore' },
            highestScore: { $max: '$overallScore' },
            lowestScore: { $min: '$overallScore' },
            totalDuration: { $sum: '$totalDuration' },
            averageQuestions: { $avg: '$questionCount' }
          }
        },
        {
          $project: {
            _id: 0,
            totalInterviews: 1,
            averageScore: { $round: ['$averageScore', 1] },
            highestScore: 1,
            lowestScore: 1,
            totalDuration: 1,
            averageQuestions: { $round: ['$averageQuestions', 1] },
            averageDuration: { $round: [{ $divide: ['$totalDuration', '$totalInterviews'] }] }
          }
        }
      ]);

      const domainStats = await Interview.aggregate([
        { $match: { user: userId, status: 'Completed' } },
        {
          $group: {
            _id: '$domain',
            count: { $sum: 1 },
            averageScore: { $avg: '$overallScore' }
          }
        },
        {
          $project: {
            domain: '$_id',
            count: 1,
            averageScore: { $round: ['$averageScore', 1] },
            _id: 0
          }
        }
      ]);

      const result = stats[0] || {
        totalInterviews: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalDuration: 0,
        averageQuestions: 0,
        averageDuration: 0
      };

      res.json({
        success: true,
        data: {
          ...result,
          domainStats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InterviewController();
