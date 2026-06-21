const mongoose = require('mongoose');

const feedEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'problem_solved',
        'topic_completed',
        'badge_earned',
        'milestone_reached',
        'streak_milestone',
        'contest_won',
        'level_up',
      ],
      required: true,
    },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

feedEventSchema.index({ createdAt: -1 });
feedEventSchema.index({ userId: 1 });

module.exports = mongoose.model('FeedEvent', feedEventSchema);
