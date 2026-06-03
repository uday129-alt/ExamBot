import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['started', 'submitted', 'timed-out'],
      default: 'started',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    answers: {
      type: Map,
      of: String, // Key is Question ObjectId, value is the exact answer string selected
      default: {},
    },
    remainingSeconds: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

examSchema.index({ student: 1, paper: 1 });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
