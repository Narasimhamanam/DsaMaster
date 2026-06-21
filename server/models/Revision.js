const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    dueDate: { type: Date, required: true },
    interval: { type: Number, required: true }, // days: 7, 30, 90
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped', 'overdue'],
      default: 'pending',
    },
    completedAt: { type: Date, default: null },
    success: { type: Boolean, default: null },
  },
  { timestamps: true }
);

revisionSchema.index({ userId: 1, dueDate: 1 });
revisionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Revision', revisionSchema);
