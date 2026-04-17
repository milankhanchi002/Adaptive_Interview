const OpenAI = require('openai');

// Debug: Check if API key is loaded
const apiKey = process.env.OPENAI_API_KEY;
console.log('OpenAI API Key Status:', apiKey ? 'Key loaded' : 'No key found');
console.log('API Key starts with:', apiKey ? apiKey.substring(0, 7) + '...' : 'N/A');

const openai = new OpenAI({
  apiKey: apiKey,
});

module.exports = openai;
