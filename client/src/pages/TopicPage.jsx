import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemService } from '../services/services';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ChevronLeft,
  Filter,
  Check,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactConfetti from 'react-confetti';

const TOPIC_COLORS = {
  'arrays-hashing': 'border-blue-500/20 text-blue-400 bg-blue-500/5',
  'two-pointers': 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
  'sliding-window': 'border-purple-500/20 text-purple-400 bg-purple-500/5',
  'stack': 'border-orange-500/20 text-orange-400 bg-orange-500/5',
  'binary-search': 'border-rose-500/20 text-rose-400 bg-rose-500/5',
  'linked-list': 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
  'trees': 'border-green-500/20 text-green-400 bg-green-500/5',
  'tries': 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5',
  'heap-priority-queue': 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5',
  'backtracking': 'border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-500/5',
  'graphs': 'border-violet-500/20 text-violet-400 bg-violet-500/5',
  'advanced-graphs': 'border-red-500/20 text-red-400 bg-red-500/5',
  '1d-dynamic-programming': 'border-sky-500/20 text-sky-400 bg-sky-500/5',
  '1d-dp': 'border-sky-500/20 text-sky-400 bg-sky-500/5',
  '2d-dynamic-programming': 'border-teal-500/20 text-teal-400 bg-teal-500/5',
  '2d-dp': 'border-teal-500/20 text-teal-400 bg-teal-500/5',
  'greedy': 'border-amber-500/20 text-amber-400 bg-amber-500/5',
  'intervals': 'border-pink-500/20 text-pink-400 bg-pink-500/5',
  'math-geometry': 'border-lime-500/20 text-lime-400 bg-lime-500/5',
  'bit-manipulation': 'border-blue-600/20 text-blue-300 bg-blue-600/5',
};

