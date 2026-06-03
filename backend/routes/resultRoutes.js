import express from 'express';
import { getResultById, getStudentResults } from '../controllers/resultController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require JWT login

router.get('/student', getStudentResults);
router.get('/:id', getResultById);

export default router;
