const User = require('../models/User');
const dayjs = require('dayjs');

// XP thresholds for each level
const LEVEL_XP = [];
for (let i = 1; i <= 100; i++) {
  LEVEL_XP.push(i * 150 + (i - 1) * 50); // Progressive XP needed per level
}

const TITLES = [
  { minLevel: 1, title: 'Beginner' },
  { minLevel: 11, title: 'Solver' },
  { minLevel: 26, title: 'Advanced Solver' },
  { minLevel: 41, title: 'Expert' },
  { minLevel: 61, title: 'Master' },
  { minLevel: 81, title: 'Grandmaster' },
  { minLevel: 96, title: 'Legend' },
];

const XP_REWARDS = {
  Easy: 10,
  Medium: 20,
  Hard: 40,
};

const getTitle = (level) => {
  let title = 'Beginner';
  for (const t of TITLES) {
    if (level >= t.minLevel) title = t.title;
  }
  return title;
};

const getLevelFromXP = (totalXP) => {
  let level = 1;
  let accumulated = 0;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    accumulated += LEVEL_XP[i];
    if (totalXP < accumulated) {
      level = i + 1;
      break;
    }
    level = i + 2;
  }
  return Math.min(level, 100);
};

const addXP = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const oldLevel = user.level;
  user.xp += amount;
  user.level = getLevelFromXP(user.xp);
  user.title = getTitle(user.level);

  await user.save();

  return {
    newXP: user.xp,
    newLevel: user.level,
    title: user.title,
    leveledUp: user.level > oldLevel,
    oldLevel,
  };
};

module.exports = { addXP, getLevelFromXP, getTitle, XP_REWARDS };
