import express from 'express';
import { generateRAGQuestions, getQuestions } from '../controllers/questionController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require login for all questions endpoints

router.post('/generate', admin, generateRAGQuestions);
router.get('/', getQuestions);

export default router;
