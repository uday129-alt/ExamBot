import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}
