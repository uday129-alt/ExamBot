import path from 'path';
import Syllabus from '../models/Syllabus.js';
import { parseDocument } from '../utils/documentParser.js';
import { indexSyllabus, deleteSyllabusVectors } from '../services/vectorStoreService.js';
import { logger } from '../utils/logger.js';

/**
 * @desc    Upload and process a syllabus file
 * @route   POST /api/syllabus/upload
 * @access  Private (Admin Only)
 */
export async function uploadSyllabus(req, res, next) {
  try {
    const { subject } = req.body;
    const file = req.file;

    if (!subject) {
      res.status(400);
      throw new Error('Please specify a subject name');
    }

    if (!file) {
      res.status(400);
      throw new Error('Please upload a syllabus file (.pdf, .docx, .txt)');
    }

    const originalFileName = file.originalname;
    const filePath = file.path;
    const extension = path.extname(originalFileName).toLowerCase();
    
    logger.info(`Started syllabus upload process: ${originalFileName} for ${subject}`);

    // Create unique namespace
    const pineconeNamespace = `syllabus_${Date.now()}`;

    // Create record in pending state
    const syllabus = await Syllabus.create({
      subject,
      originalFileName,
      filePath,
      pineconeNamespace,
      uploadedBy: req.user._id,
      status: 'pending',
    });

    // Process asynchronously (or synchronously here to handle immediate feedback)
    try {
      const text = await parseDocument(filePath, extension);
      
      if (!text || text.trim().length === 0) {
        throw new Error('The document appears to be empty or unparseable.');
      }

      // Chunk, embed and save
      await indexSyllabus(syllabus._id, text, subject, pineconeNamespace);

      syllabus.status = 'processed';
      await syllabus.save();
      logger.success(`Syllabus parsed and indexed successfully: ${syllabus.subject}`);

      res.status(201).json({
        success: true,
        message: 'Syllabus uploaded and processed successfully',
        syllabus,
      });
    } catch (processError) {
      logger.error(`Processing failed for syllabus ID: ${syllabus._id}`, processError);
      syllabus.status = 'failed';
      syllabus.errorMessage = processError.message;
      await syllabus.save();
      
      res.status(500).json({
        success: false,
        message: `Syllabus upload completed, but processing failed: ${processError.message}`,
        syllabus,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all syllabi
 * @route   GET /api/syllabus
 * @access  Private
 */
export async function getSyllabi(req, res, next) {
  try {
    const syllabi = await Syllabus.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: syllabi.length,
      syllabi,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a syllabus
 * @route   DELETE /api/syllabus/:id
 * @access  Private (Admin Only)
 */
export async function deleteSyllabus(req, res, next) {
  try {
    const { id } = req.params;

    const syllabus = await Syllabus.findById(id);

    if (!syllabus) {
      res.status(404);
      throw new Error('Syllabus not found');
    }

    logger.info(`Deleting syllabus ${syllabus.subject} (${id})`);

    // Delete associated vectors and local chunks
    await deleteSyllabusVectors(syllabus._id, syllabus.pineconeNamespace);

    // Delete record
    await syllabus.deleteOne();

    res.json({
      success: true,
      message: 'Syllabus and indexing data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
