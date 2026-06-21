import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { revisionService } from '../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CheckCircle, XCircle, Clock, Brain, TrendingUp,
  Calendar, Repeat, AlertCircle, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Circular Gauge ─────────────────────────────────────────────── */
const RetentionGauge = ({ score = 0 }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#f59e0b';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };

  const color = getColor(clampedScore);

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#1a1a32" strokeWidth="10" />
        <motion.circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        <motion.span
          className="text-3xl font-display font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{ color }}
        >
          {clampedScore}%
        </motion.span>
        <span className="text-xs text-text-muted font-medium">Retention</span>
      </div>
    </div>
  );
};

/* ─── Skeleton Loader ────────────────────────────────────────────── */
const RevisionSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="glass-card p-5 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-48 rounded-lg" />
            <div className="flex gap-2">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-9 w-28 rounded-xl" />
            <div className="skeleton h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ─── Difficulty Badge ───────────────────────────────────────────── */
const DifficultyBadge = ({ difficulty }) => {
  const map = { Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' };
  return <span className={map[difficulty] ?? 'badge-easy'}>{difficulty}</span>;
};

/* ─── Single Revision Card ───────────────────────────────────────── */
const RevisionCard = ({ revision, onComplete, isCompleting }) => {
  const dueDate = new Date(revision.dueDate ?? revision.nextRevision);
  const isOverdue = dueDate < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, scale: 0.92 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="glass-card p-5 border-l-4"
      style={{ borderLeftColor: isOverdue ? '#ef4444' : '#7c3aed' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="font-semibold text-text-primary truncate">
              {revision.problem?.title ?? revision.title}
            </h3>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-xs text-red-400 font-medium">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DifficultyBadge difficulty={revision.problem?.difficulty ?? revision.difficulty} />
            {(revision.problem?.topic?.name ?? revision.topic) && (
              <span className="text-xs text-text-muted bg-bg-hover px-2.5 py-0.5 rounded-full border border-bg-border">
                {revision.problem?.topic?.name ?? revision.topic}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar className="w-3 h-3" />
              Due {isOverdue ? 'overdue' : dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
            {revision.interval && (
              <span className="flex items-center gap-1 text-xs text-brand-400">
                <Repeat className="w-3 h-3" />
                {revision.interval}d interval
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onComplete(revision._id, true)}
            disabled={isCompleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                       bg-green-500/15 text-green-400 border border-green-500/25
                       hover:bg-green-500/25 hover:border-green-500/50
                       active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Remembered
          </button>
          <button
            onClick={() => onComplete(revision._id, false)}
            disabled={isCompleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                       bg-red-500/15 text-red-400 border border-red-500/25
                       hover:bg-red-500/25 hover:border-red-500/50
                       active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Forgot
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Spaced Repetition Info Card ────────────────────────────────── */
const SpacedRepetitionInfo = () => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-4">
      <Brain className="w-5 h-5 text-brand-400" />
      <h3 className="font-semibold text-text-primary">How Spaced Repetition Works</h3>
    </div>
    <p className="text-sm text-text-secondary mb-5 leading-relaxed">
      Problems resurface at increasing intervals based on your recall. The better you remember,
      the longer before you see it again — maximizing long-term retention with minimal effort.
    </p>
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {[
        { label: 'Day 1', sublabel: 'First solve', color: '#7c3aed', icon: '1' },
        { label: '7 days', sublabel: 'First review', color: '#7c3aed', icon: '2' },
        { label: '30 days', sublabel: 'Second review', color: '#8b5cf6', icon: '3' },
        { label: '90 days', sublabel: 'Third review', color: '#a78bfa', icon: '4' },
        { label: '∞', sublabel: 'Mastered!', color: '#22c55e', icon: '✓' },
      ].map((step, i, arr) => (
        <div key={i} className="flex items-center flex-shrink-0">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2"
              style={{ borderColor: step.color, backgroundColor: `${step.color}22`, color: step.color }}
            >
              {step.icon}
            </div>
            <span className="text-xs font-semibold text-text-primary whitespace-nowrap">{step.label}</span>
            <span className="text-xs text-text-muted whitespace-nowrap">{step.sublabel}</span>
          </div>
          {i < arr.length - 1 && (
            <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-brand-600/60 to-brand-600/20 mx-1 mb-6" />
          )}
        </div>
      ))}
    </div>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────────────── */
const RevisionsPage = () => {
  const queryClient = useQueryClient();
  const [completedIds, setCompletedIds] = useState(new Set());

  const { data: todayData, isLoading: loadingToday } = useQuery({
    queryKey: ['revisions', 'today'],
    queryFn: () => revisionService.getToday().then((r) => r.data),
  });

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['revisions', 'stats'],
    queryFn: () => revisionService.getStats().then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, success }) => revisionService.complete(id, success),
    onSuccess: (_, { success }) => {
      toast.success(
        success ? '🧠 Great recall! Next review scheduled.' : '📅 No worries! Rescheduled sooner.',
        { style: { background: '#15152a', color: '#f1f5f9', border: '1px solid #1e1e38' } }
      );
      queryClient.invalidateQueries({ queryKey: ['revisions', 'stats'] });
    },
    onError: () => toast.error('Something went wrong. Try again.'),
  });

  const handleComplete = (id, success) => {
    setCompletedIds((prev) => new Set([...prev, id]));
    completeMutation.mutate({ id, success });
  };

  const allRevisions = todayData?.revisions ?? [];
  const visibleRevisions = allRevisions.filter((r) => !completedIds.has(r._id));
  const stats = statsData ?? {};
  const retentionScore = stats.retentionScore ?? 0;

  const statCards = [
    { icon: <BookOpen className="w-5 h-5" />, label: 'Total Revisions', value: stats.total ?? 0, color: 'text-brand-400', bg: 'bg-brand-600/10' },
    { icon: <CheckCircle className="w-5 h-5" />, label: 'Completed', value: stats.completed ?? 0, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: <Clock className="w-5 h-5" />, label: 'Overdue', value: stats.overdue ?? 0, color: 'text-red-400', bg: 'bg-red-500/10' },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Retention Score',
      value: `${retentionScore}%`,
      color: retentionScore >= 80 ? 'text-green-400' : retentionScore >= 60 ? 'text-yellow-400' : 'text-red-400',
      bg: 'bg-bg-hover',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <Brain className="w-7 h-7 text-brand-400" />
            Smart Revisions
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Reinforce your memory with spaced repetition practice
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-card border border-bg-border px-3 py-1.5 rounded-xl">
          <Repeat className="w-4 h-4 text-brand-400" />
          7d → 30d → 90d schedule
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="stat-card"
          >
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
            {loadingStats ? (
              <div className="skeleton h-8 w-16 rounded-lg" />
            ) : (
              <span className={`stat-value ${card.color}`}>{card.value}</span>
            )}
            <span className="stat-label">{card.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Revisions */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-2">
            <h2 className="section-title flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              Today&apos;s Revisions
              {visibleRevisions.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-600/20 text-brand-400 border border-brand-600/30">
                  {visibleRevisions.length}
                </span>
              )}
            </h2>
          </motion.div>

          {loadingToday ? (
            <RevisionSkeleton />
          ) : (
            <AnimatePresence mode="popLayout">
              {visibleRevisions.length > 0 ? (
                visibleRevisions.map((revision) => (
                  <RevisionCard
                    key={revision._id}
                    revision={revision}
                    onComplete={handleComplete}
                    isCompleting={completeMutation.isPending}
                  />
                ))
              ) : (
                <motion.div
                  key="all-done"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-12 flex flex-col items-center justify-center text-center gap-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="text-5xl"
                  >
                    🎉
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-text-primary mb-1">All caught up!</h3>
                    <p className="text-text-secondary text-sm">No revisions due today. Your memory is fresh!</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                    Come back tomorrow for the next batch
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Right: Gauge + Tip */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2 self-start">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <span className="font-semibold text-text-primary text-sm">Retention Score</span>
            </div>
            {loadingStats ? (
              <div className="skeleton w-40 h-40 rounded-full" />
            ) : (
              <RetentionGauge score={retentionScore} />
            )}
            <div className="w-full space-y-2">
              {[
                { label: 'Excellent', range: '80–100%', color: '#22c55e' },
                { label: 'Good', range: '60–79%', color: '#f59e0b' },
                { label: 'Needs Work', range: '0–59%', color: '#ef4444' },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="text-text-secondary">{tier.label}</span>
                  </div>
                  <span className="text-text-muted">{tier.range}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary mb-1">Pro tip</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Be honest with yourself. Marking "Forgot" helps the algorithm
                  reschedule the problem sooner for better retention.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Spaced Repetition Explanation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <SpacedRepetitionInfo />
      </motion.div>
    </div>
  );
};

export default RevisionsPage;
