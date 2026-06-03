import mongoose from 'mongoose';

const syllabusSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Please provide a subject name'],
      trim: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    pineconeNamespace: {
      type: String,
      required: true,
      unique: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index subject for search operations
syllabusSchema.index({ subject: 'text' });

const Syllabus = mongoose.model('Syllabus', syllabusSchema);
export default Syllabus;
