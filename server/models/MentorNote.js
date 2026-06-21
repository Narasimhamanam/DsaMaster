const mongoose = require('mongoose');

const mentorNoteSchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, required: true },
    type: {
      type: String,
      enum: ['observation', 'reminder', 'warning', 'praise', 'contacted'],
      default: 'observation',
    },
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mentorNoteSchema.index({ mentorId: 1, studentId: 1 });

module.exports = mongoose.model('MentorNote', mentorNoteSchema);
