const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    topicSlug: { type: String, required: true },
    topicName: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    order: { type: Number, default: 0 },

    // Links
    leetcodeUrl: { type: String, default: '' },
    gfgUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },

    // Metadata
    tags: [{ type: String }],
    companies: [{ type: String }],
    xpReward: { type: Number, default: 10 },
    description: { type: String, default: '' },

    // Contest eligibility
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

problemSchema.index({ topicId: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Problem', problemSchema);
