const mongoose = require('mongoose');

const contestSubmissionSchema = new mongoose.Schema(
  {
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    status: {
      type: String,
      enum: ['attempted', 'solved', 'wrong'],
      default: 'attempted',
    },
    score: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // seconds
    submittedAt: { type: Date, default: Date.now },
    code: { type: String, default: '' },
    language: { type: String, default: 'python' },
  },
  { timestamps: true }
);

contestSubmissionSchema.index({ contestId: 1, userId: 1 });

module.exports = mongoose.model('ContestSubmission', contestSubmissionSchema);
