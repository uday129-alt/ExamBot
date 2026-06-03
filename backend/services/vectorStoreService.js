import { getPineconeClient } from '../config/pinecone.js';
import { getEmbedding } from './embeddingService.js';
import SyllabusChunk from '../models/SyllabusChunk.js';
import { logger } from '../utils/logger.js';

/**
 * Splits text recursively using separators: \n\n, \n, space, empty char.
 */
export function recursiveSplitText(text, chunkSize = 1000, chunkOverlap = 200) {
  const separators = ["\n\n", "\n", " ", ""];
  const finalChunks = [];

  function split(txt, sepIndex) {
    if (txt.length <= chunkSize) {
      if (txt.trim()) {
        finalChunks.push(txt.trim());
      }
      return;
    }

    if (sepIndex >= separators.length) {
      // Hard chunking fallback
      let start = 0;
      while (start < txt.length) {
        const end = Math.min(start + chunkSize, txt.length);
        finalChunks.push(txt.slice(start, end).trim());
        start += (chunkSize - chunkOverlap);
      }
      return;
    }

    const separator = separators[sepIndex];
    const parts = txt.split(separator);
    let currentChunk = "";

    for (const part of parts) {
      // If adding this part exceeds chunkSize
      if (currentChunk.length + part.length + (currentChunk ? separator.length : 0) <= chunkSize) {
        currentChunk += (currentChunk ? separator : "") + part;
      } else {
        if (currentChunk.trim()) {
          finalChunks.push(currentChunk.trim());
        }
        // Extract overlap from the end of the current chunk
        const overlapText = currentChunk.slice(-chunkOverlap);
        currentChunk = overlapText + (overlapText ? separator : "") + part;
      }
    }

    if (currentChunk.trim()) {
      finalChunks.push(currentChunk.trim());
    }
  }

  split(text, 0);
  return finalChunks;
}

/**
 * Index a syllabus document in both Pinecone and MongoDB.
 */
export async function indexSyllabus(syllabusId, text, subject, namespace) {
  try {
    const chunks = recursiveSplitText(text, 1000, 200);
    logger.info(`Split syllabus into ${chunks.length} chunks.`);

    // 1. Store chunks in MongoDB for search fallback and metadata display
    await SyllabusChunk.deleteMany({ syllabusId });
    const chunkDocs = chunks.map((chunkText, index) => ({
      syllabusId,
      subject,
      chunkIndex: index,
      text: chunkText,
    }));
    await SyllabusChunk.insertMany(chunkDocs);
    logger.success(`Saved ${chunks.length} chunks to MongoDB.`);

    // 2. Index in Pinecone (if client exists)
    const pinecone = await getPineconeClient();
    if (!pinecone) {
      logger.warn('Pinecone client not initialized. Vector indexing skipped (using local MongoDB text search instead).');
      return chunks.length;
    }

    const indexName = process.env.PINECONE_INDEX_NAME;
    const pineconeIndex = pinecone.Index(indexName);

    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i]);
      vectors.push({
        id: `${syllabusId}_chunk_${i}`,
        values: embedding,
        metadata: {
          syllabusId: syllabusId.toString(),
          subject,
          text: chunks[i],
          chunkIndex: i
        }
      });
    }

    // Upsert in batches of 50 to avoid payload size errors
    const batchSize = 50;
    for (let j = 0; j < vectors.length; j += batchSize) {
      const batch = vectors.slice(j, j + batchSize);
      await pineconeIndex.namespace(namespace).upsert(batch);
    }
    
    logger.success(`Indexed ${vectors.length} vectors in Pinecone namespace: ${namespace}`);
    return chunks.length;
  } catch (error) {
    logger.error('Failed to index syllabus document', error);
    throw error;
  }
}

/**
 * Delete syllabus vectors from Pinecone and chunks from MongoDB.
 */
export async function deleteSyllabusVectors(syllabusId, namespace) {
  try {
    // 1. Delete from MongoDB
    await SyllabusChunk.deleteMany({ syllabusId });
    
    // 2. Delete from Pinecone
    const pinecone = await getPineconeClient();
    if (pinecone) {
      const indexName = process.env.PINECONE_INDEX_NAME;
      const pineconeIndex = pinecone.Index(indexName);
      await pineconeIndex.namespace(namespace).deleteAll();
      logger.success(`Deleted Pinecone vectors for namespace: ${namespace}`);
    }
  } catch (error) {
    logger.error(`Error deleting vectors for syllabus: ${syllabusId}`, error);
  }
}

/**
 * RAG Query - retrieves relevant syllabus text chunks.
 */
export async function querySyllabus(syllabusId, namespace, queryText, limit = 5) {
  try {
    const pinecone = await getPineconeClient();
    
    if (pinecone) {
      try {
        const queryEmbedding = await getEmbedding(queryText);
        const indexName = process.env.PINECONE_INDEX_NAME;
        const pineconeIndex = pinecone.Index(indexName);
        
        const queryResponse = await pineconeIndex.namespace(namespace).query({
          vector: queryEmbedding,
          topK: limit,
          includeMetadata: true,
        });

        if (queryResponse.matches && queryResponse.matches.length > 0) {
          const results = queryResponse.matches.map(match => match.metadata.text);
          logger.info(`Retrieved ${results.length} relevant chunks from Pinecone namespace: ${namespace}`);
          return results;
        }
      } catch (err) {
        logger.error('Pinecone search query failed, falling back to MongoDB search.', err);
      }
    }

    // Fallback: Perform text search query in MongoDB
    logger.info(`Performing MongoDB search query in syllabus ${syllabusId} for: "${queryText}"`);
    const fallbackResults = await SyllabusChunk.find(
      { syllabusId, $text: { $search: queryText } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);

    if (fallbackResults.length > 0) {
      return fallbackResults.map(doc => doc.text);
    }

    // Secondary fallback: just get first few chunks if text search returned nothing
    logger.warn('No search results found. Returning first few chunks of the syllabus.');
    const firstChunks = await SyllabusChunk.find({ syllabusId }).sort({ chunkIndex: 1 }).limit(limit);
    return firstChunks.map(doc => doc.text);
  } catch (error) {
    logger.error('RAG Query retrieval failed', error);
    return [];
  }
}
