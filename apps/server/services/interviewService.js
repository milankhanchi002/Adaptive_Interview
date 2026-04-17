const Interview = require('../models/Interview');
const aiService = require('./aiService');
const difficultyService = require('./difficultyService');

class InterviewService {
  async startInterview(userId, domain) {
    try {
      // Generate first question (medium difficulty)
      const questionData = await aiService.generateQuestion(domain, 'Medium');

      // Create new interview document with first question
      const interview = new Interview({
        user: userId,
        domain,
        status: 'In Progress',
        questions: [{
          question: questionData.question,
          strengths: [],
          weaknesses: [],
          difficulty: questionData.difficulty,
          questionType: questionData.type
        }],
        questionCount: 1
      });

      await interview.save();

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

  async getNextQuestion(interviewId, userId) {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Interview not found');
      }

      if (interview.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized access to interview');
      }

      // Get the last unanswered question (if any)
      const questions = interview.questions;
      const lastQuestion = questions.length > 0 ? questions[questions.length - 1] : null;

      if (lastQuestion && !lastQuestion.answer) {
        // Return the current unanswered question
        return {
          question: lastQuestion.question,
          questionType: lastQuestion.questionType,
          difficulty: lastQuestion.difficulty,
          questionNumber: questions.length
        };
      } else {
        // Generate a new question (safe, no AI calls)
        const nextQuestionText = this.generateSafeQuestion(questions.length + 1);
        
        // Store the next question in the last question object
        if (lastQuestion) {
          lastQuestion.nextQuestion = {
            question: nextQuestionText,
            questionType: 'Technical',
            difficulty: 'Medium'
          };
          await interview.save();
        }
        
        return {
          question: nextQuestionText,
          questionType: 'Technical',
          difficulty: 'Medium',
          questionNumber: questions.length + 1
        };
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      throw error;
    }
  }

  // Safe question generator (no AI calls)
  generateSafeQuestion(questionNumber) {
    const questions = [
      "What is object-oriented programming and what are its main principles?",
      "Explain the difference between abstract classes and interfaces in OOP.",
      "What is polymorphism and how does it work in programming?",
      "Describe the concept of encapsulation with examples.",
      "What is inheritance and how is it used in object-oriented programming?",
      "Explain the difference between stack and heap memory.",
      "What is the difference between synchronous and asynchronous programming?",
      "Describe the concept of recursion with an example.",
      "What is the difference between SQL and NoSQL databases?",
      "Explain the concept of Big O notation and time complexity."
    ];
    
    return questions[questionNumber % questions.length];
  }

  async submitAnswer(interviewId, answer, timeTaken) {
    try {
      console.log('InterviewService.submitAnswer called with:', { interviewId, answerLength: answer?.length, timeTaken });
      
      const interview = await Interview.findById(interviewId).populate('user');
      if (!interview) {
        throw new Error('Interview not found');
      }

      if (interview.status !== 'In Progress') {
        throw new Error('Interview is not active');
      }

      // Check if the last question already has an answer (prevent duplicate submissions)
      const lastQuestionObj = interview.questions[interview.questions.length - 1];
      if (lastQuestionObj && lastQuestionObj.answer && lastQuestionObj.answer.trim() !== '') {
        console.log('Duplicate submission detected - last question already answered');
        throw new Error('Duplicate submission - question already answered');
      }

      console.log('Interview found:', interview._id, 'with', interview.questions.length, 'questions');

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

      // Update the last question with the answer and evaluation
      const lastQuestionIndex = interview.questions.length - 1;
      interview.questions[lastQuestionIndex] = {
        ...interview.questions[lastQuestionIndex],
        answer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        timeTaken
      };

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
          strengths: [],
          weaknesses: [],
          difficulty: nextQuestionData.difficulty,
          questionType: nextQuestionData.type
        });

        interview.questionCount += 1;
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
      console.log('Getting interview result for interviewId:', interviewId, 'userId:', userId);
      
      // Validate ObjectId format first
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        throw new Error('Invalid interview ID format');
      }

