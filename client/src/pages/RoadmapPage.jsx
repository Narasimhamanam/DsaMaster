import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { problemService } from '../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Lock, ChevronRight, BookOpen, Trophy, Target, Zap, Filter } from 'lucide-react';
import { COMPANY_TRACKS } from '../config/companyTracks';

// ─── Topic emoji + color map ────────────────────────────────────────────────
const TOPIC_META = {
  'arrays-hashing':       { emoji: '📦', color: 'from-blue-500 to-cyan-500',    accent: '#3b82f6' },
  'two-pointers':         { emoji: '👆', color: 'from-emerald-500 to-teal-500', accent: '#10b981' },
  'sliding-window':       { emoji: '🪟', color: 'from-purple-500 to-violet-500',accent: '#8b5cf6' },
  'stack':                { emoji: '📚', color: 'from-orange-500 to-amber-500', accent: '#f97316' },
  'binary-search':        { emoji: '🔍', color: 'from-rose-500 to-pink-500',    accent: '#f43f5e' },
  'linked-list':          { emoji: '🔗', color: 'from-cyan-500 to-sky-500',     accent: '#06b6d4' },
  'trees':                { emoji: '🌳', color: 'from-green-500 to-emerald-500',accent: '#22c55e' },
  'tries':                { emoji: '🌐', color: 'from-indigo-500 to-blue-500',  accent: '#6366f1' },
  'heap-priority-queue':  { emoji: '⚡', color: 'from-yellow-500 to-orange-500',accent: '#eab308' },
  'backtracking':         { emoji: '🔄', color: 'from-fuchsia-500 to-pink-500', accent: '#d946ef' },
  'graphs':               { emoji: '🕸', color: 'from-violet-500 to-purple-600',accent: '#7c3aed' },
  'advanced-graphs':      { emoji: '🗺', color: 'from-red-500 to-rose-600',     accent: '#ef4444' },
  '1d-dynamic-programming': { emoji: '🧮', color: 'from-sky-500 to-blue-600',  accent: '#0ea5e9' },
  '1d-dp':                  { emoji: '🧮', color: 'from-sky-500 to-blue-600',  accent: '#0ea5e9' },
  '2d-dynamic-programming': { emoji: '🎯', color: 'from-teal-500 to-cyan-600', accent: '#14b8a6' },
  '2d-dp':                  { emoji: '🎯', color: 'from-teal-500 to-cyan-600', accent: '#14b8a6' },
  'greedy':               { emoji: '💰', color: 'from-amber-500 to-yellow-600', accent: '#f59e0b' },
  'intervals':            { emoji: '📅', color: 'from-lime-500 to-green-600',   accent: '#84cc16' },
  'math-geometry':        { emoji: '📐', color: 'from-pink-500 to-rose-600',    accent: '#ec4899' },
  'bit-manipulation':     { emoji: '⚙', color: 'from-slate-400 to-gray-500',   accent: '#94a3b8' },
};


const DEFAULT_META = { emoji: '💡', color: 'from-brand-600 to-brand-400', accent: '#7c3aed' };

