const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['question', 'approach', 'optimization', 'hint'],
      default: 'question',
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
    isMentorAnswer: { type: Boolean, default: false },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', default: null },
    replyCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

forumPostSchema.index({ problemId: 1, createdAt: -1 });
forumPostSchema.index({ problemId: 1, upvoteCount: -1 });
forumPostSchema.index({ parentId: 1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
