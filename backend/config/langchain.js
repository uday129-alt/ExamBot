import { logger } from '../utils/logger.js';

export function initLangChain() {
  const isTracing = process.env.LANGCHAIN_TRACING_V2 === 'true';
  const apiKey = process.env.LANGCHAIN_API_KEY;
  const project = process.env.LANGCHAIN_PROJECT || 'AI_EXAM_GENERATOR';

  if (isTracing && apiKey && !apiKey.includes('placeholder')) {
    logger.success(`LangChain/LangSmith Tracing is ENABLED for project: "${project}"`);
  } else {
    logger.warn('LangChain/LangSmith Tracing is DISABLED. Set LANGCHAIN_API_KEY and LANGCHAIN_TRACING_V2=true in .env to enable.');
  }

  return {
    tracingEnabled: isTracing && !!apiKey,
    project
  };
}
