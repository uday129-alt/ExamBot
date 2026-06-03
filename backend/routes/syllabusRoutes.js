import express from 'express';
import { uploadSyllabus, getSyllabi, deleteSyllabus } from '../controllers/syllabusController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // All syllabus operations require authentication

router.post('/upload', admin, upload.single('file'), uploadSyllabus);
router.get('/', getSyllabi);
router.delete('/:id', admin, deleteSyllabus);

export default router;
