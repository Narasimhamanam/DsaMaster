const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    order: { type: Number, required: true },
    icon: { type: String, default: '📚' },
    color: { type: String, default: '#7c3aed' },
    problemCount: { type: Number, default: 0 },
    estimatedHours: { type: Number, default: 5 },
    prerequisites: [{ type: String }], // slugs of prerequisite topics
    tags: [{ type: String }],
  },
  { timestamps: true }
);

topicSchema.index({ order: 1 });

module.exports = mongoose.model('Topic', topicSchema);