      const interview = await Interview.findOne({ _id: interviewId, user: userId });
      if (!interview) {
        throw new Error('Interview not found');
      }

      console.log('Interview found:', interview._id, 'with', interview.questions?.length || 0, 'questions');

      // Calculate performance metrics
      const questions = interview.questions || [];
      const answeredQuestions = questions.filter(q => q.answer && q.answer.trim() !== '');
      
      console.log('Answered questions:', answeredQuestions.length, 'out of', questions.length);
      
      // Handle case with no questions or no answers
      if (answeredQuestions.length === 0) {
        console.log('No answered questions found, returning default results');
        
        const defaultResult = {
          id: interview._id,
          domain: interview.domain || 'Unknown',
          status: interview.status || 'In Progress',
          overallScore: 0,
          level: 'Beginner',
          levelDescription: 'No questions answered yet. Complete the interview to see your results.',
          skillBreakdown: {
            communication: 0,
            technicalKnowledge: 0,
            problemSolving: 0,
            timeManagement: 0
          },
          recommendations: [
            {
              type: 'improvement',
              title: 'Complete Interview',
              description: 'Please complete the interview to receive performance feedback.'
            }
          ],
          questions: [],
          totalDuration: 0,
          questionCount: 0,
          averageScore: 0,
          createdAt: interview.createdAt,
          completedAt: interview.updatedAt,
          summary: {
            totalQuestions: 0,
            averageTimePerQuestion: 0,
            performanceLevel: 'Not Assessed',
            strengths: [],
            improvements: [
              {
                type: 'improvement',
                title: 'Complete Interview',
                description: 'Please complete the interview to receive performance feedback.'
              }
            ]
          }
        };

        // Update interview with default results
        interview.overallScore = 0;
        interview.level = 'Beginner';
        interview.skillBreakdown = defaultResult.skillBreakdown;
        interview.recommendations = defaultResult.recommendations;
        interview.totalDuration = 0;
        interview.questionCount = 0;
        await interview.save();

        return defaultResult;
      }
      
      // Calculate scores based on answer length and time taken
      let totalScore = 0;
      let totalTimeTaken = 0;
      let performanceAnalysis = [];

      answeredQuestions.forEach((question, index) => {
        const answerLength = question.answer.length;
        const timeTaken = question.timeTaken || 0;
        
        // Score calculation based on answer quality
        let score = 0;
        let feedback = '';
        
        if (answerLength < 20) {
          score = 2; // Poor - too short
          feedback = 'Answer was too brief. Please provide more detailed responses.';
        } else if (answerLength < 50) {
          score = 4; // Fair - basic answer
          feedback = 'Good start, but could be more comprehensive.';
        } else if (answerLength < 100) {
          score = 6; // Good - decent answer
          feedback = 'Good answer with reasonable detail.';
        } else if (answerLength < 200) {
          score = 8; // Very good - detailed answer
          feedback = 'Excellent detailed answer.';
        } else {
          score = 10; // Outstanding - very comprehensive
          feedback = 'Outstanding comprehensive answer!';
        }

        // Time bonus/penalty
        if (timeTaken > 0) {
          if (timeTaken < 30) {
            score -= 1; // Too fast - might be rushed
            feedback += ' (Answered very quickly - consider taking more time to think)';
          } else if (timeTaken > 300) {
            score -= 1; // Too slow - might be overthinking
            feedback += ' (Took a long time - try to be more concise)';
          } else {
            score += 1; // Good timing
            feedback += ' (Good timing)';
          }
        }

        score = Math.max(0, Math.min(10, score)); // Clamp between 0-10
        totalScore += score;
        totalTimeTaken += timeTaken;

        performanceAnalysis.push({
          questionNumber: index + 1,
          question: question.question,
          answer: question.answer,
          score: score,
          feedback: feedback,
          timeTaken: timeTaken,
          answerLength: answerLength,
          difficulty: question.difficulty || 'Medium'
        });
      });

