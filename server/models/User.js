const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    photoURL: { type: String, default: '' },

    // Profile
    college: { type: String, default: '' },
    branch: { type: String, default: '' },
    year: { type: Number, default: 1 },
    leetcodeUrl: { type: String, default: '' },
    gfgUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    bio: { type: String, default: '' },

    // Role
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },

    // XP & Level
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    title: {
      type: String,
      enum: ['Beginner', 'Solver', 'Advanced Solver', 'Expert', 'Master', 'Grandmaster', 'Legend'],
      default: 'Beginner',
    },

    // Streak
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date, default: null },

    // Stats
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },

    // Scores
    placementScore: { type: Number, default: 0 },
    contestScore: { type: Number, default: 0 },
    retentionScore: { type: Number, default: 100 },

    // Goals
    dailyGoal: { type: Number, default: 3 },
    weeklyGoal: { type: Number, default: 15 },
    monthlyGoal: { type: Number, default: 60 },

    // Daily tracking
    problemsSolvedToday: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null },

    // Achievements
    badges: [{ type: String }],
    achievements: [
      {
        achievementId: String,
        name: String,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],

    // Referral
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    referralCount: { type: Number, default: 0 },

    // Mentor-related
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isProfileComplete: { type: Boolean, default: false },

    // Notifications
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },

    // Heatmap (date => count)
    activityHeatmap: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ uid: 1 });
userSchema.index({ college: 1 });
userSchema.index({ xp: -1 });
userSchema.index({ totalSolved: -1 });
userSchema.index({ currentStreak: -1 });

module.exports = mongoose.model('User', userSchema);