const DIFFICULTY_CONFIG = {
  Beginner:     { color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  Intermediate: { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  Advanced:     { color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// ─── Skeleton card ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="glass-card p-5 flex flex-col gap-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/3" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-2 skeleton rounded-full" />
      <div className="h-3 skeleton rounded w-1/2" />
    </div>
  </div>
);

// ─── Topic Card ──────────────────────────────────────────────────────────────
const TopicCard = ({ topic, index, onClick }) => {
  const slug = topic.slug || topic._id;
  const meta = TOPIC_META[slug] || DEFAULT_META;
  const diffConfig = DIFFICULTY_CONFIG[topic.difficulty] || DIFFICULTY_CONFIG.Beginner;

  const solved  = topic.stats?.solved ?? topic.userProgress?.solved ?? 0;
  const total   = topic.stats?.total ?? topic.total ?? topic.problemCount ?? 0;
  const pct     = topic.stats?.percentage ?? (total > 0 ? Math.round((solved / total) * 100) : 0);
  const isComplete = pct === 100 && total > 0;
  const isLocked   = topic.isLocked ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={!isLocked ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={() => !isLocked && onClick(slug)}
      className={[
        'relative glass-card overflow-hidden cursor-pointer group transition-all duration-300',
        isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-brand-600/40',
        isComplete ? 'border-green-500/30' : '',
      ].join(' ')}
    >
      {/* Colored left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${meta.color} rounded-l-2xl`} />

      {/* Hover glow overlay */}
      {!isLocked && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle at top left, ${meta.accent}18 0%, transparent 60%)` }}
        />
      )}

      {/* Completion stamp */}
      {isComplete && (
        <div className="absolute top-3 right-3">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 className="w-6 h-6 text-green-400" strokeWidth={2} />
          </motion.div>
        </div>
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-5 h-5 text-text-muted" />
        </div>
      )}

      <div className="p-5 pl-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
            style={{ background: `${meta.accent}18` }}
          >
            {meta.emoji}
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-display font-bold text-text-primary text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200">
              {topic.name}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              {topic.difficulty && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${diffConfig.color}`}>
                  {topic.difficulty}
                </span>
              )}
              {topic.order && (
                <span className="text-xs text-text-muted font-mono">#{topic.order}</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="progress-bar">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: index * 0.04 + 0.3, ease: 'easeOut' }}
              style={isComplete ? { background: 'linear-gradient(90deg, #22c55e, #16a34a)' } : {}}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              <span className="text-text-secondary font-semibold">{solved}</span>/{total} Problems
            </span>
            <span className={`text-xs font-bold tabular-nums ${
              isComplete ? 'text-green-400' : pct > 50 ? 'text-brand-400' : 'text-text-muted'
            }`}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Footer */}
        {!isLocked && (
          <div className="flex items-center justify-between pt-1 border-t border-bg-border/50">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{total} problems</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-brand-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span>Explore</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const RoadmapPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTrack = searchParams.get('track');
  const animateParam = searchParams.get('animate') === 'true';
  const [isAssembling, setIsAssembling] = useState(animateParam);

  useEffect(() => {
    if (animateParam) {
      const timer = setTimeout(() => {
        setIsAssembling(false);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('animate');
        setSearchParams(newParams, { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [animateParam, searchParams, setSearchParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const res = await problemService.getTopics();
      return res.data;
    },
  });

  const trackInfo = useMemo(() => {
    return COMPANY_TRACKS.find(t => t.id === activeTrack) || null;
  }, [activeTrack]);

  const highlightTopics = trackInfo ? trackInfo.topics : null;

  // ── Compute overall stats ────────────────────────────────────────────────
  const overallStats = useMemo(() => {
    if (!data?.topics) return { solved: 0, total: 0, pct: 0, completed: 0, topicCount: 0 };
    const topics    = data.topics;
    const total     = topics.reduce((s, t) => s + (t.stats?.total ?? t.total ?? t.problemCount ?? 0), 0);
    const solved    = topics.reduce((s, t) => s + (t.stats?.solved ?? t.userProgress?.solved ?? 0), 0);
    const pct       = total > 0 ? Math.round((solved / total) * 100) : 0;
    const completed = topics.filter(t => {
      const tot = t.stats?.total ?? t.total ?? t.problemCount ?? 0;
      const solv = t.stats?.solved ?? t.userProgress?.solved ?? 0;
      return tot > 0 && solv === tot;
    }).length;
    return { solved, total, pct, completed, topicCount: topics.length };
  }, [data]);

  // ── Filter + search topics ───────────────────────────────────────────────
  const filteredTopics = useMemo(() => {
    if (!data?.topics) return [];
    let list = data.topics;
    if (highlightTopics && Array.isArray(highlightTopics)) {
      list = list.filter(t => highlightTopics.includes(t.slug));
    }
    return list
      .filter(t => filter === 'All' || t.difficulty === filter)
      .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, filter, searchQuery, highlightTopics]);

  const handleTopicClick = (slug) => navigate(`/roadmap/${slug}`);

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-8 skeleton rounded-xl w-64" />
          <div className="h-4 skeleton rounded w-48" />
        </div>
        <div className="glass-card p-6 space-y-3 animate-pulse">
          <div className="h-4 skeleton rounded w-40" />
          <div className="h-3 skeleton rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-5xl">⚠️</div>
        <p className="text-text-secondary text-lg">Failed to load roadmap</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Assembling Loader Overlay */}
      <AnimatePresence>
        {isAssembling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6 text-center p-6"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: 360 
              }}
              transition={{ 
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "linear" }
              }}
              className="w-24 h-24 rounded-3xl bg-brand-600/10 border border-brand-500/30 flex items-center justify-center text-4xl shadow-glow-md"
            >
              {trackInfo?.initial || '🚀'}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-2"
            >
              <h3 className="text-2xl font-display font-bold text-text-primary tracking-tight">
                Assembling {trackInfo?.name || 'Company'} Prep Track
              </h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                Aggregating recommended DSA problems, mapping topics, and setting up your workspace...
              </p>
            </motion.div>

            <div className="w-56 bg-bg-hover h-2 rounded-full overflow-hidden border border-bg-border/60 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="h-full bg-gradient-brand shadow-glow-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ─── Company Track Banner ─────────────────────────────────────────── */}
      {activeTrack && trackInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-500/10 border border-brand-500/20 px-4 py-3 rounded-xl flex items-center justify-between text-xs text-text-secondary"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-400">Targeted Prep Mode ({trackInfo.name}):</span>
            <span>Showing only topics recommended for your targeted company prep track.</span>
          </div>
          <button
            onClick={() => {
              navigate('/roadmap');
            }}
            className="text-brand-400 hover:text-brand-300 font-bold underline cursor-pointer"
          >
            Show All Topics
          </button>
        </motion.div>
      )}

      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-brand-400" />
            </div>
            <h1 className="text-3xl font-display font-bold gradient-text">DSA Roadmap</h1>
          </div>
          <p className="text-text-secondary text-sm ml-[52px]">
            Complete NeetCode path &nbsp;&middot;&nbsp; {overallStats.topicCount} topics &nbsp;&middot;&nbsp; {overallStats.total} problems
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2.5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-text-primary">{overallStats.completed}</span>
            <span className="text-xs text-text-muted">topics done</span>
          </div>
          <div className="glass-card px-4 py-2.5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-text-primary">{overallStats.solved}</span>
            <span className="text-xs text-text-muted">solved</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Overall Progress Banner ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">Overall Completion</span>
            <span className="text-xs text-text-muted">({overallStats.solved} / {overallStats.total} problems)</span>
          </div>
          <span className="text-2xl font-display font-bold gradient-text">{overallStats.pct}%</span>
        </div>
        <div className="progress-bar h-3">
          <motion.div
            className="progress-bar-fill h-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallStats.pct}%` }}
            transition={{ duration: 1.0, delay: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-text-muted flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            {overallStats.completed} Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-400 inline-block" />
            {(overallStats.topicCount || 0) - (overallStats.completed || 0)} In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-bg-hover border border-bg-border inline-block" />
            {overallStats.total - overallStats.solved} Remaining
          </span>
        </div>
      </motion.div>

      {/* ─── Filters & Search ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap"
      >
        {/* Filter pills */}
        <div className="flex items-center gap-1 p-1 glass-card rounded-xl">
          <Filter className="w-3.5 h-3.5 text-text-muted mx-1.5" />
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filter === f
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {f}
              {data?.topics && (
                <span className="ml-1.5 opacity-60">
                  ({f === 'All'
                    ? data.topics.length
                    : data.topics.filter(t => t.difficulty === f).length
                  })
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-9 py-2 text-xs"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {filteredTopics.length !== (data?.topics?.length ?? 0) && (
          <span className="text-xs text-text-muted">
            Showing {filteredTopics.length} of {data?.topics?.length}
          </span>
        )}
      </motion.div>

      {/* ─── Topic Grid ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filteredTopics.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="text-5xl">🔍</div>
            <p className="text-text-secondary">No topics match your filters</p>
            <button
              onClick={() => { setFilter('All'); setSearchQuery(''); }}
              className="btn-ghost text-brand-400"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredTopics.map((topic, index) => (
              <TopicCard
                key={topic._id || topic.slug}
                topic={topic}
                index={index}
                onClick={handleTopicClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Footer legend ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-6 justify-center pt-2 text-xs text-text-muted"
      >
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-400/60" /> In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-text-muted" /> Locked
        </span>
      </motion.div>
    </div>
  );
};

export default RoadmapPage;
