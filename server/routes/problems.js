const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const Revision = require('../models/Revision');
const User = require('../models/User');
const FeedEvent = require('../models/FeedEvent');
const { authenticate } = require('../middleware/auth');
const { updateStreak } = require('../services/streakService');
const { addXP, XP_REWARDS } = require('../services/xpService');
const { checkAchievements } = require('../services/achievementService');
const { calculatePlacementScore } = require('../services/placementService');
const { createFeedEvent } = require('../services/feedService');
const { getIO } = require('../config/socket');
const dayjs = require('dayjs');

// GET /api/problems
router.get('/', authenticate, async (req, res) => {
  try {
    const { topic, difficulty, status, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (topic) query.topicSlug = topic;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$text = { $search: search };

    const problems = await Problem.find(query)
      .sort('topicId order')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('topicId', 'name slug icon color');

    // Add user progress
    const problemIds = problems.map((p) => p._id);
    const progresses = await Progress.find({
      userId: req.user._id,
      problemId: { $in: problemIds },
    }).select('problemId status notes');

    const progressMap = {};
    progresses.forEach((p) => { progressMap[p.problemId.toString()] = p; });

    const problemsWithProgress = problems.map((p) => ({
      ...p.toObject(),
      userProgress: progressMap[p._id.toString()] || { status: 'not_started' },
    }));

    res.json({ success: true, problems: problemsWithProgress });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/problems/topics
router.get('/topics', authenticate, async (req, res) => {
  try {
    const topics = await Topic.find().sort('order');
    const userId = req.user._id;

    // Get active problem count per topic via aggregate
    const problemCounts = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$topicId', count: { $sum: 1 } } }
    ]);
    const problemCountsMap = {};
    problemCounts.forEach(pc => {
      if (pc._id) problemCountsMap[pc._id.toString()] = pc.count;
    });

    // Get progress counts (solved and attempted) per topic for the user
    const progressCounts = await Progress.aggregate([
      { $match: { userId } },
      { $group: {
          _id: '$topicId',
          solved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
          attempted: { $sum: { $cond: [{ $eq: ['$status', 'attempted'] }, 1, 0] } }
        }
      }
    ]);
    const progressCountsMap = {};
    progressCounts.forEach(pc => {
      if (pc._id) {
        progressCountsMap[pc._id.toString()] = {
          solved: pc.solved || 0,
          attempted: pc.attempted || 0,
        };
      }
    });

    const topicsWithProgress = topics.map((topic) => {
      const topicIdStr = topic._id.toString();
      const total = problemCountsMap[topicIdStr] || 0;
      const prog = progressCountsMap[topicIdStr] || { solved: 0, attempted: 0 };
      const solved = prog.solved;
      const attempted = prog.attempted;

      return {
        ...topic.toObject(),
        stats: {
          total,
          solved,
          attempted,
          percentage: total > 0 ? Math.round((solved / total) * 100) : 0
        },
      };
    });

    res.json({ success: true, topics: topicsWithProgress });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/problems/topic/:slug
router.get('/topic/:slug', authenticate, async (req, res) => {
  try {
    const topic = await Topic.findOne({ slug: req.params.slug });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const problems = await Problem.find({ topicId: topic._id, isActive: true }).sort('order');
    const userId = req.user._id;

    const progresses = await Progress.find({
      userId,
      topicId: topic._id,
    }).select('problemId status notes solvedAt');

    const progressMap = {};
    progresses.forEach((p) => { progressMap[p.problemId.toString()] = p; });

    const problemsWithProgress = problems.map((p) => ({
      ...p.toObject(),
      userProgress: progressMap[p._id.toString()] || { status: 'not_started' },
    }));

    const solved = progresses.filter((p) => p.status === 'solved').length;
    const attempted = progresses.filter((p) => p.status === 'attempted').length;

    res.json({
      success: true,
      topic: {
        ...topic.toObject(),
        stats: {
          total: problems.length,
          solved,
          attempted,
          percentage: problems.length > 0 ? Math.round((solved / problems.length) * 100) : 0,
        },
      },
      problems: problemsWithProgress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/problems/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).populate('topicId', 'name slug');
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const progress = await Progress.findOne({ userId: req.user._id, problemId: problem._id });

    res.json({
      success: true,
      problem: problem.toObject(),
      userProgress: progress || { status: 'not_started' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/problems/:id/progress
// Mark a problem as attempted or solved
router.post('/:id/progress', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['attempted', 'solved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    let progress = await Progress.findOne({ userId: req.user._id, problemId: problem._id });
    const wasAlreadySolved = progress?.status === 'solved';

    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        problemId: problem._id,
        topicId: problem.topicId,
        topicSlug: problem.topicSlug,
        firstAttemptedAt: new Date(),
      });
    }

    progress.status = status;
    progress.lastAttemptedAt = new Date();
    progress.attempts += 1;

    if (wasAlreadySolved && status !== 'solved') {
      const difficultyField = `${problem.difficulty.toLowerCase()}Solved`;
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          totalSolved: -1,
          [difficultyField]: -1,
        },
      });
      await Revision.deleteMany({ userId: req.user._id, problemId: problem._id });
    }

    let xpResult = null;
    let streakResult = null;
    let newAchievements = [];

    if (status === 'solved' && !wasAlreadySolved) {
      progress.solvedAt = new Date();
      progress.xpEarned = XP_REWARDS[problem.difficulty] || 10;

      // Schedule spaced repetition revisions
      const now = new Date();
      const intervals = [7, 30, 90];
      for (const interval of intervals) {
        const dueDate = dayjs(now).add(interval, 'day').toDate();
        await Revision.create({
          userId: req.user._id,
          problemId: problem._id,
          dueDate,
          interval,
        });
      }

      // Update user stats
      const difficultyField = `${problem.difficulty.toLowerCase()}Solved`;
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          totalSolved: 1,
          [difficultyField]: 1,
        },
      });

      // Update XP
      xpResult = await addXP(req.user._id, progress.xpEarned);

      // Update streak
      streakResult = await updateStreak(req.user._id);

      // Check achievements
      newAchievements = await checkAchievements(req.user._id);

      // Update placement score (async, non-blocking)
      calculatePlacementScore(req.user._id).catch(console.error);

      // Create feed event
      const user = await User.findById(req.user._id);
      await createFeedEvent({
        userId: req.user._id,
        type: 'problem_solved',
        message: `${user.name} solved ${problem.title}`,
        data: { problemTitle: problem.title, difficulty: problem.difficulty, topicName: problem.topicName },
      });

      // Emit leaderboard update
      try {
        const io = getIO();
        io.emit('leaderboard_update', { userId: user._id });
      } catch {}

      // Check topic completion
      const topicProblems = await Problem.countDocuments({ topicId: problem.topicId, isActive: true });
      const topicSolved = await Progress.countDocuments({
        userId: req.user._id,
        topicId: problem.topicId,
        status: 'solved',
      }) + 1; // +1 because we haven't saved yet

      if (topicSolved >= topicProblems) {
        const topic = await require('../models/Topic').findById(problem.topicId);
        await createFeedEvent({
          userId: req.user._id,
          type: 'topic_completed',
          message: `${user.name} completed the ${topic?.name} topic!`,
          data: { topicName: topic?.name },
        });
      }
    }

    await progress.save();

    res.json({
      success: true,
      progress,
      xpResult,
      streakResult,
      newAchievements,
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/problems/:id/notes
router.post('/:id/notes', authenticate, async (req, res) => {
  try {
    const { notes } = req.body;
    let progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, problemId: req.params.id },
      { notes },
      { upsert: true, new: true }
    );
    res.json({ success: true, notes: progress.notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/problems/:id/progress (reset)
router.delete('/:id/progress', authenticate, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id, problemId: req.params.id });
    if (progress) {
      if (progress.status === 'solved') {
        const problem = await Problem.findById(req.params.id);
        if (problem) {
          const difficultyField = `${problem.difficulty.toLowerCase()}Solved`;
          await User.findByIdAndUpdate(req.user._id, {
            $inc: {
              totalSolved: -1,
              [difficultyField]: -1,
            },
          });
        }
      }
      await Progress.deleteOne({ _id: progress._id });
      await Revision.deleteMany({ userId: req.user._id, problemId: req.params.id });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
