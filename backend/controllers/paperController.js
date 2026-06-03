import Paper from '../models/Paper.js';
import Question from '../models/Question.js';
import { logger } from '../utils/logger.js';

/**
 * Helper to sample random items from an array
 */
function sampleArray(array, size) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

/**
 * @desc    Compile a new question paper from question bank
 * @route   POST /api/papers/create
 * @access  Private (Admin Only)
 */
export async function createPaper(req, res, next) {
  try {
    const { 
      title, 
      subject, 
      duration = 60, 
      totalQuestions = 10,
      difficultyMix = { easy: 30, medium: 40, hard: 30 },
      bloomMix = { remember: 20, understand: 30, apply: 20, analyze: 10, evaluate: 10, create: 10 }
    } = req.body;

    if (!title || !subject) {
      res.status(400);
      throw new Error('Title and subject are required');
    }

    logger.info(`Compiling exam paper: "${title}" for subject: "${subject}" with ${totalQuestions} questions.`);

    // 1. Calculate question counts per difficulty
    const easyTarget = Math.round((difficultyMix.easy / 100) * totalQuestions);
    const mediumTarget = Math.round((difficultyMix.medium / 100) * totalQuestions);
    const hardTarget = Math.max(0, totalQuestions - easyTarget - mediumTarget); // Fill remainder

    // 2. Query question bank for this subject
    const easyPool = await Question.find({ subject, difficulty: 'easy' });
    const mediumPool = await Question.find({ subject, difficulty: 'medium' });
    const hardPool = await Question.find({ subject, difficulty: 'hard' });

    logger.info(`Question pools - Easy: ${easyPool.length}, Medium: ${mediumPool.length}, Hard: ${hardPool.length}`);

    // Sample questions from pools
    let selectedQuestions = [];

    // Easy questions
    if (easyPool.length >= easyTarget) {
      selectedQuestions.push(...sampleArray(easyPool, easyTarget));
    } else {
      selectedQuestions.push(...easyPool);
    }

    // Medium questions
    if (mediumPool.length >= mediumTarget) {
      selectedQuestions.push(...sampleArray(mediumPool, mediumTarget));
    } else {
      selectedQuestions.push(...mediumPool);
    }

    // Hard questions
    if (hardPool.length >= hardTarget) {
      selectedQuestions.push(...sampleArray(hardPool, hardTarget));
    } else {
      selectedQuestions.push(...hardPool);
    }

    // 3. Fallback: If we don't have enough questions compiled, pull ANY questions from this subject to fill up the paper
    const selectedIds = new Set(selectedQuestions.map(q => q._id.toString()));
    const remainingNeeded = totalQuestions - selectedQuestions.length;

    if (remainingNeeded > 0) {
      logger.warn(`Pool targets not met. Pulling general fallback questions for ${subject}. Needed: ${remainingNeeded}`);
      const fallbackPool = await Question.find({ 
        subject, 
        _id: { $nin: Array.from(selectedIds).map(id => Object(id)) } 
      });
      selectedQuestions.push(...sampleArray(fallbackPool, remainingNeeded));
    }

    if (selectedQuestions.length === 0) {
      res.status(400);
      throw new Error(`No questions available in the question bank for subject "${subject}". Generate questions first.`);
    }

    // 4. Calculate total marks
    const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

    // 5. Store Question Paper
    const paper = await Paper.create({
      title,
      subject,
      questions: selectedQuestions.map(q => q._id),
      totalMarks,
      duration,
      difficultyMix,
      bloomMix,
      createdBy: req.user._id,
      published: false, // Default to draft
    });

    logger.success(`Created question paper "${paper.title}" with ID: ${paper._id}`);
    
    // Return populated paper
    const populatedPaper = await Paper.findById(paper._id).populate('questions');

    res.status(201).json({
      success: true,
      message: 'Question paper compiled successfully',
      paper: populatedPaper,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all question papers
 * @route   GET /api/papers
 * @access  Private
 */
export async function getPapers(req, res, next) {
  try {
    const query = {};
    
    // Students can only see published papers
    if (req.user.role === 'student') {
      query.published = true;
    }

    const { subject } = req.query;
    if (subject) {
      query.subject = new RegExp(subject, 'i');
    }

    const papers = await Paper.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: papers.length,
      papers,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single question paper by ID
 * @route   GET /api/papers/:id
 * @access  Private
 */
export async function getPaperById(req, res, next) {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('questions')
      .populate('createdBy', 'username');

    if (!paper) {
      res.status(404);
      throw new Error('Question paper not found');
    }

    // Check if student is trying to access draft paper
    if (req.user.role === 'student' && !paper.published) {
      res.status(403);
      throw new Error('Access denied, paper is in draft state');
    }

    res.json({
      success: true,
      paper,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Publish a question paper
 * @route   PUT /api/papers/:id/publish
 * @access  Private (Admin Only)
 */
export async function publishPaper(req, res, next) {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      res.status(404);
      throw new Error('Question paper not found');
    }

    paper.published = true;
    await paper.save();

    logger.success(`Published paper: ${paper.title}`);

    res.json({
      success: true,
      message: 'Question paper published successfully',
      paper,
    });
  } catch (error) {
    next(error);
  }
}
