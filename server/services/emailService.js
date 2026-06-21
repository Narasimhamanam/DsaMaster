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

const sendDailyReminder = async (user) => {
  return sendEmail({
    to: user.email,
    subject: '🔔 Daily DSA Challenge – Don\'t break your streak!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0d0d1a; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #7c3aed; margin-bottom: 8px;">DSAMASTER</h1>
        <h2 style="margin-bottom: 24px;">Hey ${user.name}! 👋</h2>
        <p style="font-size: 16px; line-height: 1.6;">You haven't solved any problems today. Your current streak is <strong style="color: #f59e0b;">${user.currentStreak} days</strong>!</p>
        <p style="font-size: 16px; line-height: 1.6;">Don't let it slip away. Even <strong>one problem</strong> keeps the momentum going.</p>
        <a href="${process.env.CLIENT_URL}/roadmap" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Solve a Problem Now →
        </a>
        <p style="margin-top: 32px; color: #94a3b8; font-size: 12px;">You're receiving this because you've enabled email reminders. <a href="${process.env.CLIENT_URL}/profile" style="color: #7c3aed;">Manage preferences</a></p>
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
  sendDailyReminder,
  sendInactivityWarning,
  sendContestReminder,
  sendAchievementEmail,
};
