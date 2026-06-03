import express from 'express';
import { startExam, saveExamProgress, submitExam, getExamHistory } from '../controllers/examController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require JWT login for all exam routes

router.post('/start', startExam);
router.post('/save', saveExamProgress);
router.post('/submit', submitExam);
router.get('/history', getExamHistory);

export default router;
