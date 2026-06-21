import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contestService } from '../services/services';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, CheckCircle, ExternalLink, Users, AlertCircle, PlayCircle, Star, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactConfetti from 'react-confetti';
import dayjs from 'dayjs';

export default function ContestRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('solved'); // solved, wrong
  const [timeLeft, setTimeLeft] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch contest details & problems
  const { data: contestData, isLoading, error } = useQuery({
    queryKey: ['contest', id],
    queryFn: async () => {
      const { data } = await contestService.getById(id);
      return data;
    },
    refetchInterval: 15000, // Refresh every 15 seconds to fetch standings/submissions
  });

  // Fetch contest standings
  const { data: standingsData } = useQuery({
    queryKey: ['contest-standings', id],
    queryFn: async () => {
      const { data } = await contestService.getLeaderboard(id);
      return data.rankings || [];
    },
    refetchInterval: 10000, // Refresh standings every 10 seconds
  });

  const contest = contestData?.contest || {};
  const problems = contestData?.contest?.problems || [];
  const activeProblem = problems[activeProblemIdx];

  // Countdown timer effect
  useEffect(() => {
    if (!contest.startTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(contest.startTime).getTime();
      const end = new Date(contest.endTime).getTime();

      if (now < start) {
        // Upcoming
        const diff = start - now;
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeft(`Starts in ${mins}m ${secs}s`);
      } else if (now >= start && now < end) {
        // Active
        const diff = end - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        // Ended
        setTimeLeft('Contest Ended');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest.startTime, contest.endTime]);

  // Submit solution mutation
  const submitSolutionMutation = useMutation({
    mutationFn: async ({ problemId, status }) => {
      const { data } = await contestService.submit(id, { problemId, status });
      return { problemId, status, data };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(['contest', id]);
      queryClient.invalidateQueries(['contest-standings', id]);
      setShowSubmitModal(false);

      if (res.status === 'solved') {
        toast.success('Congratulations! Problem solved! 🚀');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        toast.error('Wrong answer. Try debugging your solution.');
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to submit. Please try again.');
    },
  });

  const handleSubmitSolution = (e) => {
    e.preventDefault();
    if (!activeProblem) return;
    submitSolutionMutation.mutate({
      problemId: activeProblem._id || activeProblem.id,
      status: submitStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pt-6 animate-pulse">
        <div className="h-12 bg-bg-card rounded-2xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-96 bg-bg-card rounded-2xl" />
          <div className="h-96 bg-bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !contest.title) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-text-primary">Contest Not Found</h2>
        <p className="text-text-muted mt-2">The contest details could not be loaded.</p>
        <button onClick={() => navigate('/contests')} className="btn-primary mt-6 px-6 py-2.5">
          Back to Contests
        </button>
      </div>
    );
  }

  const isUpcoming = new Date() < new Date(contest.startTime);
  const isCompleted = new Date() >= new Date(contest.endTime);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4 pb-12">
      {showConfetti && <ReactConfetti numberOfPieces={150} recycle={false} />}

      {/* Header Panel */}
      <div className="glass-card p-5 md:p-6 bg-bg-secondary/40 border-bg-border/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/15">
            Weekly Contest Room
          </span>
          <h1 className="text-xl md:text-2xl font-display font-bold text-text-primary mt-2">
            {contest.title}
          </h1>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-bg-primary/30 border border-bg-border/40 px-4 py-2.5 rounded-xl text-sm font-semibold">
            <Timer className="w-4.5 h-4.5 text-amber-400" />
            <span className="text-text-primary">{timeLeft}</span>
          </div>

          <button
            onClick={() => navigate('/contests')}
            className="btn-secondary px-4 py-2.5 text-xs font-bold"
          >
            Leave Room
          </button>
        </div>
      </div>

      {isUpcoming ? (
        <div className="text-center py-24 glass-card bg-bg-secondary/15 max-w-2xl mx-auto">
          <PlayCircle className="w-16 h-16 text-brand-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-text-primary">Contest Starts Soon</h2>
          <p className="text-text-secondary text-sm mt-2 leading-relaxed">
            The coding arena will unlock automatically at {dayjs(contest.startTime).format('h:mm A')}. Get ready!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* Main Problem Workspace */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Tabs for contest problems */}
            <div className="flex border-b border-bg-border/60 gap-1.5 pb-2">
              {problems.map((prob, idx) => (
                <button
                  key={prob._id || prob.id}
                  onClick={() => setActiveProblemIdx(idx)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeProblemIdx === idx
                      ? 'bg-bg-hover text-brand-400 border border-bg-border'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Problem {idx + 1}: {prob.title}
                </button>
              ))}
            </div>

            {/* Selected Problem details */}
            {activeProblem ? (
              <div className="glass-card p-6 md:p-8 bg-bg-secondary/40 border-bg-border/60 flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted">Problem {activeProblemIdx + 1}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-yellow-500/20 text-yellow-400 bg-yellow-500/5`}>
                      {activeProblem.difficulty}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-text-primary mt-2">
                    {activeProblem.title}
                  </h2>
                </div>

                <div className="text-sm text-text-secondary leading-relaxed bg-bg-primary/20 border border-bg-border/30 p-4 rounded-xl">
                  <span className="font-semibold text-text-primary block mb-2">Instructions</span>
                  To submit your code, click the LeetCode link below, write and compile your solution on their platform, and then select your outcome here.
                </div>

                <div className="flex justify-between items-center gap-4 pt-4 border-t border-bg-border/30">
                  {activeProblem.leetcodeUrl && (
                    <a
                      href={activeProblem.leetcodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5"
                    >
                      Open on LeetCode <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="btn-primary px-6 py-2.5 text-xs font-extrabold"
                    >
                      Submit Solution
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted">No problems assigned to this contest.</div>
            )}
          </div>

          {/* Standings Sidebar */}
          <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 border-b border-bg-border/40 pb-3 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-text-primary text-sm">Contest Standings</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {standingsData?.length === 0 ? (
                <div className="text-center py-10 text-text-muted text-xs">No standings recorded yet.</div>
              ) : (
                standingsData?.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 text-xs bg-bg-primary/20 border border-bg-border/40 p-2.5 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-text-muted w-4">#{index + 1}</span>
                      <img
                        src={entry.user?.photoURL || 'https://via.placeholder.com/150'}
                        alt={entry.user?.name}
                        className="w-6 h-6 rounded-full object-cover border border-bg-border flex-shrink-0"
                      />
                      <span className="font-semibold text-text-primary truncate">{entry.user?.name}</span>
                    </div>
                    <div className="text-[10px] font-bold text-brand-400 flex-shrink-0">
                      {entry.solvedCount || 0} / 2
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submission Status Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-bg-secondary border border-bg-border p-6 rounded-2xl shadow-xl space-y-5"
          >
            <div>
              <h3 className="font-bold text-text-primary text-base">Select Submission Status</h3>
              <p className="text-text-muted text-xs mt-1">Please select the result shown on Leetcode compiler.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSubmitStatus('solved')}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 text-sm font-semibold transition-all ${
                  submitStatus === 'solved'
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-bg-border hover:bg-bg-hover text-text-secondary'
                }`}
              >
                <CheckCircle className="w-8 h-8" />
                <span>Accepted</span>
              </button>

              <button
                onClick={() => setSubmitStatus('wrong')}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 text-sm font-semibold transition-all ${
                  submitStatus === 'wrong'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-bg-border hover:bg-bg-hover text-text-secondary'
                }`}
              >
                <AlertCircle className="w-8 h-8" />
                <span>Wrong Answer / TLE</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn-secondary px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSolution}
                disabled={submitSolutionMutation.isPending}
                className="btn-primary px-5 py-2 text-xs font-bold"
              >
                {submitSolutionMutation.isPending ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
