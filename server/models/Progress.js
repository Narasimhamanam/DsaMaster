const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    topicSlug: { type: String, required: true },

    status: {
      type: String,
      enum: ['not_started', 'attempted', 'solved'],
      default: 'not_started',
    },

    solvedAt: { type: Date, default: null },
    firstAttemptedAt: { type: Date, default: null },
    lastAttemptedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    timeSpentMinutes: { type: Number, default: 0 },

    // Notes
    notes: { type: String, default: '' },

    // Spaced Repetition
    revisionDates: [{ type: Date }],
    nextRevisionDate: { type: Date, default: null },
    revisionCount: { type: Number, default: 0 },
    retentionScore: { type: Number, default: 100 },
    revisionHistory: [
      {
        date: Date,
        success: Boolean,
        timeTaken: Number,
      },
    ],

    // XP earned from this problem
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
progressSchema.index({ userId: 1, topicId: 1 });
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ userId: 1, nextRevisionDate: 1 });

module.exports = mongoose.model('Progress', progressSchema);
