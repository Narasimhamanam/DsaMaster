const User = require('../models/User');
const Progress = require('../models/Progress');
const Problem = require('../models/Problem');

// Calculate placement readiness score (0-100)
const calculatePlacementScore = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return 0;

  const totalProblems = await Problem.countDocuments({ isActive: true });
  const solvedProblems = await Progress.countDocuments({ userId, status: 'solved' });

  // Factor 1: Roadmap completion (30%)
  const roadmapFactor = totalProblems > 0 ? (solvedProblems / totalProblems) * 30 : 0;

  // Factor 2: Difficulty spread (25%)
  const hardSolved = await Progress.countDocuments({
    userId,
    status: 'solved',
    topicId: { $exists: true },
  });

  const problems = await Progress.find({ userId, status: 'solved' }).populate('problemId', 'difficulty');
  const easyCount = problems.filter((p) => p.problemId?.difficulty === 'Easy').length;
  const medCount = problems.filter((p) => p.problemId?.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.problemId?.difficulty === 'Hard').length;

  const totalSolved = easyCount + medCount + hardCount;
  const difficultyFactor = totalSolved > 0
    ? Math.min(25, ((medCount * 1.5 + hardCount * 3) / (totalSolved * 3)) * 25)
    : 0;

  // Factor 3: Consistency / Streak (20%)
  const streakFactor = Math.min(20, (user.currentStreak / 30) * 20);

  // Factor 4: Contest performance (15%)
  const contestFactor = Math.min(15, (user.contestScore / 1000) * 15);

  // Factor 5: Revision accuracy / retention (10%)
  const retentionFactor = (user.retentionScore / 100) * 10;

  const totalScore = roadmapFactor + difficultyFactor + streakFactor + contestFactor + retentionFactor;
  const score = Math.round(Math.min(100, totalScore));

  // Update user
  await User.findByIdAndUpdate(userId, { placementScore: score });

  return score;
};

const getReadinessLevel = (score) => {
  if (score >= 90) return 'Top 10%';
  if (score >= 75) return 'Interview Ready';
  if (score >= 55) return 'Advanced';
  if (score >= 35) return 'Intermediate';
  return 'Beginner';
};

module.exports = { calculatePlacementScore, getReadinessLevel };
