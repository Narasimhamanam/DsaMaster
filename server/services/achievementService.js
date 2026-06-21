const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');
const { createFeedEvent } = require('./feedService');
const { addXP } = require('./xpService');
const { getIO } = require('../config/socket');

// All achievement definitions
const ACHIEVEMENTS = [
  { achievementId: 'first_problem', name: 'First Step', description: 'Solved your first problem!', icon: '🎯', category: 'milestone', xpReward: 50, rarity: 'common', condition: { type: 'solved_count', value: 1 } },
  { achievementId: 'ten_problems', name: 'Getting Started', description: 'Solved 10 problems!', icon: '🔥', category: 'milestone', xpReward: 100, rarity: 'common', condition: { type: 'solved_count', value: 10 } },
  { achievementId: 'twenty_five_problems', name: 'On a Roll', description: 'Solved 25 problems!', icon: '💪', category: 'milestone', xpReward: 150, rarity: 'common', condition: { type: 'solved_count', value: 25 } },
  { achievementId: 'fifty_problems', name: 'Dedicated Solver', description: 'Solved 50 problems!', icon: '⭐', category: 'milestone', xpReward: 250, rarity: 'rare', condition: { type: 'solved_count', value: 50 } },
  { achievementId: 'hundred_problems', name: 'Century Club', description: 'Solved 100 problems!', icon: '💯', category: 'milestone', xpReward: 500, rarity: 'rare', condition: { type: 'solved_count', value: 100 } },
  { achievementId: 'two_fifty_problems', name: 'Elite Coder', description: 'Solved 250 problems!', icon: '🏅', category: 'milestone', xpReward: 1000, rarity: 'epic', condition: { type: 'solved_count', value: 250 } },
  { achievementId: 'five_hundred_problems', name: 'DSA Legend', description: 'Solved 500 problems!', icon: '👑', category: 'milestone', xpReward: 2500, rarity: 'legendary', condition: { type: 'solved_count', value: 500 } },
  { achievementId: 'streak_7', name: 'Week Warrior', description: '7-day solving streak!', icon: '🗓️', category: 'streak', xpReward: 100, rarity: 'common', condition: { type: 'streak', value: 7 } },
  { achievementId: 'streak_30', name: 'Month Master', description: '30-day solving streak!', icon: '🌙', category: 'streak', xpReward: 500, rarity: 'epic', condition: { type: 'streak', value: 30 } },
  { achievementId: 'streak_100', name: 'Century Streak', description: '100-day solving streak!', icon: '🔥', category: 'streak', xpReward: 2000, rarity: 'legendary', condition: { type: 'streak', value: 100 } },
];

// Seed achievements to DB
const seedAchievements = async () => {
  for (const ach of ACHIEVEMENTS) {
    await Achievement.findOneAndUpdate(
      { achievementId: ach.achievementId },
      ach,
      { upsert: true, new: true }
    );
  }
};

// Check and award achievements after problem solved
const checkAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  const earnedIds = user.achievements.map((a) => a.achievementId);
  const newlyEarned = [];

  for (const ach of ACHIEVEMENTS) {
    if (earnedIds.includes(ach.achievementId)) continue;

    let earned = false;

    if (ach.condition.type === 'solved_count' && user.totalSolved >= ach.condition.value) {
      earned = true;
    } else if (ach.condition.type === 'streak' && user.currentStreak >= ach.condition.value) {
      earned = true;
    }

    if (earned) {
      user.achievements.push({ achievementId: ach.achievementId, name: ach.name, unlockedAt: new Date() });
      user.badges.push(ach.achievementId);
      newlyEarned.push(ach);

      // Award XP
      await addXP(userId, ach.xpReward);

      // Create notification
      await Notification.create({
        userId,
        type: 'achievement_unlocked',
        title: '🏆 Achievement Unlocked!',
        message: `You earned "${ach.name}" – ${ach.description}`,
        data: { achievementId: ach.achievementId, icon: ach.icon },
      });

      // Create feed event
      await createFeedEvent({
        userId,
        type: 'badge_earned',
        message: `${user.name} earned the "${ach.name}" badge!`,
        data: { achievementId: ach.achievementId, icon: ach.icon },
      });

      // Emit real-time event
      try {
        const io = getIO();
        io.emit('achievement_unlocked', {
          userId: user._id,
          userName: user.name,
          achievement: ach,
        });
      } catch {}
    }
  }

  if (newlyEarned.length > 0) await user.save();

  return newlyEarned;
};

module.exports = { checkAchievements, seedAchievements, ACHIEVEMENTS };
