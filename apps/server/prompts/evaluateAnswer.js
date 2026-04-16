const evaluateAnswerPrompt = (question, answer, difficulty, questionType) => {
  return `You are an expert evaluator assessing interview responses for a technical interview.

Question: ${question}
Question Type: ${questionType}
Difficulty Level: ${difficulty}
Candidate's Answer: ${answer}

Evaluate the candidate's answer comprehensively and provide structured feedback.

Evaluation Criteria:
1. Correctness and accuracy of the answer
2. Depth of understanding
3. Clarity and communication skills
4. Problem-solving approach
5. Relevance to the question asked

Scoring Guidelines (0-10 scale):
- 0-2: Poor - Incorrect answer, major misunderstandings
- 3-5: Fair - Partial understanding, some correct elements
- 6-7: Good - Solid understanding with minor gaps
- 8-9: Excellent - Comprehensive, accurate answer
- 10: Outstanding - Exceptional insight, perfect answer

Respond with a JSON object in this exact format:
{
  "score": 7,
  "feedback": "Detailed feedback explaining the score and areas for improvement",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["specific recommendation1", "specific recommendation2"]
}

Ensure your response is valid JSON only, no additional text.`;
};

module.exports = { evaluateAnswerPrompt };
