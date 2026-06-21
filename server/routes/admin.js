const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const Contest = require('../models/Contest');
const Progress = require('../models/Progress');
const FeedEvent = require('../models/FeedEvent');
const Announcement = require('../models/Announcement');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');
const dayjs = require('dayjs');

router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, students, mentors, activeToday, activeWeek, activeMonth] = await Promise.all([
      User.countDocuments({ isProfileComplete: true }),
      User.countDocuments({ role: 'student', isProfileComplete: true }),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ lastActivityDate: { $gte: dayjs().startOf('day').toDate() } }),
      User.countDocuments({ lastActivityDate: { $gte: dayjs().startOf('week').toDate() } }),
      User.countDocuments({ lastActivityDate: { $gte: dayjs().startOf('month').toDate() } }),
    ]);

    const avgSolved = await User.aggregate([
      { $match: { role: 'student', isProfileComplete: true } },
      { $group: { _id: null, avg: { $avg: '$totalSolved' } } },
    ]);

    const topPerformers = await User.find({ role: 'student', isProfileComplete: true })
      .sort('-totalSolved')
      .limit(10)
      .select('name photoURL college totalSolved xp level currentStreak');

    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSolvedAll = await Progress.countDocuments({ status: 'solved' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        students,
        mentors,
        activeToday,
        activeWeek,
        activeMonth,
        inactiveUsers: students - activeWeek,
        avgProblemsPerUser: avgSolved[0]?.avg?.toFixed(1) || 0,
        totalProblems,
        totalSolvedAll,
        topPerformers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const users = await User.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-uid -activityHeatmap');

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'mentor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Progress.deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/problems
router.get('/problems', async (req, res) => {
  try {
    const problems = await Problem.find().populate('topicId', 'name slug').sort('topicId order');
    res.json({ success: true, problems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/problems
router.post('/problems', async (req, res) => {
  try {
    const topic = await Topic.findById(req.body.topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const problem = await Problem.create({
      ...req.body,
      topicSlug: topic.slug,
      topicName: topic.name,
    });
    await Topic.findByIdAndUpdate(topic._id, { $inc: { problemCount: 1 } });
    res.json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/problems/:id
router.put('/problems/:id', async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/admin/problems/:id
router.delete('/problems/:id', async (req, res) => {
  try {
    await Problem.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.find().sort('order');
    res.json({ success: true, topics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/announcements
router.post('/announcements', async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      authorId: req.user._id,
      isPublished: true,
    });
    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/feed
router.get('/feed', async (req, res) => {
  try {
    const events = await FeedEvent.find()
      .sort('-createdAt')
      .limit(50)
      .populate('userId', 'name photoURL college');
      
    const mappedEvents = events.map((event) => {
      const obj = event.toObject();
      obj.user = obj.userId;
      return obj;
    });
    
    res.json({ success: true, events: mappedEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
