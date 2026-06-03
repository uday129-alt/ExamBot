import { Pinecone } from '@pinecone-database/pinecone';
import { logger } from '../utils/logger.js';

let pineconeClient = null;

export async function getPineconeClient() {
  if (pineconeClient) return pineconeClient;

  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('temp_key')) {
    logger.warn('Pinecone API Key is not set or is a placeholder. Vector DB features will operate in simulated mode.');
    return null;
  }

  try {
    pineconeClient = new Pinecone({
      apiKey: apiKey
    });
    
    // Test connection by listing indexes
    const indexesObj = await pineconeClient.listIndexes();
    const indexList = indexesObj.indexes || [];
    const indexName = process.env.PINECONE_INDEX_NAME;
    
    const indexExists = indexList.some(idx => idx.name === indexName);
    
    if (!indexExists) {
      logger.warn(`Pinecone Index "${indexName}" was not found. Please create a 384-dimension index in your Pinecone console.`);
    } else {
      logger.success(`Pinecone Client Connected & verified index "${indexName}".`);
    }
    
    return pineconeClient;
  } catch (error) {
    logger.error('Failed to initialize or connect to Pinecone', error);
    logger.warn('Operating Pinecone operations in mock/simulated fallback mode.');
    return null;
  }
}
