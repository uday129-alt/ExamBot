import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the question paper'],
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
    ],
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    duration: {
      type: Number,
      required: [true, 'Please specify exam duration in minutes'],
      min: 1,
    },
    difficultyMix: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    bloomMix: {
      remember: { type: Number, default: 0 },
      understand: { type: Number, default: 0 },
      apply: { type: Number, default: 0 },
      analyze: { type: Number, default: 0 },
      evaluate: { type: Number, default: 0 },
      create: { type: Number, default: 0 },
    },
    published: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

paperSchema.index({ subject: 1, published: 1 });

const Paper = mongoose.model('Paper', paperSchema);
export default Paper;
