import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    breakdown: {
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
    },
    aiFeedback: {
      strengths: { type: [String], default: [] },
      weakAreas: { type: [String], default: [] },
      topicsToImprove: { type: [String], default: [] },
      recommendedStudyPlan: { type: [String], default: [] },
      bloomAnalysis: { type: Map, of: String, default: {} }, // map of Bloom levels to feedback text
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.index({ student: 1, paper: 1 });
resultSchema.index({ exam: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);
export default Result;
