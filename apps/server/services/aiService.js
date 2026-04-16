const openai = require('../config/openai');
const { generateQuestionPrompt } = require('../prompts/generateQuestion');
const { evaluateAnswerPrompt } = require('../prompts/evaluateAnswer');

class AIService {
  async generateQuestion(domain, difficulty, previousQuestions = []) {
    try {
      const prompt = generateQuestionPrompt(domain, difficulty, previousQuestions);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer generating adaptive interview questions. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const content = response.choices[0].message.content.trim();
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating question:', error);
      throw new Error('Failed to generate question');
    }
  }

  async evaluateAnswer(question, answer, difficulty, questionType) {
    try {
      const prompt = evaluateAnswerPrompt(question, answer, difficulty, questionType);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert evaluator assessing interview responses. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const content = response.choices[0].message.content.trim();
      return JSON.parse(content);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw new Error('Failed to evaluate answer');
    }
  }

  async generateRecommendations(questions, overallScore) {
    try {
      const questionsText = questions.map((q, i) => 
        `Q${i + 1}: ${q.question}\nScore: ${q.score}/10\nFeedback: ${q.feedback}`
      ).join('\n\n');

      const prompt = `Based on the following interview performance, generate 3-5 specific, actionable recommendations for improvement.

Overall Score: ${overallScore}/100

Interview Performance:
${questionsText}

Provide recommendations that are:
1. Specific and actionable
2. Tailored to the performance shown
3. Focused on skill development
4. Prioritized by importance

Respond with a JSON array:
["recommendation1", "recommendation2", "recommendation3"]`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a career coach providing personalized recommendations. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      const content = response.choices[0].message.content.trim();
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return ["Focus on practicing more technical questions", "Improve communication clarity", "Study fundamental concepts"];
    }
  }
}

module.exports = new AIService();
