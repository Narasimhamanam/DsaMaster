const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, default: 90 }, // minutes
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
    type: {
      type: String,
      enum: ['weekly', 'special', 'college_battle'],
      default: 'weekly',
    },
    week: { type: Number },
    year: { type: Number },
    maxParticipants: { type: Number, default: 0 }, // 0 = unlimited
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalParticipants: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contestSchema.index({ startTime: -1 });
contestSchema.index({ status: 1 });

module.exports = mongoose.model('Contest', contestSchema);
