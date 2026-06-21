const mongoose = require('mongoose');

const leaderboardSnapshotSchema = new mongoose.Schema(
  {
    period: { type: String, enum: ['daily', 'weekly', 'monthly', 'alltime'], required: true },
    date: { type: String, required: true }, // YYYY-MM-DD or YYYY-WW or YYYY-MM
    rankings: [
      {
        rank: Number,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        college: String,
        photoURL: String,
        totalSolved: Number,
        xp: Number,
        currentStreak: Number,
        level: Number,
        title: String,
        problemsSolvedInPeriod: Number,
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leaderboardSnapshotSchema.index({ period: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('LeaderboardSnapshot', leaderboardSnapshotSchema);
