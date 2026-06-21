const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase');
const User = require('../models/User');
const Referral = require('../models/Referral');
const { generateToken } = require('../middleware/auth');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { v4: uuidv4 } = require('uuid');

// POST /api/auth/firebase-login
// Verify Firebase token and create/find user
router.post('/firebase-login', authLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'ID token required' });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ uid });
    const isNewUser = !user;

    if (!user) {
      // Create new user
      const referralCode = uuidv4().split('-')[0].toUpperCase();
      user = await User.create({
        uid,
        email,
        name: name || email.split('@')[0],
        photoURL: picture || '',
        referralCode,
        isProfileComplete: false,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
      isNewUser,
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// POST /api/auth/complete-profile
// Save onboarding data
router.post('/complete-profile', authenticate, async (req, res) => {
  try {
    const { college, branch, year, leetcodeUrl, gfgUrl, githubUrl, referralCode } = req.body;

    if (!college || !branch || !year) {
      return res.status(400).json({ success: false, message: 'College, branch, and year are required' });
    }

    const updateData = {
      college,
      branch,
      year: parseInt(year),
      leetcodeUrl: leetcodeUrl || '',
      gfgUrl: gfgUrl || '',
      githubUrl: githubUrl || '',
      isProfileComplete: true,
    };

    // Handle referral
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer && referrer._id.toString() !== req.user._id.toString()) {
        updateData.referredBy = referralCode;

        // Create referral record
        await Referral.create({
          referrerId: referrer._id,
          referredUserId: req.user._id,
          referralCode,
          isRewarded: false,
        });

        // Award XP to referrer
        await User.findByIdAndUpdate(referrer._id, {
          $inc: { xp: 100, referralCount: 1 },
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-__v');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
