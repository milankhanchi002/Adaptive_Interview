const express = require('express');
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All interview routes are protected
router.use(authMiddleware);

// Start a new interview
router.post('/start', interviewController.startInterview);

// Get next question in interview
router.get('/:interviewId/next', interviewController.getNextQuestion);

// Submit answer to current question
router.post('/:interviewId/answer', interviewController.submitAnswer);

// Get interview results
router.get('/result/:interviewId', interviewController.getInterviewResult);

// Get user's interview history
router.get('/history', interviewController.getUserInterviews);

// Abandon an interview
router.post('/:interviewId/abandon', interviewController.abandonInterview);

// Get interview statistics
router.get('/stats', interviewController.getInterviewStats);

module.exports = router;
