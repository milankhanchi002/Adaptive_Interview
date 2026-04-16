const generateQuestionPrompt = (domain, difficulty, previousQuestions = []) => {
  const previousQuestionsText = previousQuestions.length > 0 
    ? `\nPrevious questions asked (avoid similar topics):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  return `You are an expert interviewer conducting an adaptive AI interview for a ${domain} position.

Generate a ${difficulty} level interview question that tests the candidate's skills and knowledge.

${previousQuestionsText}

Requirements:
1. Create a question that is appropriate for ${difficulty} difficulty level
2. Make it scenario-based or problem-solving oriented
3. Avoid repeating topics from previous questions
4. The question should be answerable in 2-3 minutes
5. Focus on practical, real-world applications

Difficulty Guidelines:
- Easy: Foundational concepts, straightforward scenarios
- Medium: Complex problems requiring analytical thinking
- Hard: Advanced concepts, multi-step problems, strategic thinking

Respond with a JSON object in this exact format:
{
  "question": "The interview question here",
  "type": "Scenario|Technical|Behavioral|Problem Solving",
  "difficulty": "${difficulty}",
  "expectedAnswer": "Brief description of what a good answer should include",
  "evaluationCriteria": ["criteria1", "criteria2", "criteria3"]
}

Ensure your response is valid JSON only, no additional text.`;
};

module.exports = { generateQuestionPrompt };
