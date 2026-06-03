import Exam from '../models/Exam.js';
import Paper from '../models/Paper.js';
import Result from '../models/Result.js';
import { generateFeedback } from '../langchain/chains.js';
import { logger } from '../utils/logger.js';

/**
 * Helper to calculate letter grade based on percentage
 */
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

/**
 * @desc    Start or resume a student exam
 * @route   POST /api/exams/start
 * @access  Private (Student Only)
 */
export async function startExam(req, res, next) {
  try {
    const { paperId } = req.body;
    const studentId = req.user._id;

    if (!paperId) {
      res.status(400);
      throw new Error('Question paper ID is required');
    }

    // 1. Check if exam is already started and not submitted (Resume Exam)
    const existingExam = await Exam.findOne({
      student: studentId,
      paper: paperId,
      status: 'started',
    });

    if (existingExam) {
      logger.info(`Resuming existing exam session for paper ${paperId}`);
      const populatedPaper = await Paper.findById(paperId).populate({
        path: 'questions',
        select: '-correctAnswer', // Do not send correct answers to the client!
      });

      return res.json({
        success: true,
        message: 'Resuming active exam session',
        exam: existingExam,
        paper: populatedPaper,
      });
    }

    // 2. Fetch paper details
    const paper = await Paper.findById(paperId);
    if (!paper) {
      res.status(404);
      throw new Error('Question paper not found');
    }

    if (!paper.published) {
      res.status(403);
      throw new Error('Exam paper is not available yet');
    }

    // 3. Check if they have already submitted this exam
    const completedExam = await Exam.findOne({
      student: studentId,
      paper: paperId,
      status: { $in: ['submitted', 'timed-out'] }
    });

    if (completedExam) {
      res.status(400);
      throw new Error('You have already submitted this exam');
    }

    // 4. Create new exam session
    const durationSeconds = paper.duration * 60;
    const exam = await Exam.create({
      student: studentId,
      paper: paperId,
      status: 'started',
      remainingSeconds: durationSeconds,
      answers: {},
    });

    // Populate questions without showing the correct answers
    const populatedPaper = await Paper.findById(paperId).populate({
      path: 'questions',
      select: '-correctAnswer',
    });

    logger.success(`Started new exam session ${exam._id} for student ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Exam session started',
      exam,
      paper: populatedPaper,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Auto-save exam answers and timer
 * @route   POST /api/exams/save
 * @access  Private (Student Only)
 */
export async function saveExamProgress(req, res, next) {
  try {
    const { examId, answers, remainingSeconds } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404);
      throw new Error('Active exam session not found');
    }

    if (exam.status !== 'started') {
      res.status(400);
      throw new Error('Cannot save progress on a completed exam');
    }

    // Update answers and timer state
    if (answers) {
      exam.answers = answers;
    }
    if (typeof remainingSeconds === 'number') {
      exam.remainingSeconds = remainingSeconds;
    }

    await exam.save();
    
    res.json({
      success: true,
      message: 'Progress autosaved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Submit exam and trigger AI auto evaluation & feedback
 * @route   POST /api/exams/submit
 * @access  Private (Student Only)
 */
export async function submitExam(req, res, next) {
  try {
    const { examId, answers } = req.body;
    const studentId = req.user._id;

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404);
      throw new Error('Exam session not found');
    }

    if (exam.status !== 'started') {
      res.status(400);
      throw new Error('Exam has already been submitted');
    }

    // Capture final answers
    if (answers) {
      exam.answers = answers;
    }

    // Fetch the paper and full question details (including correct answers)
    const paper = await Paper.findById(exam.paper).populate('questions');
    if (!paper) {
      res.status(404);
      throw new Error('Paper associated with this exam was not found');
    }

    logger.info(`Evaluating submission for exam: ${examId}, paper: "${paper.title}"`);

    // 1. Core Evaluation: Grading student's answers
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let obtainedMarks = 0;
    const totalMarks = paper.totalMarks;

    const studentResponses = [];

    paper.questions.forEach((q) => {
      const studentAnswer = exam.answers.get(q._id.toString());
      const isSkipped = !studentAnswer || studentAnswer.trim() === '';
      const isCorrect = !isSkipped && studentAnswer.trim() === q.correctAnswer.trim();

      if (isSkipped) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
        obtainedMarks += q.marks || 1;
      } else {
        wrongCount++;
      }

      studentResponses.push({
        questionId: q._id.toString(),
        selectedAnswer: studentAnswer || '',
        isCorrect,
      });
    });

    const percentage = Math.round((obtainedMarks / (totalMarks || 1)) * 100);
    const grade = calculateGrade(percentage);
    const breakdown = { correct: correctCount, wrong: wrongCount, skipped: skippedCount };

    // 2. Generate AI Feedback and diagnostic report card
    logger.info('Generating AI Diagnostic Report Card...');
    const aiFeedback = await generateFeedback(
      studentResponses,
      paper.questions,
      breakdown,
      totalMarks,
      obtainedMarks,
      percentage,
      grade
    );

    // 3. Update exam status
    exam.status = 'submitted';
    exam.remainingSeconds = 0;
    exam.endTime = new Date();
    await exam.save();

    // 4. Create and store final result doc
    const result = await Result.create({
      student: studentId,
      paper: paper._id,
      exam: exam._id,
      totalMarks,
      obtainedMarks,
      percentage,
      grade,
      breakdown,
      aiFeedback,
    });

    logger.success(`Evaluated exam ${examId}. Scored ${obtainedMarks}/${totalMarks} (${percentage}%, Grade: ${grade})`);

    res.status(201).json({
      success: true,
      message: 'Exam submitted and evaluated successfully',
      result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get student's exam history list
 * @route   GET /api/exams/history
 * @access  Private
 */
export async function getExamHistory(req, res, next) {
  try {
    const studentId = req.user._id;

    // Get all completed exams for this student
    const results = await Result.find({ student: studentId })
      .populate('paper', 'title subject totalMarks duration')
      .sort({ evaluatedAt: -1 });

    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
}