export default function TopicPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState('all'); // all, easy, medium, hard, not_started, attempted, solved
  const [sortBy, setSortBy] = useState('default'); // default, easy_to_hard, hard_to_easy, status
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch problems by topic
  const { data: topicData, isLoading, error } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const { data } = await problemService.getByTopic(topicId);
      return data;
    },
  });

  // Mutate problem status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ problemId, status }) => {
      if (status === 'not_started') {
        const { data } = await problemService.resetProgress(problemId);
        return { problemId, status, response: data };
      } else {
        const { data } = await problemService.updateProgress(problemId, status);
        return { problemId, status, response: data };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['topic', topicId]);
      queryClient.invalidateQueries(['topics']);
      queryClient.invalidateQueries(['dashboard']);
      if (data.status === 'solved') {
        toast.success(`Problem solved! +${data.response.xpEarned || data.response.xpGained || 100} XP ⭐`);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else if (data.status === 'attempted') {
        toast.success('Problem marked as attempted.');
      } else {
        toast.success('Problem progress reset.');
      }
    },
    onError: () => {
      toast.error('Failed to update progress.');
    },
  });

  const handleUpdateStatus = (e, problemId, status) => {
    e.stopPropagation();
    updateStatusMutation.mutate({ problemId, status });
  };

  const problems = useMemo(() => {
    return (topicData?.problems || []).map((p) => ({
      ...p,
      status: p.userProgress?.status || p.status || 'not_started',
    }));
  }, [topicData]);

  const topic = topicData?.topic || {};

  // Stats
  const stats = useMemo(() => {
    if (!problems.length) return { total: 0, solved: 0, attempted: 0, rate: 0 };
    const solved = problems.filter((p) => p.status === 'solved').length;
    const attempted = problems.filter((p) => p.status === 'attempted').length;
    return {
      total: problems.length,
      solved,
      attempted,
      rate: Math.round((solved / problems.length) * 100),
    };
  }, [problems]);

  // Filtering and Sorting
  const processedProblems = useMemo(() => {
    let result = [...problems];

    // Filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'easy' || activeFilter === 'medium' || activeFilter === 'hard') {
        result = result.filter((p) => p.difficulty?.toLowerCase() === activeFilter);
      } else {
        result = result.filter((p) => p.status === activeFilter);
      }
    }

    // Sort
    if (sortBy === 'easy_to_hard') {
      const diffOrder = { easy: 1, medium: 2, hard: 3 };
      result.sort((a, b) => diffOrder[a.difficulty?.toLowerCase()] - diffOrder[b.difficulty?.toLowerCase()]);
    } else if (sortBy === 'hard_to_easy') {
      const diffOrder = { easy: 1, medium: 2, hard: 3 };
      result.sort((a, b) => diffOrder[b.difficulty?.toLowerCase()] - diffOrder[a.difficulty?.toLowerCase()]);
    } else if (sortBy === 'status') {
      const statusOrder = { solved: 1, attempted: 2, not_started: 3 };
      result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }

    return result;
  }, [problems, activeFilter, sortBy]);

  const difficultyColors = {
    easy: 'text-green-400 bg-green-500/10 border-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pt-6">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-bg-card" />
          <div className="h-6 w-32 bg-bg-card rounded-md" />
        </div>
        <div className="glass-card p-6 md:p-8 animate-pulse space-y-4">
          <div className="h-8 w-64 bg-bg-card rounded-lg" />
          <div className="h-4 w-96 bg-bg-card rounded-md" />
          <div className="grid grid-cols-4 gap-4 pt-4">
            <div className="h-20 bg-bg-card rounded-xl" />
            <div className="h-20 bg-bg-card rounded-xl" />
            <div className="h-20 bg-bg-card rounded-xl" />
            <div className="h-20 bg-bg-card rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic.name) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-text-primary">Topic Not Found</h2>
        <p className="text-text-muted mt-2">The topic you are looking for does not exist or failed to load.</p>
        <button onClick={() => navigate('/roadmap')} className="btn-primary mt-6 px-6 py-2.5">
          Back to Roadmap
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {showConfetti && <ReactConfetti numberOfPieces={150} recycle={false} />}

      {/* Back Link */}
      <button
        onClick={() => navigate('/roadmap')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Roadmap
      </button>

      {/* Header Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 md:p-8 border-l-4 relative overflow-hidden`}
        style={{ borderLeftColor: TOPIC_COLORS[topicId] ? '' : '#7c3aed' }}
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{topic.icon || '📦'}</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                  {topic.name}
                </h1>
                <span className="text-xs uppercase font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full mt-1.5 inline-block">
                  {topic.difficulty || 'Beginner'}
                </span>
              </div>
            </div>
            <p className="text-text-secondary text-sm md:text-base mt-4 max-w-2xl leading-relaxed">
              {topic.description || 'Dive deep into guided coding problems designed to build confidence and muscle memory.'}
            </p>
          </div>

          {/* Circle completion score */}
          <div className="flex items-center gap-4 bg-bg-secondary/40 border border-bg-border/60 p-4 rounded-2xl">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-bg-hover"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-brand-500"
                  strokeWidth="3.5"
                  strokeDasharray={`${stats.rate}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${stats.rate}, 100` }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-bold text-text-primary">{stats.rate}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-text-muted uppercase">Completed</div>
              <div className="text-lg font-bold text-text-primary mt-0.5">
                {stats.solved} / {stats.total}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-bg-secondary/20 p-4 rounded-xl border border-bg-border/40">
        {/* Filters tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'easy', label: 'Easy' },
            { id: 'medium', label: 'Medium' },
            { id: 'hard', label: 'Hard' },
            { id: 'not_started', label: 'Not Started' },
            { id: 'attempted', label: 'Attempted' },
            { id: 'solved', label: 'Solved' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                activeFilter === f.id
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'bg-bg-hover/60 text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg-hover/80 text-xs text-text-secondary font-semibold border border-bg-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="default">Default Sort</option>
            <option value="easy_to_hard">Easy to Hard</option>
            <option value="hard_to_easy">Hard to Easy</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Problem list */}
      <div className="space-y-3">
        {processedProblems.length === 0 ? (
          <div className="text-center py-12 glass-card bg-bg-secondary/10">
            <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-3" />
            <div className="text-text-secondary font-medium">No problems found</div>
            <p className="text-text-muted text-xs mt-1">Try tweaking your filter selections.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {processedProblems.map((prob, index) => {
              const diffClass = difficultyColors[prob.difficulty?.toLowerCase()] || '';
              return (
                <motion.div
                  key={prob._id || prob.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                  onClick={() => navigate(`/problem/${prob._id || prob.id}`)}
                  className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-secondary/40 hover:bg-bg-hover border-bg-border/60 hover:border-brand-500/20 cursor-pointer group transition-all duration-200"
                >
                  <div className="flex items-start md:items-center gap-3.5 min-w-0">
                    {/* Status Circle */}
                    <div className="flex-shrink-0 mt-0.5 md:mt-0">
                      {prob.status === 'solved' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 fill-green-500/10" />
                      ) : prob.status === 'attempted' ? (
                        <AlertCircle className="w-5 h-5 text-orange-400 fill-orange-500/10" />
                      ) : (
                        <Circle className="w-5 h-5 text-text-muted hover:text-text-secondary" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-text-primary group-hover:text-brand-400 transition-colors">
                          {prob.title}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${diffClass}`}>
                          {prob.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        {prob.tags?.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-text-muted bg-bg-hover border border-bg-border/80 px-2 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3.5 flex-shrink-0 border-t border-bg-border/40 pt-3 md:border-t-0 md:pt-0">
                    {/* LeetCode link */}
                    {prob.leetcodeUrl && (
                      <a
                        href={prob.leetcodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-text-muted hover:text-text-primary p-2 hover:bg-bg-hover rounded-lg transition-all duration-150"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {/* Quick status actions */}
                    <div className="flex items-center gap-1.5">
                      {prob.status !== 'solved' && (
                        <button
                          onClick={(e) => handleUpdateStatus(e, prob._id || prob.id, 'solved')}
                          className="bg-green-500/10 hover:bg-green-500/25 border border-green-500/20 hover:border-green-500/40 text-green-400 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all duration-150 active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" /> Solved
                        </button>
                      )}
                      {prob.status === 'not_started' && (
                        <button
                          onClick={(e) => handleUpdateStatus(e, prob._id || prob.id, 'attempted')}
                          className="bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all duration-150 active:scale-95"
                        >
                          <Play className="w-3 h-3" /> Attempted
                        </button>
                      )}
                      {prob.status !== 'not_started' && (
                        <button
                          onClick={(e) => handleUpdateStatus(e, prob._id || prob.id, 'not_started')}
                          className="bg-bg-hover hover:bg-red-500/10 border border-bg-border hover:border-red-500/20 text-text-muted hover:text-red-400 font-bold text-xs p-1.5 rounded-lg transition-all duration-150"
                          title="Reset Progress"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
