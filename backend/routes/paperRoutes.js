import express from 'express';
import { createPaper, getPapers, getPaperById, publishPaper } from '../controllers/paperController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require JWT auth

router.post('/create', admin, createPaper);
router.get('/', getPapers);
router.get('/:id', getPaperById);
router.put('/:id/publish', admin, publishPaper);

export default router;
