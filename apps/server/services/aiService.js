const openai = require('../config/openai');
const { generateQuestionPrompt } = require('../prompts/generateQuestion');
const { evaluateAnswerPrompt } = require('../prompts/evaluateAnswer');

class AIService {
  async generateQuestion(domain, difficulty, previousQuestions = []) {
    try {
      // Check if OpenAI API key is valid
      const apiKey = process.env.OPENAI_API_KEY;
      console.log('AI Service - API Key Check:', apiKey ? 'Key present' : 'No key');
      console.log('AI Service - API Key Value:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
      
      if (!apiKey || apiKey === 'your-openai-api-key-here') {
        console.log('Using fallback question generation (OpenAI API key not configured)');
        return this.generateFallbackQuestion(domain, difficulty, previousQuestions);
      }

      console.log('Using OpenAI to generate question for domain:', domain, 'difficulty:', difficulty);
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
      console.log('OpenAI question generated successfully');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating question with OpenAI:', error.message);
      console.log('Falling back to mock question generation');
      return this.generateFallbackQuestion(domain, difficulty, previousQuestions);
    }
  }

  generateFallbackQuestion(domain, difficulty, previousQuestions = []) {
    const questions = {
      'Computer Science': {
        Easy: [
          "What is the difference between a stack and a queue?",
          "Explain what a variable is in programming.",
          "What is the purpose of a function in programming?",
          "Describe what an array is and when you would use it."
        ],
        Medium: [
          "Explain the difference between synchronous and asynchronous programming.",
          "What is object-oriented programming and what are its main principles?",
          "How does a hash table work and what are its advantages?",
          "What is the difference between SQL and NoSQL databases?"
        ],
        Hard: [
          "Design a URL shortening service like bit.ly. What would be your approach?",
          "Explain how garbage collection works in programming languages.",
          "What is the CAP theorem and how does it affect database design?",
          "How would you implement a load balancer for a high-traffic website?"
        ]
      },
      'Marketing': {
        Easy: [
          "What is the difference between marketing and advertising?",
          "Explain what a target audience is.",
          "What is a marketing funnel?",
          "Describe what brand awareness means."
        ],
        Medium: [
          "How would you measure the success of a marketing campaign?",
          "What is A/B testing and how would you use it in marketing?",
          "Explain the difference between inbound and outbound marketing.",
          "How do you calculate customer lifetime value?"
        ],
        Hard: [
          "Design a marketing strategy for a new mobile app launch.",
          "How would you optimize conversion rates for an e-commerce website?",
          "What are the key metrics for measuring ROI in digital marketing?",
          "How would you handle a marketing crisis for a major brand?"
        ]
      },
      'Finance': {
        Easy: [
          "What is the difference between a stock and a bond?",
          "Explain what compound interest is.",
          "What is a budget and why is it important?",
          "Describe what inflation means."
        ],
        Medium: [
          "How do you calculate the return on investment (ROI)?",
          "What is diversification in investment and why is it important?",
          "Explain the difference between assets and liabilities.",
          "How do financial statements help in business decision making?"
        ],
        Hard: [
          "How would you value a private company for investment?",
          "What are the key factors in risk management for investments?",
          "Explain the impact of interest rates on the stock market.",
          "How would you structure a portfolio for different risk profiles?"
        ]
      }
    };

    // Get questions for the domain and difficulty
    const domainQuestions = questions[domain] || questions['Computer Science'];
    const difficultyQuestions = domainQuestions[difficulty] || domainQuestions['Medium'];

    // Filter out previously asked questions
    const availableQuestions = difficultyQuestions.filter(q => !previousQuestions.includes(q));

    // If all questions have been used, return a random one
    const questionPool = availableQuestions.length > 0 ? availableQuestions : difficultyQuestions;
    const randomQuestion = questionPool[Math.floor(Math.random() * questionPool.length)];

    return {
      question: randomQuestion,
      difficulty: difficulty,
      type: 'Technical'
    };
  }

  async evaluateAnswer(question, answer, difficulty, questionType) {
    try {
      // Check if OpenAI API key is valid
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        console.log('Using fallback answer evaluation (OpenAI API key not configured)');
        return this.generateFallbackEvaluation(answer, difficulty);
      }

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
      console.error('Error evaluating answer with OpenAI:', error.message);
      console.log('Falling back to mock answer evaluation');
      return this.generateFallbackEvaluation(answer, difficulty);
    }
  }

  generateFallbackEvaluation(answer, difficulty) {
    // Simple evaluation based on answer length and complexity
    const answerLength = answer.length;
    let score = 5; // Base score
    let feedback = '';
    let strengths = [];
    let weaknesses = [];

    if (answerLength < 50) {
      score = 2;
      feedback = "The answer is too brief. Please provide more detail and explanation.";
      weaknesses.push("Insufficient detail");
    } else if (answerLength < 150) {
      score = 5;
      feedback = "The answer provides basic information but could be more detailed.";
      strengths.push("Basic understanding");
      weaknesses.push("Lacks depth");
    } else if (answerLength < 300) {
      score = 7;
      feedback = "Good answer with decent detail and explanation.";
      strengths.push("Good explanation");
      strengths.push("Clear communication");
    } else {
      score = 9;
      feedback = "Excellent comprehensive answer with detailed explanation.";
      strengths.push("Comprehensive understanding");
      strengths.push("Clear communication");
      strengths.push("Detailed explanation");
    }

    // Adjust score based on difficulty
    if (difficulty === 'Hard') {
      score = Math.min(10, score - 1);
    } else if (difficulty === 'Easy') {
      score = Math.max(3, score + 1);
    }

    return {
      score,
      feedback,
      strengths,
      weaknesses
    };
  }

  async generateRecommendations(questions, overallScore) {
    try {
      // Check if OpenAI API key is valid
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        console.log('Using fallback recommendations (OpenAI API key not configured)');
        return this.generateFallbackRecommendations(overallScore);
      }

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
      console.error('Error generating recommendations with OpenAI:', error.message);
      console.log('Falling back to mock recommendations');
      return this.generateFallbackRecommendations(overallScore);
    }
  }

  generateFallbackRecommendations(overallScore) {
    if (overallScore >= 80) {
      return [
        "Continue practicing advanced technical problems",
        "Consider mentoring others to strengthen your understanding",
        "Explore specialized topics in your domain",
        "Work on system design and architecture questions"
      ];
    } else if (overallScore >= 60) {
      return [
        "Focus on strengthening fundamental concepts",
        "Practice more problem-solving questions",
        "Improve communication and explanation skills",
        "Study common interview patterns and algorithms"
      ];
    } else if (overallScore >= 40) {
      return [
        "Review basic concepts and fundamentals",
        "Practice explaining technical concepts clearly",
        "Work on time management during interviews",
        "Study core topics in your domain more thoroughly"
      ];
    } else {
      return [
        "Focus on learning fundamental concepts from scratch",
        "Practice basic problem-solving daily",
        "Take courses to strengthen your foundation",
        "Work on confidence and communication skills"
      ];
    }
  }
}

module.exports = new AIService();
