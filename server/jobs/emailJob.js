const cron = require('node-cron');
const User = require('../models/User');
const Contest = require('../models/Contest');
const {
  sendDailyReminder,
  sendInactivityWarning,
  sendContestReminder,
} = require('../services/emailService');
const dayjs = require('dayjs');

const scheduleEmailJobs = () => {
  // Daily at 8 PM – send reminders to users who haven't solved today
  cron.schedule('0 20 * * *', async () => {
    console.log('📧 Running daily reminder email job...');
    try {
      const today = dayjs().startOf('day').toDate();

      const usersWithoutSolve = await User.find({
        role: 'student',
        isProfileComplete: true,
        emailNotifications: true,
        $or: [
          { lastSolvedDate: { $lt: today } },
          { lastSolvedDate: null },
        ],
      }).limit(500);

      let sent = 0;
      for (const user of usersWithoutSolve) {
        await sendDailyReminder(user);
        sent++;
        // Throttle: 2 per second to respect API limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      console.log(`✅ Daily reminders sent: ${sent}`);
    } catch (error) {
      console.error('Daily email job error:', error);
    }
  });

  // Daily at 9 PM – inactivity warnings
  cron.schedule('0 21 * * *', async () => {
    console.log('⚠️ Running inactivity warning job...');
    try {
      const day3 = dayjs().subtract(3, 'day').toDate();
      const day7 = dayjs().subtract(7, 'day').toDate();
      const day14 = dayjs().subtract(14, 'day').toDate();
      const day15 = dayjs().subtract(15, 'day').toDate();

      // Level 3: 14-15 days inactive
      const critical = await User.find({
        role: 'student',
        emailNotifications: true,
        lastActivityDate: { $gte: day15, $lt: day14 },
      }).limit(100);

      for (const user of critical) {
        await sendInactivityWarning(user, 14);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Level 2: 7-8 days inactive
      const day8 = dayjs().subtract(8, 'day').toDate();
      const warning = await User.find({
        role: 'student',
        emailNotifications: true,
        lastActivityDate: { $gte: day8, $lt: day7 },
      }).limit(100);

      for (const user of warning) {
        await sendInactivityWarning(user, 7);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Level 1: 3-4 days inactive
      const day4 = dayjs().subtract(4, 'day').toDate();
      const reminder = await User.find({
        role: 'student',
        emailNotifications: true,
        lastActivityDate: { $gte: day4, $lt: day3 },
      }).limit(100);

      for (const user of reminder) {
        await sendInactivityWarning(user, 3);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      console.log(`✅ Inactivity warnings sent`);
    } catch (error) {
      console.error('Inactivity email job error:', error);
    }
  });

  // Contest reminder – 1 hour before contest starts
  cron.schedule('*/30 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourLater = dayjs().add(1, 'hour').toDate();
      const oneHourAndThirty = dayjs().add(90, 'minute').toDate();

      const upcomingContest = await Contest.findOne({
        status: 'upcoming',
        startTime: { $gte: oneHourLater, $lte: oneHourAndThirty },
      });

      if (upcomingContest) {
        const users = await User.find({
          role: 'student',
          emailNotifications: true,
        }).limit(500);

        for (const user of users) {
          await sendContestReminder(user, upcomingContest);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        console.log(`✅ Contest reminders sent for: ${upcomingContest.title}`);
      }
    } catch (error) {
      console.error('Contest reminder job error:', error);
    }
  });
};

module.exports = { scheduleEmailJobs };
