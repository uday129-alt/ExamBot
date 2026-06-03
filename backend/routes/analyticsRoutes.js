import express from 'express';
import { getAdminAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require login for all analytics

router.get('/admin', admin, getAdminAnalytics);
router.get('/student', getStudentAnalytics);

export default router;
