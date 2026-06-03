import mongoose from 'mongoose';

const syllabusChunkSchema = new mongoose.Schema(
  {
    syllabusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Syllabus',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

syllabusChunkSchema.index({ syllabusId: 1 });
syllabusChunkSchema.index({ text: 'text' }); // Text index for fallback search

const SyllabusChunk = mongoose.model('SyllabusChunk', syllabusChunkSchema);
export default SyllabusChunk;
