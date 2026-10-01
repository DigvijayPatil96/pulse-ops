const { GoogleGenAI } = require('@google/genai');

let aiClient = null;

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return null;
  }

  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({ apiKey });
      console.log('[AI Engine] Google Gemini AI client initialized successfully.');
    } catch (err) {
      console.error('[AI Engine] Failed to initialize Google Gemini client:', err.message);
      return null;
    }
  }

  return aiClient;
};

module.exports = { getGeminiClient };
