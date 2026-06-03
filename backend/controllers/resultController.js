import Result from '../models/Result.js';

/**
 * @desc    Get result by ID
 * @route   GET /api/results/:id
 * @access  Private
 */
export async function getResultById(req, res, next) {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'username email')
      .populate({
        path: 'paper',
        populate: {
          path: 'questions',
        },
      })
      .populate('exam');

    if (!result) {
      res.status(404);
      throw new Error('Result details not found');
    }

    // Secure result details: students can only view their own results
    if (req.user.role === 'student' && result.student._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized to access this result sheet');
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get student results
 * @route   GET /api/results/student
 * @access  Private
 */
export async function getStudentResults(req, res, next) {
  try {
    const results = await Result.find({ student: req.user._id })
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