      // Calculate overall metrics
      const averageScore = answeredQuestions.length > 0 ? (totalScore / answeredQuestions.length) : 0;
      const overallScore = Math.round(averageScore);
      
      // Determine performance level
      let level = '';
      let levelDescription = '';
      
      if (overallScore >= 8) {
        level = 'Expert';
        levelDescription = 'Outstanding performance! You demonstrate excellent understanding.';
      } else if (overallScore >= 6) {
        level = 'Advanced';
        levelDescription = 'Great job! You show strong knowledge and good communication skills.';
      } else if (overallScore >= 4) {
        level = 'Intermediate';
        levelDescription = 'Good effort! You have a solid foundation with room for improvement.';
      } else {
        level = 'Beginner';
        levelDescription = 'Keep practicing! Focus on providing more detailed and thoughtful answers.';
      }

      // Generate recommendations based on performance
      const recommendations = this.generateRecommendations(performanceAnalysis, overallScore);

      // Calculate detailed skill breakdown
      const communicationScores = performanceAnalysis.map(q => q.score);
      const technicalScores = performanceAnalysis.filter(q => q.questionType === 'Technical').map(q => q.score);
      const problemSolvingScores = performanceAnalysis.filter(q => q.questionType === 'Problem Solving').map(q => q.score);
      
      const skillBreakdown = {
        communication: {
          score: communicationScores.length > 0 ? Math.round(communicationScores.reduce((a, b) => a + b, 0) / communicationScores.length) : 0,
          maxScore: communicationScores.length > 0 ? Math.max(...communicationScores) : 0,
          minScore: communicationScores.length > 0 ? Math.min(...communicationScores) : 0,
          consistency: this.calculateConsistency(communicationScores)
        },
        technicalKnowledge: {
          score: technicalScores.length > 0 ? Math.round(technicalScores.reduce((a, b) => a + b, 0) / technicalScores.length) : 0,
          maxScore: technicalScores.length > 0 ? Math.max(...technicalScores) : 0,
          minScore: technicalScores.length > 0 ? Math.min(...technicalScores) : 0,
          consistency: technicalScores.length > 0 ? this.calculateConsistency(technicalScores) : 100
        },
        problemSolving: {
          score: problemSolvingScores.length > 0 ? Math.round(problemSolvingScores.reduce((a, b) => a + b, 0) / problemSolvingScores.length) : 0,
          maxScore: problemSolvingScores.length > 0 ? Math.max(...problemSolvingScores) : 0,
          minScore: problemSolvingScores.length > 0 ? Math.min(...problemSolvingScores) : 0,
          consistency: problemSolvingScores.length > 0 ? this.calculateConsistency(problemSolvingScores) : 100
        },
        timeManagement: {
          score: totalTimeTaken > 0 ? Math.max(0, 10 - (totalTimeTaken / answeredQuestions.length / 60)) : 5,
          averageTimePerQuestion: answeredQuestions.length > 0 ? Math.round(totalTimeTaken / answeredQuestions.length) : 0,
          totalTime: totalTimeTaken,
          efficiency: this.calculateTimeEfficiency(performanceAnalysis)
        }
      };

      // Calculate performance trends
      const performanceTrends = this.calculatePerformanceTrends(performanceAnalysis);

      // Generate detailed insights
      const insights = this.generateInsights(performanceAnalysis, overallScore, skillBreakdown);

      // Update interview with calculated results
      interview.overallScore = overallScore;
      interview.level = level;
      interview.skillBreakdown = skillBreakdown;
      interview.recommendations = recommendations;
      interview.totalDuration = totalTimeTaken;
      interview.questionCount = answeredQuestions.length;
      interview.status = 'Completed';
      await interview.save();

