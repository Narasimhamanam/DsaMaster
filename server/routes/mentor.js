const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const MentorNote = require('../models/MentorNote');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const { requireMentor } = require('../middleware/roleGuard');
const { getHeatmapData } = require('../services/streakService');
const dayjs = require('dayjs');

// Apply mentor guard to all mentor routes
router.use(authenticate, requireMentor);

// GET /api/mentor/students
router.get('/students', async (req, res) => {
  try {
    const { college, branch, year, search, page = 1, limit = 20 } = req.query;
    const query = { role: 'student', isProfileComplete: true };

    if (college) query.college = new RegExp(college, 'i');
    if (branch) query.branch = new RegExp(branch, 'i');
    if (year) query.year = parseInt(year);
    if (search) query.name = new RegExp(search, 'i');

    const students = await User.find(query)
      .select('name email photoURL college branch year xp level currentStreak longestStreak totalSolved placementScore lastActivityDate createdAt')
      .sort('-totalSolved')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, students, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/mentor/students/:id
router.get('/students/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-uid');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const heatmapData = getHeatmapData(student);

    // Topic progress
    const Topic = require('../models/Topic');
    const Problem = require('../models/Problem');
    const topics = await Topic.find().sort('order');
    const topicProgress = await Promise.all(
      topics.map(async (t) => {
        const total = await Problem.countDocuments({ topicId: t._id });
        const solved = await Progress.countDocuments({ userId: student._id, topicId: t._id, status: 'solved' });
        return { topicName: t.name, slug: t.slug, total, solved, percentage: total > 0 ? Math.round((solved / total) * 100) : 0 };
      })
    );

    // Notes about this student
    const mentorNotes = await MentorNote.find({
      mentorId: req.user._id,
      studentId: student._id,
    }).sort('-createdAt');

    res.json({
      success: true,
      student,
      heatmapData,
      topicProgress,
      mentorNotes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/mentor/inactive - Warning Dashboard
router.get('/inactive', async (req, res) => {
  try {
    const now = new Date();
    const day3 = dayjs().subtract(3, 'day').toDate();
    const day7 = dayjs().subtract(7, 'day').toDate();
    const day14 = dayjs().subtract(14, 'day').toDate();

    const level3 = await User.find({
      role: 'student',
      isProfileComplete: true,
      $or: [{ lastActivityDate: { $lt: day14 } }, { lastActivityDate: null }],
    }).select('name email photoURL college branch year totalSolved lastActivityDate lastSolvedDate currentStreak placementScore').limit(50);

    const level2 = await User.find({
      role: 'student',
      isProfileComplete: true,
      lastActivityDate: { $gte: day14, $lt: day7 },
    }).select('name email photoURL college branch year totalSolved lastActivityDate lastSolvedDate currentStreak placementScore').limit(50);

    const level1 = await User.find({
      role: 'student',
      isProfileComplete: true,
      lastActivityDate: { $gte: day7, $lt: day3 },
    }).select('name email photoURL college branch year totalSolved lastActivityDate lastSolvedDate currentStreak placementScore').limit(50);

    const formatWarnings = (students) => students.map(s => {
      const obj = s.toObject();
      return {
        _id: s._id,
        userId: s._id,
        user: obj,
        ...obj
      };
    });

    res.json({
      success: true,
      level1: formatWarnings(level1),
      level2: formatWarnings(level2),
      level3: formatWarnings(level3),
      warnings: {
        level1: { students: level1, count: level1.length, label: '3+ days inactive' },
        level2: { students: level2, count: level2.length, label: '7+ days inactive' },
        level3: { students: level3, count: level3.length, label: '14+ days inactive (Critical)' },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/mentor/students/:id/message
router.post('/students/:id/message', async (req, res) => {
  try {
    const { message } = req.body;
    await Notification.create({
      userId: req.params.id,
      type: 'mentor_message',
      title: `Message from ${req.user.name}`,
      message,
      data: { mentorId: req.user._id, mentorName: req.user.name },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/mentor/students/:id/notes
router.post('/students/:id/notes', async (req, res) => {
  try {
    const { note, type } = req.body;
    const mentorNote = await MentorNote.create({
      mentorId: req.user._id,
      studentId: req.params.id,
      note,
      type: type || 'observation',
    });
    res.json({ success: true, note: mentorNote });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
