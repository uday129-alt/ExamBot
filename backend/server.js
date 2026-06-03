import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { validateEnv } from './utils/envValidator.js';
import { connectDB } from './config/db.js';
import { initLangChain } from './config/langchain.js';
import { logger } from './utils/logger.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import paperRoutes from './routes/paperRoutes.js';
import examRoutes from './routes/examRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// 1. Environment Validation
validateEnv();

// 2. Initialize LangChain & Tracing
initLangChain();

// 3. Connect Database
connectDB();

const app = express();

// 4. Global Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local uploaded files if necessary
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP address, please try again later.' }
});
app.use(limiter);

// 5. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use('/uploads', express.static(path.resolve('uploads')));

// 6. Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root Endpoint for Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// 7. Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.success(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
