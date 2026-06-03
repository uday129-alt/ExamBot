import Question from '../models/Question.js';
import Syllabus from '../models/Syllabus.js';
import { querySyllabus } from '../services/vectorStoreService.js';
import { generateQuestions } from '../langchain/chains.js';
import { logger } from '../utils/logger.js';

/**
 * @desc    Generate questions using RAG and Groq
 * @route   POST /api/questions/generate
 * @access  Private (Admin Only)
 */
export async function generateRAGQuestions(req, res, next) {
  try {
    const { syllabusId, numQuestions = 5, difficulty = 'medium', bloomLevel = 'understand', topic = '' } = req.body;

    if (!syllabusId) {
      res.status(400);
      throw new Error('Syllabus ID is required');
    }

    const syllabus = await Syllabus.findById(syllabusId);
    if (!syllabus) {
      res.status(404);
      throw new Error('Syllabus not found');
    }

    logger.info(`RAG Question Gen: ${numQuestions} ${difficulty} (${bloomLevel}) questions requested for "${syllabus.subject}" on topic: "${topic || 'General'}"`);

    // 1. Retrieval: Query vectors / text in syllabus namespace
    const searchQuery = topic || syllabus.subject;
    const contextChunks = await querySyllabus(syllabus._id, syllabus.pineconeNamespace, searchQuery, 5);
    
    if (contextChunks.length === 0) {
      logger.warn('No relevant text chunks retrieved for generation context.');
    }
    
    const contextText = contextChunks.join('\n\n');

    // 2. Generation: Invoke LLM Chain
    const generatedList = await generateQuestions(
      contextText,
      syllabus.subject,
      parseInt(numQuestions, 10),
      difficulty,
      bloomLevel
    );

    // 3. Store in MongoDB
    const questionDocs = generatedList.map(q => ({
      subject: syllabus.subject,
      questionText: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || difficulty,
      bloomLevel: q.bloomLevel || bloomLevel,
      marks: q.marks || (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3),
      topic: q.topic || topic || syllabus.subject,
      syllabusId: syllabus._id,
    }));

    const savedQuestions = await Question.insertMany(questionDocs);
    logger.success(`Generated and saved ${savedQuestions.length} questions in MongoDB.`);

    res.status(201).json({
      success: true,
      count: savedQuestions.length,
      questions: savedQuestions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get questions bank with filters, search, and pagination
 * @route   GET /api/questions
 * @access  Private
 */
export async function getQuestions(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      subject, 
      difficulty, 
      bloomLevel, 
      syllabusId, 
      search 
    } = req.query;

    const query = {};

    // Applying filters
    if (subject) query.subject = new RegExp(subject, 'i');
    if (difficulty) query.difficulty = difficulty;
    if (bloomLevel) query.bloomLevel = bloomLevel;
    if (syllabusId) query.syllabusId = syllabusId;
    
    if (search) {
      query.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('syllabusId', 'subject originalFileName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: questions.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: parseInt(page, 10),
      questions,
    });
  } catch (error) {
    next(error);
  }
}
