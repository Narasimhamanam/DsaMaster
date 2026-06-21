const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { authenticate } = require('../middleware/auth');

// GET /api/announcements
router.get('/', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isPublished: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      $or: [
        { targetRoles: { $size: 0 } },
        { targetRoles: req.user.role },
      ],
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(10)
      .populate('authorId', 'name');

    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
