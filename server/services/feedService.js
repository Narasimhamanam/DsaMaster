const FeedEvent = require('../models/FeedEvent');
const { getIO } = require('../config/socket');

const createFeedEvent = async ({ userId, type, message, data = {}, isPublic = true }) => {
  try {
    const event = await FeedEvent.create({
      userId,
      type,
      message,
      data,
      isPublic,
    });

    // Populate user details for socket emission
    const populated = await FeedEvent.findById(event._id).populate('userId', 'name photoURL college level title');
    
    if (populated) {
      const eventObj = populated.toObject();
      eventObj.user = eventObj.userId; // Map userId to user for frontend compatibility
      
      try {
        const io = getIO();
        io.emit('feed_event', eventObj);
      } catch (err) {
        console.error('Socket emission failed in feedService:', err.message);
      }
    }
    
    return event;
  } catch (error) {
    console.error('Failed to create feed event:', error);
    throw error;
  }
};

module.exports = { createFeedEvent };
