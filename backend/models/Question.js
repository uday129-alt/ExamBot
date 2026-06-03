import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    questionText: {
      type: String,
      required: [true, 'Please provide the question text'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Please provide at least two options'],
      validate: [opts => opts.length >= 2, 'Options must contain at least 2 choices'],
    },
    correctAnswer: {
      type: String,
      required: [true, 'Please specify the correct answer'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    bloomLevel: {
      type: String,
      enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
      required: true,
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    syllabusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Syllabus',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and RAG mappings
questionSchema.index({ subject: 1, difficulty: 1, bloomLevel: 1 });
questionSchema.index({ questionText: 'text', topic: 'text' });

const Question = mongoose.model('Question', questionSchema);
export default Question;
