import { useQuery } from '@tanstack/react-query';
import { userService, revisionService } from '../services/services';
import { motion } from 'framer-motion';
import {
  Flame, Star, Trophy, Target, TrendingUp, BookOpen,
  CheckCircle, Zap, ChevronRight, Map, RefreshCw, CalendarDays,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import dayjs from 'dayjs';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Topic Config ──────────────────────────────────────────────────────────────
const TOPIC_COLORS = [
  '#7c3aed', '#6d28d9', '#8b5cf6', '#a78bfa',
  '#3b82f6', '#2563eb', '#0ea5e9', '#06b6d4',
  '#10b981', '#059669', '#22c55e', '#84cc16',
  '#f59e0b', '#f97316', '#ef4444', '#ec4899',
  '#8b5cf6', '#6366f1',
];

const TOPIC_ICONS = [
  '🔢', '🔗', '📚', '🌲', '📊', '🗺️', '⚡', '🔄',
  '🎯', '🧠', '💡', '🔍', '🏗️', '🌐', '🔀', '📐', '🎲', '🔧',
];

// ─── Greeting Helper ───────────────────────────────────────────────────────────
function getGreeting() {
  const hour = dayjs().hour();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─── Skeleton Components ───────────────────────────────────────────────────────
const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton rounded-2xl ${className}`} />
);

const SkeletonStatGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} className="h-28" />
    ))}
  </div>
);

const SkeletonTopicGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
    {Array.from({ length: 18 }).map((_, i) => (
      <SkeletonCard key={i} className="h-24" />
    ))}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, glowColor }) => (
  <motion.div
    variants={itemVariants}
    className="glass-card-hover p-5 flex flex-col gap-3 cursor-default select-none"
  >
    <div className="flex items-start justify-between">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `${color}20`,
          boxShadow: `0 0 12px ${glowColor || color}30`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      {sub && (
        <span className="text-xs text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">{sub}</span>
      )}
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-text-primary leading-none">{value ?? '—'}</p>
      <p className="text-xs text-text-secondary mt-1 font-medium">{label}</p>
    </div>
  </motion.div>
);

// ─── Progress Bar Row ──────────────────────────────────────────────────────────
const ProgressRow = ({ label, value, max, color = '#7c3aed' }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="text-text-primary font-semibold">
          {value}<span className="text-text-muted font-normal">/{max}</span>
        </span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
      <div className="text-right">
        <span className="text-xs text-text-muted">{pct.toFixed(0)}% complete</span>
      </div>
    </div>
  );
};

// ─── Custom Chart Tooltip ──────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-brand-600/20">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-brand-400 font-semibold">{payload[0]?.value ?? 0} solved</p>
    </div>
  );
};

// ─── Topic Card ────────────────────────────────────────────────────────────────
const TopicCard = ({ topic, index, onClick }) => {
  const solved = topic.solved ?? 0;
  const total = topic.total ?? 1;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const color = TOPIC_COLORS[index % TOPIC_COLORS.length];
  const icon = TOPIC_ICONS[index % TOPIC_ICONS.length];

  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className="glass-card-hover p-4 cursor-pointer group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <p className="text-xs font-semibold text-text-primary leading-tight truncate flex-1">
          {topic.name}
        </p>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>{solved}/{total}</span>
          <span style={{ color }} className="font-semibold">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-bg-hover rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              delay: 0.05 * (index % 6),
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Daily Goal Radial Chart ───────────────────────────────────────────────────
const DailyGoalRadial = ({ solved, goal }) => {
  const pct = goal > 0 ? Math.min(Math.round((solved / goal) * 100), 100) : 0;
  const data = [{ name: 'Goal', value: pct, fill: '#7c3aed' }];

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative">
        <RadialBarChart
          width={120}
          height={120}
          cx={60}
          cy={60}
          innerRadius={40}
          outerRadius={55}
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: '#1a1a32' }}
            dataKey="value"
            cornerRadius={5}
            fill="#7c3aed"
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-display font-black text-text-primary">{solved}</span>
          <span className="text-[10px] text-text-muted">/{goal}</span>
        </div>
      </div>
      <p className="text-xs text-text-secondary font-medium">Daily Goal</p>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
          background: pct >= 100 ? '#22c55e20' : '#7c3aed20',
          color: pct >= 100 ? '#22c55e' : '#a78bfa',
        }}
      >
        {pct}%
      </span>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data fetching
  const {
    data: dashData,
    isLoading: dashLoading,
    isError: dashError,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => userService.getDashboard().then((r) => r.data),
    retry: 2,
  });

  const { data: revisionsData } = useQuery({
    queryKey: ['revisions-today'],
    queryFn: () => revisionService.getToday().then((r) => r.data),
  });

  // Derived values with safe fallbacks
  const stats = dashData?.stats ?? {};
  const topics = dashData?.topicProgress ?? [];
  const weeklyData = dashData?.weeklyChart ?? [];
  const heatmapData = dashData?.heatmap ?? [];
  const progress = dashData?.progress ?? {};

  const streak = stats.streak ?? user?.streak ?? 0;
  const totalSolved = stats.totalSolved ?? user?.totalSolved ?? 0;
  const todaySolved = stats.todaySolved ?? 0;
  const dailyGoal = stats.dailyGoal ?? user?.dailyGoal ?? 5;
  const totalXP = stats.totalXP ?? user?.xp ?? 0;
  const rank = stats.rank ?? '—';
  const placementScore = stats.placementScore ?? 0;

  const weeklyGoal = progress.weeklyGoal ?? 25;
  const weeklySolved = progress.weeklySolved ?? 0;
  const monthlyGoal = progress.monthlyGoal ?? 100;
  const monthlySolved = progress.monthlySolved ?? 0;
  const roadmapSolved = progress.roadmapSolved ?? 0;
  const roadmapTotal = progress.roadmapTotal ?? 450;

  const revisionsDue = revisionsData?.count ?? revisionsData?.revisions?.length ?? 0;

  // Heatmap date range (last 6 months)
  const heatmapEnd = dayjs().toDate();
  const heatmapStart = dayjs().subtract(6, 'month').toDate();

  // Weekly chart data with fallback
  const chartData =
    weeklyData.length > 0
      ? weeklyData
      : Array.from({ length: 7 }, (_, i) => ({
          day: dayjs().subtract(6 - i, 'day').format('ddd'),
          solved: 0,
        }));

  // ── Loading State ────────────────────────────────────────────────────────────
  if (dashLoading) {
    return (
      <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
        <SkeletonCard className="h-36" />
        <SkeletonStatGrid />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="h-72 lg:col-span-2" />
          <SkeletonCard className="h-72" />
        </div>
        <SkeletonCard className="h-8 w-48" />
        <SkeletonTopicGrid />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────────
  if (dashError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <Zap className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-text-secondary text-lg">Failed to load dashboard</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="p-4 md:p-6 space-y-8 max-w-screen-xl mx-auto pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* 1. Welcome Hero */}
      <motion.div variants={fadeUp}>
        <div
          className="relative overflow-hidden rounded-2xl p-6 md:p-8"
          style={{
            background: 'linear-gradient(135deg, #15152a 0%, #1a1040 50%, #0d0d1a 100%)',
            border: '1px solid #7c3aed30',
            boxShadow: '0 0 60px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Decorative orbs */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
              transform: 'translate(-30%, 30%)',
            }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Avatar + greeting */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img
                  src={
                    user?.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || 'User'
                    )}&background=7c3aed&color=fff&size=80`
                  }
                  alt={user?.name}
                  className="w-14 h-14 rounded-2xl ring-2 ring-brand-600/40 shadow-glow-sm object-cover"
                />
                {streak > 0 && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                    <Flame className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-text-muted text-sm font-medium">{getGreeting()},</p>
                <h1 className="text-2xl md:text-3xl font-display font-black text-text-primary leading-tight">
                  {user?.name?.split(' ')[0] ?? 'Student'}
                  <span className="ml-2">👋</span>
                </h1>
                <p className="text-text-secondary text-sm mt-0.5">
                  {dayjs().format('dddd, MMMM D, YYYY')}
                  <span className="mx-1.5 text-text-muted">·</span>
                  <span className="text-brand-400 font-medium">
                    {user?.title || 'Beginner'} · Level {user?.level ?? 1}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick stat pills */}
            <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-300">{streak} day streak</span>
              </div>
              <div className="flex items-center gap-1.5 bg-brand-600/10 border border-brand-600/20 rounded-full px-3 py-1.5">
                <Star className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-bold text-brand-300">{totalXP.toLocaleString()} XP</span>
              </div>
              {todaySolved > 0 && (
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-green-300">{todaySolved} solved today</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Stats Row — 6 cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${streak} 🔥`}
          sub="days"
          color="#f97316"
          glowColor="#f97316"
        />
        <StatCard
          icon={CheckCircle}
          label="Total Solved"
          value={totalSolved}
          sub={`of ${roadmapTotal}`}
          color="#22c55e"
        />
        <StatCard
          icon={Target}
          label="Today's Progress"
          value={`${todaySolved}/${dailyGoal}`}
          sub={todaySolved >= dailyGoal ? '✅ Done!' : 'daily goal'}
          color="#7c3aed"
        />
        <StatCard
          icon={Star}
          label="Total XP"
          value={totalXP.toLocaleString()}
          sub="points"
          color="#a78bfa"
          glowColor="#7c3aed"
        />
        <StatCard
          icon={Trophy}
          label="Current Rank"
          value={typeof rank === 'number' ? `#${rank}` : rank}
          sub="global"
          color="#f59e0b"
        />
        <StatCard
          icon={TrendingUp}
          label="Placement Score"
          value={`${placementScore}%`}
          sub="readiness"
          color="#3b82f6"
        />
      </motion.div>

      {/* 3. Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly chart + progress bars */}
        <motion.div variants={fadeUp} className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Weekly Activity</h2>
              <p className="section-subtitle">Problems solved over last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted bg-bg-hover px-3 py-1.5 rounded-full">
              <CalendarDays className="w-3.5 h-3.5" />
              7 days
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e38" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7c3aed40', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="solved"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={{ fill: '#7c3aed', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: '#a78bfa', strokeWidth: 0, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-5 space-y-5 border-t border-bg-border pt-5">
            <ProgressRow
              label="Weekly Goal"
              value={weeklySolved}
              max={weeklyGoal}
              color="#7c3aed"
            />
            <ProgressRow
              label="Monthly Goal"
              value={monthlySolved}
              max={monthlyGoal}
              color="#8b5cf6"
            />
            <ProgressRow
              label="Roadmap Completion"
              value={roadmapSolved}
              max={roadmapTotal}
              color="#a78bfa"
            />
          </div>
        </motion.div>

        {/* Right column: Daily goal radial + revisions */}
        <motion.div variants={fadeUp} className="flex flex-col gap-4">
          {/* Daily Goal */}
          <div className="glass-card p-6 flex flex-col items-center justify-center gap-4 flex-1">
            <DailyGoalRadial solved={todaySolved} goal={dailyGoal} />
            <div className="w-full border-t border-bg-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Streak</span>
                <span className="font-semibold text-orange-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> {streak}d
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Rank</span>
                <span className="font-semibold text-yellow-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> #{rank}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Total XP</span>
                <span className="font-semibold text-brand-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" /> {totalXP.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Revisions Due */}
          <div
            className="glass-card p-5"
            style={{
              borderColor: revisionsDue > 0 ? '#f59e0b30' : undefined,
              boxShadow:
                revisionsDue > 0
                  ? '0 0 20px rgba(245,158,11,0.08)'
                  : undefined,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm">Revisions Due</p>
                <p className="text-text-muted text-xs mt-0.5">
                  {revisionsDue > 0
                    ? `${revisionsDue} problem${revisionsDue !== 1 ? 's' : ''} need review`
                    : 'All caught up! 🎉'}
                </p>
              </div>
              {revisionsDue > 0 && (
                <span className="text-2xl font-display font-black text-amber-400">{revisionsDue}</span>
              )}
            </div>
            {revisionsDue > 0 && (
              <button
                onClick={() => navigate('/revisions')}
                className="btn-primary w-full mt-4 justify-center text-xs py-2"
                style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}
              >
                <BookOpen className="w-3.5 h-3.5" /> Go to Revisions
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* 4. Topic Progress Grid */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Topic Progress</h2>
            <p className="section-subtitle">
              {topics.length > 0 ? `${topics.length} topics across the roadmap` : 'Start solving to track progress'}
            </p>
          </div>
          <button
            onClick={() => navigate('/roadmap')}
            className="btn-ghost text-xs"
          >
            View Roadmap <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {topics.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
            <Map className="w-12 h-12 text-text-muted opacity-30" />
            <p className="text-text-secondary font-medium">No topic data yet</p>
            <p className="text-text-muted text-sm">Start solving problems to track your progress</p>
            <button
              onClick={() => navigate('/roadmap')}
              className="btn-primary mt-2"
            >
              Start Roadmap <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"
          >
            {topics.map((topic, idx) => (
              <TopicCard
                key={topic.slug ?? topic._id ?? idx}
                topic={topic}
                index={idx}
                onClick={() => navigate(`/roadmap/${topic.slug}`)}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* 5. Contribution Heatmap */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="section-title">Contribution Heatmap</h2>
            <p className="section-subtitle">Your solving activity over the last 6 months</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Less</span>
            {['#1a1a32', '#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6'].map((c, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ background: c }}
              />
            ))}
            <span className="text-xs text-text-muted">More</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={heatmapStart}
            endDate={heatmapEnd}
            values={heatmapData}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty';
              if (value.count <= 1) return 'color-scale-1';
              if (value.count <= 3) return 'color-scale-2';
              if (value.count <= 5) return 'color-scale-3';
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value) => ({
              'data-tip': value?.date
                ? `${value.date}: ${value.count ?? 0} solved`
                : 'No activity',
            })}
            showWeekdayLabels
            gutterSize={3}
          />
        </div>
      </motion.div>

      {/* 6. Quick Actions */}
      <motion.div variants={fadeUp}>
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Continue Roadmap */}
          <motion.button
            onClick={() => navigate('/roadmap')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-5 text-left group border border-transparent hover:border-brand-600/30 transition-all duration-300 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-600/15 flex items-center justify-center mb-3 group-hover:bg-brand-600/25 transition-colors duration-200">
              <Map className="w-5 h-5 text-brand-400" />
            </div>
            <p className="font-semibold text-text-primary text-sm">Continue Roadmap</p>
            <p className="text-xs text-text-muted mt-1">Pick up where you left off</p>
            <div className="flex items-center gap-1 mt-4 text-xs text-brand-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Open Roadmap <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* Join Contest */}
          <motion.button
            onClick={() => navigate('/contests')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-5 text-left group border border-transparent hover:border-yellow-500/30 transition-all duration-300 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3 group-hover:bg-yellow-500/20 transition-colors duration-200">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="font-semibold text-text-primary text-sm">Join Contest</p>
            <p className="text-xs text-text-muted mt-1">Compete and earn bonus XP</p>
            <div className="flex items-center gap-1 mt-4 text-xs text-yellow-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              View Contests <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>

          {/* View Leaderboard */}
          <motion.button
            onClick={() => navigate('/leaderboard')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card p-5 text-left group border border-transparent hover:border-green-500/30 transition-all duration-300 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center mb-3 group-hover:bg-green-500/20 transition-colors duration-200">
              <Trophy className="w-5 h-5 text-green-400" />
            </div>
            <p className="font-semibold text-text-primary text-sm">View Leaderboard</p>
            <p className="text-xs text-text-muted mt-1">See where you stand globally</p>
            <div className="flex items-center gap-1 mt-4 text-xs text-green-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Open Leaderboard <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Bottom padding */}
      <div className="h-4" />
    </motion.div>
  );
}
