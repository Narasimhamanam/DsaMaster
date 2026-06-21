const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const ContestSubmission = require('../models/ContestSubmission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');
const { getIO } = require('../config/socket');
const dayjs = require('dayjs');

// GET /api/contests
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { isPublished: true };
    if (status) query.status = status;

    const contests = await Contest.find(query)
      .sort('-startTime')
      .limit(20)
      .populate('problems', 'title difficulty');

    // Add user participation status
    const contestIds = contests.map((c) => c._id);
    const userSubmissions = await ContestSubmission.find({
      userId: req.user._id,
      contestId: { $in: contestIds },
    }).select('contestId');

    const participatedIds = new Set(userSubmissions.map((s) => s.contestId.toString()));

    const contestsWithStatus = contests.map((c) => ({
      ...c.toObject(),
      userParticipated: participatedIds.has(c._id.toString()),
    }));

    res.json({ success: true, contests: contestsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/contests/upcoming
router.get('/upcoming', authenticate, async (req, res) => {
  try {
    const upcoming = await Contest.findOne({
      status: 'upcoming',
      isPublished: true,
      startTime: { $gt: new Date() },
    }).sort('startTime');

    res.json({ success: true, contest: upcoming });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/contests/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems', 'title difficulty tags description');

    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    // Get user's submissions for this contest
    const mySubmissions = await ContestSubmission.find({
      contestId: contest._id,
      userId: req.user._id,
    }).populate('problemId', 'title difficulty');

    res.json({ success: true, contest, mySubmissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/contests/:id/register
router.post('/:id/register', authenticate, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    if (contest.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Contest has ended' });
    }

    if (!contest.participants.includes(req.user._id)) {
      contest.participants.push(req.user._id);
      contest.totalParticipants += 1;
      await contest.save();
    }

    res.json({ success: true, message: 'Registered for contest' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/contests/:id/submit
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { problemId, status, code, language, timeTaken } = req.body;
    const contest = await Contest.findById(req.params.id);

    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    if (contest.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Contest is not active' });
    }

    let score = 0;
    if (status === 'solved') {
      const problem = await Problem.findById(problemId);
      score = problem?.difficulty === 'Hard' ? 300 : problem?.difficulty === 'Medium' ? 200 : 100;
      // Time bonus: faster = more points (max 50 bonus)
      const timeBonus = Math.max(0, 50 - Math.floor(timeTaken / 60));
      score += timeBonus;
    }

    const submission = await ContestSubmission.findOneAndUpdate(
      { contestId: req.params.id, userId: req.user._id, problemId },
      { status, code, language, timeTaken, score, submittedAt: new Date() },
      { upsert: true, new: true }
    );

    // Update user contest score
    await User.findByIdAndUpdate(req.user._id, { $inc: { contestScore: score } });

    // Emit live update
    try {
      const io = getIO();
      io.to(`contest_${req.params.id}`).emit('submission_update', {
        userId: req.user._id,
        problemId,
        status,
        score,
      });
    } catch {}

    res.json({ success: true, submission, score });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/contests/:id/leaderboard
router.get('/:id/leaderboard', authenticate, async (req, res) => {
  try {
    const submissions = await ContestSubmission.find({ contestId: req.params.id })
      .populate('userId', 'name photoURL college')
      .sort('-score');

    // Aggregate by user
    const userScores = {};
    submissions.forEach((s) => {
      const uid = s.userId._id.toString();
      if (!userScores[uid]) {
        userScores[uid] = {
          user: s.userId,
          totalScore: 0,
          solved: 0,
          totalTime: 0,
        };
      }
      userScores[uid].totalScore += s.score;
      if (s.status === 'solved') userScores[uid].solved += 1;
      userScores[uid].totalTime += s.timeTaken;
    });

    const rankings = Object.values(userScores)
      .sort((a, b) => b.totalScore - a.totalScore || a.totalTime - b.totalTime)
      .map((r, i) => ({ rank: i + 1, ...r }));

    res.json({ success: true, rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Create contest manually
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const contest = await Contest.create({ ...req.body, isPublished: true });
    res.json({ success: true, contest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
