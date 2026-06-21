const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    achievementId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    category: {
      type: String,
      enum: ['milestone', 'streak', 'topic', 'contest', 'special'],
      default: 'milestone',
    },
    xpReward: { type: Number, default: 50 },
    condition: {
      type: { type: String }, // 'solved_count', 'streak', 'topic_complete', etc.
      value: Number,
      topicSlug: String,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
