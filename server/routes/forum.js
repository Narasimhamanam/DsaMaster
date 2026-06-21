const express = require('express');
const router = express.Router();
const ForumPost = require('../models/Forum');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const xss = require('xss');

// GET /api/forum/problem/:problemId
router.get('/problem/:problemId', authenticate, async (req, res) => {
  try {
    const { sort = 'latest' } = req.query;
    const sortMap = {
      latest: { createdAt: -1 },
      helpful: { upvoteCount: -1 },
      upvoted: { upvoteCount: -1 },
    };

    const posts = await ForumPost.find({
      problemId: req.params.problemId,
      parentId: null,
      isDeleted: false,
    })
      .sort(sortMap[sort] || sortMap.latest)
      .limit(50)
      .populate('authorId', 'name photoURL level title role')
      .lean();

    // Get replies for each post
    const postIds = posts.map((p) => p._id);
    const replies = await ForumPost.find({
      parentId: { $in: postIds },
      isDeleted: false,
    })
      .populate('authorId', 'name photoURL level title role')
      .lean();

    const repliesMap = {};
    replies.forEach((r) => {
      const pid = r.parentId.toString();
      if (!repliesMap[pid]) repliesMap[pid] = [];
      repliesMap[pid].push(r);
    });

    const postsWithReplies = posts.map((p) => ({
      ...p,
      replies: repliesMap[p._id.toString()] || [],
      upvoted: p.upvotes?.some((id) => id.toString() === req.user._id.toString()),
    }));

    res.json({ success: true, posts: postsWithReplies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/forum
router.post('/', authenticate, async (req, res) => {
  try {
    const { problemId, content, type, title, parentId } = req.body;
    if (!content || content.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Content too short' });
    }

    const post = await ForumPost.create({
      problemId,
      authorId: req.user._id,
      content: xss(content),
      type: type || 'question',
      title: title ? xss(title) : '',
      parentId: parentId || null,
      isMentorAnswer: req.user.role === 'mentor' || req.user.role === 'admin',
    });

    // Update parent reply count
    if (parentId) {
      await ForumPost.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });

      // Notify parent post author
      const parentPost = await ForumPost.findById(parentId);
      if (parentPost && parentPost.authorId.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: parentPost.authorId,
          type: 'forum_reply',
          title: 'New reply to your post',
          message: `${req.user.name} replied to your discussion`,
          data: { postId: parentId, problemId },
        });
      }
    }

    const populated = await ForumPost.findById(post._id).populate('authorId', 'name photoURL level title role');
    res.json({ success: true, post: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/forum/:id/upvote
router.post('/:id/upvote', authenticate, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id;
    const alreadyUpvoted = post.upvotes.some((id) => id.toString() === userId.toString());

    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter((id) => id.toString() !== userId.toString());
      post.upvoteCount = Math.max(0, post.upvoteCount - 1);
    } else {
      post.upvotes.push(userId);
      post.upvoteCount += 1;
    }

    await post.save();
    res.json({ success: true, upvoteCount: post.upvoteCount, upvoted: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/forum/:id/accept
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    await ForumPost.updateMany(
      { problemId: req.params.id },
      { isAccepted: false }
    );
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isAccepted: true },
      { new: true }
    );

    // Notify author
    if (post.authorId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: post.authorId,
        type: 'answer_accepted',
        title: 'Your answer was accepted!',
        message: 'Your solution was marked as the accepted answer',
        data: { postId: post._id },
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/forum/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    post.isDeleted = true;
    await post.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
