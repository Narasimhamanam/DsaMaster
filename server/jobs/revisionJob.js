const cron = require('node-cron');
const Revision = require('../models/Revision');
const Notification = require('../models/Notification');
const User = require('../models/User');

const scheduleRevisionJobs = () => {
  // Every morning at 7 AM – notify users of due revisions
  cron.schedule('0 7 * * *', async () => {
    console.log('📚 Running revision notification job...');
    try {
      const today = new Date();

      // Find users who have revisions due today
      const dueRevisions = await Revision.aggregate([
        { $match: { dueDate: { $lte: today }, status: 'pending' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]);

      for (const item of dueRevisions) {
        await Notification.create({
          userId: item._id,
          type: 'revision_due',
          title: '📚 Revisions Due Today',
          message: `You have ${item.count} problem${item.count > 1 ? 's' : ''} due for revision. Keep your retention score high!`,
          data: { count: item.count },
        });
      }

      console.log(`✅ Revision notifications sent to ${dueRevisions.length} users`);
    } catch (error) {
      console.error('Revision job error:', error);
    }
  });

  // Daily at midnight – mark overdue revisions
  cron.schedule('0 0 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await Revision.updateMany(
        { status: 'pending', dueDate: { $lt: yesterday } },
        { status: 'overdue' }
      );
    } catch (error) {
      console.error('Mark overdue revisions error:', error);
    }
  });
};

module.exports = { scheduleRevisionJobs };
