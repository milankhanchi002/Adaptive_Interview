const interviewService = require('../services/interviewService');
const Joi = require('joi');

// Validation schemas
const startInterviewSchema = Joi.object({
  domain: Joi.string().valid('Computer Science', 'Marketing', 'Finance', 'Other').required()
});

const submitAnswerSchema = Joi.object({
  answer: Joi.string().min(10).required(),
  timeTaken: Joi.number().integer().min(1).required()
});

class InterviewController {
  async startInterview(req, res, next) {
    try {
      const { error } = startInterviewSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { domain } = req.body;
      const userId = req.user._id;

      const result = await interviewService.startInterview(userId, domain);

      res.json({
        success: true,
        message: 'Interview started successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAnswer(req, res, next) {
    try {
      const { error } = submitAnswerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { interviewId } = req.params;
      const { answer, timeTaken } = req.body;

      const result = await interviewService.submitAnswer(interviewId, answer, timeTaken);

      res.json({
        success: true,
        message: result.isCompleted ? 'Interview completed' : 'Answer submitted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewResult(req, res, next) {
    try {
      const { interviewId } = req.params;
      const userId = req.user._id;

      const result = await interviewService.getInterviewResult(interviewId, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
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
