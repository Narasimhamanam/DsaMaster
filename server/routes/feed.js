const express = require('express');
const router = express.Router();
const FeedEvent = require('../models/FeedEvent');
const { authenticate } = require('../middleware/auth');

// GET /api/feed
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (page - 1) * limit;

    const events = await FeedEvent.find({ isPublic: true })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name photoURL college level title');

    const mappedEvents = events.map((event) => {
      const obj = event.toObject();
      obj.user = obj.userId; // Map userId to user for frontend compatibility
      return obj;
    });

    const total = await FeedEvent.countDocuments({ isPublic: true });
    const hasMore = skip + events.length < total;

    res.json({ success: true, events: mappedEvents, hasMore });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
