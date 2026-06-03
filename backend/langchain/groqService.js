import { ChatGroq } from '@langchain/groq';
import { logger } from '../utils/logger.js';

let chatModel = null;

export function getChatModel() {
  if (chatModel) return chatModel;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('temp_key')) {
    logger.warn('Groq API Key is not set or is a placeholder. AI operations will run in simulated mode.');
    return null;
  }

  try {
    chatModel = new ChatGroq({
      apiKey: apiKey,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });
    logger.success('Groq LLM Client (llama-3.3-70b-versatile) initialized.');
    return chatModel;
  } catch (error) {
    logger.error('Failed to initialize Groq LLM client', error);
    logger.warn('Operating Groq operations in simulated/mock fallback mode.');
    return null;
  }
}
