const express = require('express');
const router = express.Router();
const Revision = require('../models/Revision');
const Problem = require('../models/Problem');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const dayjs = require('dayjs');

// GET /api/revisions/today
router.get('/today', authenticate, async (req, res) => {
  try {
    const today = dayjs().endOf('day').toDate();

    const revisions = await Revision.find({
      userId: req.user._id,
      dueDate: { $lte: today },
      status: 'pending',
    })
      .populate('problemId', 'title difficulty topicName leetcodeUrl gfgUrl tags')
      .sort('dueDate');

    const mappedRevisions = revisions.map((r) => {
      const obj = r.toObject();
      obj.problem = obj.problemId; // Map problemId to problem for frontend compatibility
      return obj;
    });

    res.json({ success: true, revisions: mappedRevisions, count: mappedRevisions.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/revisions/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const total = await Revision.countDocuments({ userId: req.user._id });
    const completed = await Revision.countDocuments({ userId: req.user._id, status: 'completed' });
    const overdue = await Revision.countDocuments({
      userId: req.user._id,
      status: 'pending',
      dueDate: { $lt: new Date() },
    });
    const pending = await Revision.countDocuments({
      userId: req.user._id,
      status: 'pending',
      dueDate: { $gte: new Date() },
    });

    res.json({
      success: true,
      total,
      completed,
      overdue,
      pending,
      retentionScore: req.user.retentionScore || 100,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/revisions/:id/complete
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const { success: revisionSuccess } = req.body;
    const revision = await Revision.findOne({ _id: req.params.id, userId: req.user._id });
    if (!revision) return res.status(404).json({ success: false, message: 'Revision not found' });

    revision.status = 'completed';
    revision.completedAt = new Date();
    revision.success = revisionSuccess !== false;
    await revision.save();

    // Update retention score
    const allRevisions = await Revision.find({ userId: req.user._id, status: 'completed' });
    const successfulRevisions = allRevisions.filter((r) => r.success === true).length;
    const retentionScore = allRevisions.length > 0
      ? Math.round((successfulRevisions / allRevisions.length) * 100)
      : 100;

    await User.findByIdAndUpdate(req.user._id, { retentionScore });

    // Update progress revision history
    await Progress.findOneAndUpdate(
      { userId: req.user._id, problemId: revision.problemId },
      {
        $push: {
          revisionHistory: {
            date: new Date(),
            success: revisionSuccess !== false,
          },
        },
        $inc: { revisionCount: 1 },
      }
    );

    res.json({ success: true, retentionScore });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/revisions/:id/skip
router.post('/:id/skip', authenticate, async (req, res) => {
  try {
    await Revision.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'skipped' }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
