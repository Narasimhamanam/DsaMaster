const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const { authenticate } = require('../middleware/auth');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

// Helper to get leaderboard data
const getLeaderboardData = async (dateFilter, period) => {
  let users;

  if (period === 'alltime') {
    users = await User.find({ isProfileComplete: true, role: 'student' })
      .sort({ totalSolved: -1, xp: -1, currentStreak: -1 })
      .limit(100)
      .select('name photoURL college branch year xp level title currentStreak longestStreak totalSolved');
  } else {
    // Get users who solved problems in the period
    const solvedInPeriod = await Progress.aggregate([
      {
        $match: {
          status: 'solved',
          solvedAt: { $gte: dateFilter },
        },
      },
      {
        $group: {
          _id: '$userId',
          problemsSolvedInPeriod: { $sum: 1 },
        },
      },
      { $sort: { problemsSolvedInPeriod: -1 } },
      { $limit: 100 },
    ]);

    const userIds = solvedInPeriod.map((s) => s._id);
    const periodMap = {};
    solvedInPeriod.forEach((s) => { periodMap[s._id.toString()] = s.problemsSolvedInPeriod; });

    users = await User.find({ _id: { $in: userIds }, role: 'student' }).select(
      'name photoURL college branch year xp level title currentStreak longestStreak totalSolved'
    );

    users = users.map((u) => ({
      ...u.toObject(),
      problemsSolvedInPeriod: periodMap[u._id.toString()] || 0,
    }));

    users.sort((a, b) => b.problemsSolvedInPeriod - a.problemsSolvedInPeriod);
  }

  return users.map((u, i) => {
    const userObj = typeof u.toObject === 'function' ? u.toObject() : u;
    return {
      rank: i + 1,
      user: userObj,
      solvedCount: period === 'alltime' ? userObj.totalSolved : (userObj.problemsSolvedInPeriod || 0),
      xp: userObj.xp || 0,
      streak: userObj.currentStreak || 0,
      level: userObj.level || 1,
    };
  });
};

// GET /api/leaderboard/daily
router.get('/daily', authenticate, async (req, res) => {
  try {
    const dateFilter = dayjs().startOf('day').toDate();
    const rankings = await getLeaderboardData(dateFilter, 'daily');
    res.json({ success: true, period: 'daily', rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/leaderboard/weekly
router.get('/weekly', authenticate, async (req, res) => {
  try {
    const dateFilter = dayjs().startOf('isoWeek').toDate();
    const rankings = await getLeaderboardData(dateFilter, 'weekly');
    res.json({ success: true, period: 'weekly', rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/leaderboard/monthly
router.get('/monthly', authenticate, async (req, res) => {
  try {
    const dateFilter = dayjs().startOf('month').toDate();
    const rankings = await getLeaderboardData(dateFilter, 'monthly');
    res.json({ success: true, period: 'monthly', rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/leaderboard/alltime
router.get('/alltime', authenticate, async (req, res) => {
  try {
    const rankings = await getLeaderboardData(null, 'alltime');
    res.json({ success: true, period: 'alltime', rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/leaderboard/my-rank
router.get('/my-rank', authenticate, async (req, res) => {
  try {
    const allUsers = await User.find({ isProfileComplete: true, role: 'student' })
      .sort({ totalSolved: -1, xp: -1 })
      .select('_id');

    const myRank = allUsers.findIndex((u) => u._id.toString() === req.user._id.toString()) + 1;

    res.json({ success: true, rank: myRank, total: allUsers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
