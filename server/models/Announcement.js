const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'contest', 'maintenance'],
      default: 'info',
    },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    targetRoles: [{ type: String, enum: ['student', 'mentor', 'admin'] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
