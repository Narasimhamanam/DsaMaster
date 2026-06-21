const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const { getHeatmapData } = require('../services/streakService');
const { calculatePlacementScore, getReadinessLevel } = require('../services/placementService');
const dayjs = require('dayjs');

// GET /api/users/dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Topic completions
    const topics = await Topic.find().sort('order');
    const totalProblems = await Problem.countDocuments({ isActive: true });

    // Active problems count per topic via aggregate
    const problemCounts = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$topicId', count: { $sum: 1 } } }
    ]);
    const problemCountsMap = {};
    problemCounts.forEach(pc => {
      if (pc._id) problemCountsMap[pc._id.toString()] = pc.count;
    });

    // Solved counts per topic via aggregate
    const solvedCounts = await Progress.aggregate([
      { $match: { userId, status: 'solved' } },
      { $group: { _id: '$topicId', count: { $sum: 1 } } }
    ]);
    const solvedCountsMap = {};
    solvedCounts.forEach(sc => {
      if (sc._id) solvedCountsMap[sc._id.toString()] = sc.count;
    });

    const topicProgress = topics.map((topic) => {
      const topicIdStr = topic._id.toString();
      const total = problemCountsMap[topicIdStr] || 0;
      const solved = solvedCountsMap[topicIdStr] || 0;
      return {
        topicId: topic._id,
        slug: topic.slug,
        name: topic.name,
        icon: topic.icon,
        color: topic.color,
        total,
        solved,
        percentage: total > 0 ? Math.round((solved / total) * 100) : 0,
      };
    });

    // Today's solved count
    const todayStart = dayjs().startOf('day').toDate();
    const solvedToday = await Progress.countDocuments({
      userId,
      status: 'solved',
      solvedAt: { $gte: todayStart },
    });

    // Weekly solved
    const weekStart = dayjs().startOf('week').toDate();
    const solvedThisWeek = await Progress.countDocuments({
      userId,
      status: 'solved',
      solvedAt: { $gte: weekStart },
    });

    // Monthly solved
    const monthStart = dayjs().startOf('month').toDate();
    const solvedThisMonth = await Progress.countDocuments({
      userId,
      status: 'solved',
      solvedAt: { $gte: monthStart },
    });

    // Revisions due today
    const revisionsToday = await require('../models/Revision').countDocuments({
      userId,
      dueDate: { $lte: new Date() },
      status: 'pending',
    });

    const placementScore = await calculatePlacementScore(userId);
    const heatmapData = getHeatmapData(user);

    // Calculate global rank
    const myRank = await User.countDocuments({
      isProfileComplete: true,
      role: 'student',
      xp: { $gt: user.xp }
    }) + 1;

    // Generate weekly chart data for last 7 days using in-memory filter
    const sevenDaysAgo = dayjs().subtract(6, 'day').startOf('day').toDate();
    const solvedLastWeek = await Progress.find({
      userId,
      status: 'solved',
      solvedAt: { $gte: sevenDaysAgo }
    }).select('solvedAt');

    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = dayjs().subtract(i, 'day').startOf('day');
      const dayEnd = dayjs().subtract(i, 'day').endOf('day');
      const count = solvedLastWeek.filter(p => {
        if (!p.solvedAt) return false;
        const d = dayjs(p.solvedAt);
        return (d.isAfter(dayStart) || d.isSame(dayStart)) && (d.isBefore(dayEnd) || d.isSame(dayEnd));
      }).length;

      weeklyChart.push({
        day: dayStart.format('ddd'),
        solved: count,
      });
    }

    res.json({
      success: true,
      stats: {
        streak: user.currentStreak,
        totalSolved: user.totalSolved,
        todaySolved: solvedToday,
        dailyGoal: user.dailyGoal || 3,
        totalXP: user.xp,
        rank: myRank,
        placementScore,
      },
      topicProgress,
      weeklyChart,
      heatmap: heatmapData,
      progress: {
        weeklyGoal: user.weeklyGoal || 15,
        weeklySolved: solvedThisWeek,
        monthlyGoal: user.monthlyGoal || 60,
        monthlySolved: solvedThisMonth,
        roadmapSolved: user.totalSolved,
        roadmapTotal: totalProblems,
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all solved progress documents for the user once
    const solvedProgress = await Progress.find({ userId, status: 'solved' }).select('topicId solvedAt');

    // Problems solved per week for last 8 weeks
    const weeklyData = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = dayjs().subtract(i, 'week').startOf('week');
      const weekEnd = dayjs().subtract(i, 'week').endOf('week');
      const count = solvedProgress.filter(p => {
        if (!p.solvedAt) return false;
        const d = dayjs(p.solvedAt);
        return (d.isAfter(weekStart) || d.isSame(weekStart)) && (d.isBefore(weekEnd) || d.isSame(weekEnd));
      }).length;

      weeklyData.push({
        week: weekStart.format('MMM D'),
        solved: count,
      });
    }

    // Problems solved per month for last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = dayjs().subtract(i, 'month').startOf('month');
      const monthEnd = dayjs().subtract(i, 'month').endOf('month');
      const count = solvedProgress.filter(p => {
        if (!p.solvedAt) return false;
        const d = dayjs(p.solvedAt);
        return (d.isAfter(monthStart) || d.isSame(monthStart)) && (d.isBefore(monthEnd) || d.isSame(monthEnd));
      }).length;

      monthlyData.push({
        month: monthStart.format('MMM YY'),
        solved: count,
      });
    }

    // Difficulty breakdown
    const difficultyBreakdown = [
      { name: 'Easy', value: req.user.easySolved || 0, color: '#22c55e' },
      { name: 'Medium', value: req.user.mediumSolved || 0, color: '#f59e0b' },
      { name: 'Hard', value: req.user.hardSolved || 0, color: '#ef4444' },
    ];

    // Get active problems count per topic
    const problemCounts = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$topicId', count: { $sum: 1 } } }
    ]);
    const problemCountsMap = {};
    problemCounts.forEach(pc => {
      if (pc._id) problemCountsMap[pc._id.toString()] = pc.count;
    });

    // Count solved per topic
    const solvedCountsMap = {};
    solvedProgress.forEach(p => {
      if (p.topicId) {
        const tidStr = p.topicId.toString();
        solvedCountsMap[tidStr] = (solvedCountsMap[tidStr] || 0) + 1;
      }
    });

    // Topic strengths
    const topics = await Topic.find().sort('order');
    const topicStrengths = topics.map((topic) => {
      const total = problemCountsMap[topic._id.toString()] || 0;
      const solved = solvedCountsMap[topic._id.toString()] || 0;
      return {
        topic: topic.name,
        solved,
        total,
        percentage: total > 0 ? Math.round((solved / total) * 100) : 0,
      };
    });

    const sortedStrengths = topicStrengths.sort((a, b) => b.percentage - a.percentage);

    res.json({
      success: true,
      analytics: {
        weeklyData,
        monthlyData,
        difficultyBreakdown,
        strongTopics: sortedStrengths.slice(0, 5),
        weakTopics: sortedStrengths.filter((t) => t.total > 0).slice(-5).reverse(),
        retentionScore: req.user.retentionScore || 0,
        placementScore: req.user.placementScore || 0,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const allowedFields = ['name', 'photoURL', 'college', 'branch', 'year', 'leetcodeUrl', 'gfgUrl', 'githubUrl', 'bio', 'dailyGoal', 'weeklyGoal', 'monthlyGoal', 'emailNotifications', 'pushNotifications'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-__v');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:id/profile (public profile)
router.get('/:id/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name photoURL college branch year xp level title currentStreak longestStreak totalSolved easySolved mediumSolved hardSolved badges achievements createdAt'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/notifications/read
router.put('/notifications/read', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
