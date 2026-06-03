import { pipeline } from '@xenova/transformers';
import { logger } from '../utils/logger.js';

let extractor = null;
let initializationFailed = false;

async function getExtractor() {
  if (initializationFailed) return null;
  if (extractor) return extractor;

  try {
    logger.info('Initializing Xenova all-MiniLM-L6-v2 pipeline (this may take a few seconds on first run)...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    logger.success('Xenova all-MiniLM-L6-v2 pipeline initialized.');
    return extractor;
  } catch (error) {
    logger.error('Failed to initialize Xenova transformers pipeline. Falling back to mock embeddings.', error);
    initializationFailed = true;
    return null;
  }
}

/**
 * Generate a 384-dimension embedding vector for a given text.
 * Falls back to a deterministic hash-based vector generator if the ONNX pipeline fails to load.
 */
export async function getEmbedding(text) {
  const model = await getExtractor();
  
  if (!model) {
    return generateFallbackEmbedding(text);
  }

  try {
    const output = await model(text, { pooling: 'mean', normalize: true });
    // Convert Float32Array to standard array
    return Array.from(output.data);
  } catch (error) {
    logger.error('Embedding generation failed, utilizing fallback.', error);
    return generateFallbackEmbedding(text);
  }
}

/**
 * Helper to generate a deterministic 384-dimension mock embedding based on text hash
 * to keep Pinecone insertions and queries functional even without ONNX bindings.
 */
function generateFallbackEmbedding(text) {
  const dimensions = 384;
  const vector = new Array(dimensions).fill(0);
  
  // Create deterministic values based on text string characters
  let hash1 = 5381;
  let hash2 = 8903;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) + char;
    hash2 = ((hash2 << 6) + hash2) - char;
  }
  
  for (let d = 0; d < dimensions; d++) {
    const angle = ((hash1 + d * hash2) % 360) * (Math.PI / 180);
    vector[d] = Math.sin(angle) * 0.5 + Math.cos(angle * 2) * 0.5;
  }
  
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / (magnitude || 1));
}
