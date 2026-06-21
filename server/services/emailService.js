const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'DSAMASTER <noreply@dsamaster.dev>';

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({ from: FROM, to, subject, html });
    console.log(`📧 Email sent to ${to}: ${subject}`);
    return data;
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return null;
  }
};

const sendMorningReminder = async (user, solvedToday) => {
  return sendEmail({
    to: user.email,
    subject: '🌅 Morning Boost: Ready for your Daily Coding Goal?',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d1a; color: #e2e8f0; padding: 40px; border-radius: 16px; border: 1px solid #1e1e38;">
        <h1 style="color: #7c3aed; margin-bottom: 8px; font-size: 28px; font-weight: 800;">DSAMASTER</h1>
        <h2 style="margin-bottom: 20px; font-size: 20px;">Rise & Code, ${user.name}! 🌅</h2>
        <p style="font-size: 16px; line-height: 1.6;">It's a fresh day to sharpen your problem-solving skills and step closer to your dream placement.</p>
        
        <div style="background: #131326; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #2a2a4e;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-size: 15px; color: #94a3b8;">Current Streak:</td>
              <td style="padding: 6px 0; font-size: 16px; font-weight: bold; color: #f59e0b; text-align: right;">🔥 ${user.currentStreak} days</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 15px; color: #94a3b8;">Daily Goal:</td>
              <td style="padding: 6px 0; font-size: 16px; font-weight: bold; color: #7c3aed; text-align: right;">🎯 ${user.dailyGoal} problems</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 15px; color: #94a3b8;">Solved Today:</td>
              <td style="padding: 6px 0; font-size: 16px; font-weight: bold; color: #e2e8f0; text-align: right;">${solvedToday} / ${user.dailyGoal}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">Consistency is the key to cracking technical interviews. Jump into your roadmap and check off today's goal!</p>
        
        <a href="${process.env.CLIENT_URL}/roadmap" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
          Start Solving Now →
        </a>
        
        <p style="margin-top: 32px; color: #94a3b8; font-size: 12px; border-t: 1px solid #1e1e38; padding-top: 20px;">You're receiving this because you've enabled email notifications. You can disable them anytime in your <a href="${process.env.CLIENT_URL}/profile" style="color: #7c3aed; text-decoration: none;">Profile settings</a>.</p>
      </div>
    `,
  });
};

const sendEveningReminder = async (user, solvedToday) => {
  const isZero = solvedToday === 0;
  const subject = isZero 
    ? `🔥 Save your ${user.currentStreak}-day streak!` 
    : `🎯 Close to your goal: Complete your daily DSA mission!`;
  
  const headerText = isZero 
    ? `Don't break your streak! 😱` 
    : `You're almost there! 🚀`;

  const descriptionText = isZero
    ? `Your coding streak is currently at <strong style="color: #f59e0b;">${user.currentStreak} days</strong>. If you don't solve at least one problem before midnight, your streak will reset to 0!`
    : `You have solved <strong style="color: #7c3aed;">${solvedToday} out of ${user.dailyGoal}</strong> problems for today. You only need <strong style="color: #10b981;">${user.dailyGoal - solvedToday} more</strong> to complete your daily goal!`;

  return sendEmail({
    to: user.email,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d1a; color: #e2e8f0; padding: 40px; border-radius: 16px; border: 1px solid #1e1e38;">
        <h1 style="color: #7c3aed; margin-bottom: 8px; font-size: 28px; font-weight: 800;">DSAMASTER</h1>
        <h2 style="margin-bottom: 20px; font-size: 20px; color: ${isZero ? '#ef4444' : '#f59e0b'};">${headerText}</h2>
        <p style="font-size: 16px; line-height: 1.6;">${descriptionText}</p>
        
        <div style="background: #131326; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #2a2a4e;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-size: 15px; color: #94a3b8;">Current Streak:</td>
              <td style="padding: 6px 0; font-size: 16px; font-weight: bold; color: #f59e0b; text-align: right;">🔥 ${user.currentStreak} days</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 15px; color: #94a3b8;">Daily Goal:</td>
              <td style="padding: 6px 0; font-size: 16px; font-weight: bold; color: #7c3aed; text-align: right;">🎯 ${user.dailyGoal} problems</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 15px; color: #94a3b8;">Solved Today:</td>
              <td style="padding: 6px 0; font-size: 16px; font-weight: bold; color: #e2e8f0; text-align: right;">${solvedToday} / ${user.dailyGoal}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">Don't let today's opportunity slip by. Head over to the platform and complete your daily challenge!</p>
        
        <a href="${process.env.CLIENT_URL}/roadmap" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: ${isZero ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #f59e0b, #d97706)'}; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px ${isZero ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'};">
          Solve Now →
        </a>
        
        <p style="margin-top: 32px; color: #94a3b8; font-size: 12px; border-t: 1px solid #1e1e38; padding-top: 20px;">You're receiving this because you've enabled email notifications. You can disable them anytime in your <a href="${process.env.CLIENT_URL}/profile" style="color: #7c3aed; text-decoration: none;">Profile settings</a>.</p>
      </div>
    `,
  });
};

const sendInactivityWarning = async (user, daysSinceLastSolve) => {
  const level = daysSinceLastSolve >= 14 ? 3 : daysSinceLastSolve >= 7 ? 2 : 1;
  const levelColor = level === 3 ? '#ef4444' : level === 2 ? '#f59e0b' : '#f97316';
  const levelText = level === 3 ? 'Critical Warning' : level === 2 ? 'Warning' : 'Reminder';

  return sendEmail({
    to: user.email,
    subject: `⚠️ ${levelText}: ${daysSinceLastSolve} days without solving – Get back on track!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d1a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: ${levelColor};">⚠️ ${levelText}</h1>
        <h2>Hey ${user.name}, we miss you!</h2>
        <p style="font-size: 16px; line-height: 1.6;">You haven't solved any DSA problems in <strong style="color: ${levelColor};">${daysSinceLastSolve} days</strong>.</p>
        <p style="font-size: 16px;">Your placement readiness is at risk. Don't fall behind your peers!</p>
        <a href="${process.env.CLIENT_URL}/roadmap" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: ${levelColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Resume Learning Now →
        </a>
      </div>
    `,
  });
};

const sendContestReminder = async (user, contest) => {
  return sendEmail({
    to: user.email,
    subject: `🏆 Contest Starting Soon: ${contest.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d1a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #7c3aed;">🏆 Contest Alert!</h1>
        <h2>${contest.title}</h2>
        <p>The contest starts in 1 hour. Don't miss it!</p>
        <a href="${process.env.CLIENT_URL}/contests" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Join Contest →
        </a>
      </div>
    `,
  });
};

const sendAchievementEmail = async (user, achievement) => {
  return sendEmail({
    to: user.email,
    subject: `🏆 Achievement Unlocked: ${achievement.name}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d1a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #f59e0b;">${achievement.icon} Achievement Unlocked!</h1>
        <h2>${achievement.name}</h2>
        <p style="font-size: 18px;">${achievement.description}</p>
        <p>You earned <strong style="color: #7c3aed;">+${achievement.xpReward} XP</strong></p>
        <a href="${process.env.CLIENT_URL}/achievements" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Achievements →
        </a>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendMorningReminder,
  sendEveningReminder,
  sendInactivityWarning,
  sendContestReminder,
  sendAchievementEmail,
};
