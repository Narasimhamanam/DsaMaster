const cron = require('node-cron');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

// Create a new weekly contest every Saturday at 11 PM
// Contest runs every Sunday
const scheduleContestCreation = () => {
  cron.schedule('0 23 * * 6', async () => {
    try {
      console.log('🏆 Creating weekly contest...');

      const nextSunday = dayjs().add(1, 'day').startOf('day');
      const startTime = nextSunday.hour(10).toDate(); // 10 AM
      const endTime = nextSunday.hour(10).add(90, 'minute').toDate(); // 11:30 AM

      const week = nextSunday.isoWeek();
      const year = nextSunday.year();

      // Check if already created
      const existing = await Contest.findOne({ week, year, type: 'weekly' });
      if (existing) return;

      // Pick 2 random medium/hard problems
      const problems = await Problem.aggregate([
        { $match: { isActive: true, difficulty: { $in: ['Medium', 'Hard'] } } },
        { $sample: { size: 2 } },
      ]);

      if (problems.length < 2) {
        const easyProblems = await Problem.aggregate([
          { $match: { isActive: true } },
          { $sample: { size: 2 } },
        ]);
        problems.push(...easyProblems.slice(0, 2 - problems.length));
      }

      const contest = await Contest.create({
        title: `Weekly Contest ${week} – ${nextSunday.format('MMM D, YYYY')}`,
        description: 'Weekly coding competition. Solve 2 problems in 90 minutes!',
        problems: problems.map((p) => p._id),
        startTime,
        endTime,
        duration: 90,
        status: 'upcoming',
        type: 'weekly',
        week,
        year,
        isPublished: true,
      });

      console.log(`✅ Weekly contest created: ${contest.title}`);
    } catch (error) {
      console.error('Contest creation job error:', error);
    }
  });

  // Update contest status every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    await Contest.updateMany(
      { status: 'upcoming', startTime: { $lte: now } },
      { status: 'active' }
    );
    await Contest.updateMany(
      { status: 'active', endTime: { $lte: now } },
      { status: 'completed' }
    );
  });
};

module.exports = { scheduleContestCreation };
