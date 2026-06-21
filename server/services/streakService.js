const User = require('../models/User');
const dayjs = require('dayjs');

// Update streak when user solves a problem
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = dayjs().startOf('day');
  const lastSolved = user.lastSolvedDate ? dayjs(user.lastSolvedDate).startOf('day') : null;

  let streakBroken = false;

  if (!lastSolved) {
    // First solve ever
    user.currentStreak = 1;
  } else if (today.isSame(lastSolved)) {
    // Already solved today – update activity heatmap but don't change streak
  } else if (today.diff(lastSolved, 'day') === 1) {
    // Consecutive day – extend streak
    user.currentStreak += 1;
  } else {
    // Streak broken
    user.currentStreak = 1;
    streakBroken = true;
  }

  user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
  user.lastSolvedDate = new Date();

  // Update heatmap
  const dateKey = today.format('YYYY-MM-DD');
  const currentCount = user.activityHeatmap.get(dateKey) || 0;
  user.activityHeatmap.set(dateKey, currentCount + 1);

  // Update problems solved today
  if (!lastSolved || !today.isSame(lastSolved)) {
    user.problemsSolvedToday = 1;
  } else {
    user.problemsSolvedToday += 1;
  }

  user.lastActivityDate = new Date();
  await user.save();

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    streakBroken,
  };
};

// Get heatmap data for a user (last 365 days)
const getHeatmapData = (user) => {
  const result = [];
  const today = dayjs();

  for (let i = 364; i >= 0; i--) {
    const date = today.subtract(i, 'day').format('YYYY-MM-DD');
    result.push({
      date,
      count: user.activityHeatmap.get(date) || 0,
    });
  }

  return result;
};

module.exports = { updateStreak, getHeatmapData };