      console.log('Interview results calculated:', {
        overallScore,
        level,
        totalQuestions: answeredQuestions.length,
        totalTimeTaken
      });

      return {
        id: interview._id,
        domain: interview.domain,
        status: interview.status,
        overallScore: overallScore,
        level: level,
        levelDescription: levelDescription,
        skillBreakdown: skillBreakdown,
        recommendations: recommendations,
        questions: performanceAnalysis,
        totalDuration: totalTimeTaken,
        questionCount: answeredQuestions.length,
        averageScore: averageScore,
        createdAt: interview.createdAt,
        completedAt: interview.updatedAt,
        performanceTrends: performanceTrends,
        insights: insights,
        summary: {
          totalQuestions: answeredQuestions.length,
          averageTimePerQuestion: answeredQuestions.length > 0 ? Math.round(totalTimeTaken / answeredQuestions.length) : 0,
          performanceLevel: level,
          strengths: recommendations.filter(r => r.type === 'strength'),
          improvements: recommendations.filter(r => r.type === 'improvement'),
          scoreDistribution: this.calculateScoreDistribution(performanceAnalysis),
          timeDistribution: this.calculateTimeDistribution(performanceAnalysis),
          overallGrade: this.calculateOverallGrade(overallScore)
        }
      };
    } catch (error) {
      console.error('Error getting interview result:', error);
      throw error;
    }
  }

  // Generate recommendations based on performance
  generateRecommendations(performanceAnalysis, overallScore) {
    const recommendations = [];
    
    if (overallScore >= 8) {
      recommendations.push({
        type: 'strength',
        title: 'Excellent Communication',
        description: 'You provide detailed and comprehensive answers.'
      });
      recommendations.push({
        type: 'improvement',
        title: 'Continue Learning',
        description: 'Keep up the great work and explore advanced topics.'
      });
    } else if (overallScore >= 6) {
      recommendations.push({
        type: 'strength',
        title: 'Good Knowledge Base',
        description: 'You demonstrate solid understanding of concepts.'
      });
      recommendations.push({
        type: 'improvement',
        title: 'Add More Detail',
        description: 'Try to provide more specific examples in your answers.'
      });
    } else {
      recommendations.push({
        type: 'improvement',
        title: 'Expand Your Answers',
        description: 'Focus on providing more detailed and comprehensive responses.'
      });
      recommendations.push({
        type: 'improvement',
        title: 'Practice Timing',
        description: 'Work on balancing thoroughness with conciseness.'
      });
    }

    // Time-based recommendations (only if we have performance data)
    if (performanceAnalysis.length > 0) {
      const avgTime = performanceAnalysis.reduce((sum, q) => sum + q.timeTaken, 0) / performanceAnalysis.length;
      if (avgTime < 30) {
        recommendations.push({
          type: 'improvement',
          title: 'Slow Down',
          description: 'Take more time to think through your answers.'
        });
      } else if (avgTime > 180) {
        recommendations.push({
          type: 'improvement',
          title: 'Be More Concise',
          description: 'Try to answer more efficiently while maintaining detail.'
        });
      }
    }

    return recommendations;
  }

  // Calculate consistency of scores
  calculateConsistency(scores) {
    if (scores.length < 2) return 100;
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = more consistent
    return Math.max(0, Math.round(100 - (standardDeviation * 10)));
  }

  // Calculate time efficiency
  calculateTimeEfficiency(performanceAnalysis) {
    const totalTime = performanceAnalysis.reduce((sum, q) => sum + q.timeTaken, 0);
    const averageTime = totalTime / performanceAnalysis.length;
    
    // Optimal time is 60-120 seconds per question
    if (averageTime >= 60 && averageTime <= 120) return 100;
    if (averageTime < 60) return Math.max(0, 100 - (60 - averageTime));
    return Math.max(0, 100 - (averageTime - 120));
  }

  // Calculate performance trends
  calculatePerformanceTrends(performanceAnalysis) {
    if (performanceAnalysis.length < 3) return { trend: 'insufficient_data', improvement: 0 };
    
    const firstHalf = performanceAnalysis.slice(0, Math.floor(performanceAnalysis.length / 2));
    const secondHalf = performanceAnalysis.slice(Math.floor(performanceAnalysis.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, q) => sum + q.score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, q) => sum + q.score, 0) / secondHalf.length;
    
    const improvement = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    return {
      trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
      improvement: Math.round(improvement),
      firstHalfAverage: Math.round(firstHalfAvg),
      secondHalfAverage: Math.round(secondHalfAvg)
    };
  }

  // Generate detailed insights
  generateInsights(performanceAnalysis, overallScore, skillBreakdown) {
    const insights = [];
    
    // Performance insights
    if (overallScore >= 8) {
      insights.push({
        type: 'achievement',
        title: 'Exceptional Performance',
        description: 'You demonstrate outstanding knowledge and communication skills.',
        icon: '🏆'
      });
    } else if (overallScore >= 6) {
      insights.push({
        type: 'achievement', 
        title: 'Strong Performance',
        description: 'You show good understanding and solid skills.',
        icon: '🌟'
      });
    }
    
    // Time management insights
    const avgTime = performanceAnalysis.reduce((sum, q) => sum + q.timeTaken, 0) / performanceAnalysis.length;
    if (avgTime < 30) {
      insights.push({
        type: 'timing',
        title: 'Quick Responder',
        description: 'You answer questions quickly. Consider taking more time for detailed responses.',
        icon: '⚡'
      });
    } else if (avgTime > 180) {
      insights.push({
        type: 'timing',
        title: 'Thoughtful Responder',
        description: 'You take time to think through answers. Try to be more concise.',
        icon: '🤔'
      });
    }
    
    // Consistency insights
    const consistency = skillBreakdown.communication.consistency;
    if (consistency >= 80) {
      insights.push({
        type: 'consistency',
        title: 'Consistent Performer',
        description: 'Your performance is very consistent across questions.',
        icon: '📈'
      });
    }
    
    return insights;
  }

  // Calculate score distribution
  calculateScoreDistribution(performanceAnalysis) {
    const distribution = {
      excellent: 0,  // 8-10
      good: 0,        // 6-7
      average: 0,      // 4-5
      poor: 0          // 0-3
    };
    
    performanceAnalysis.forEach(q => {
      if (q.score >= 8) distribution.excellent++;
      else if (q.score >= 6) distribution.good++;
      else if (q.score >= 4) distribution.average++;
      else distribution.poor++;
    });
    
    return distribution;
  }

  // Calculate time distribution
  calculateTimeDistribution(performanceAnalysis) {
    const times = performanceAnalysis.map(q => q.timeTaken);
    const sorted = times.sort((a, b) => a - b);
    
    return {
      fastest: Math.min(...times),
      slowest: Math.max(...times),
      average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      median: times.length % 2 === 0 
        ? Math.round((sorted[times.length / 2 - 1] + sorted[times.length / 2]) / 2)
        : sorted[Math.floor(times.length / 2)]
    };
  }

  // Calculate overall grade
  calculateOverallGrade(score) {
    if (score >= 9) return { grade: 'A+', color: '#10b981', description: 'Outstanding' };
    if (score >= 8) return { grade: 'A', color: '#059669', description: 'Excellent' };
    if (score >= 7) return { grade: 'B+', color: '#0891b2', description: 'Very Good' };
    if (score >= 6) return { grade: 'B', color: '#3b82f6', description: 'Good' };
    if (score >= 5) return { grade: 'C+', color: '#eab308', description: 'Satisfactory' };
    if (score >= 4) return { grade: 'C', color: '#f59e0b', description: 'Average' };
    return { grade: 'F', color: '#ef4444', description: 'Needs Improvement' };
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
