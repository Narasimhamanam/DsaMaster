import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contestService } from '../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, Zap, Calendar, ChevronRight, PlayCircle, Star } from 'lucide-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import toast from 'react-hot-toast';
dayjs.extend(duration);

// Countdown Timer Component
const ContestCountdown = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft('00:00:00');
        if (onComplete) onComplete();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  return (
    <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 bg-bg-primary/80 border border-amber-500/20 px-4 py-2 rounded-xl inline-block shadow-glow-sm">
      {timeLeft || '00:00:00'}
    </div>
  );
};

export default function ContestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, active, past

  // Fetch contests list
  const { data: contestsData, isLoading, refetch } = useQuery({
    queryKey: ['contests', activeTab],
    queryFn: async () => {
      const { data } = await contestService.getAll({ status: activeTab });
      return data.contests || [];
    },
  });

  // Mutate registration
  const registerMutation = useMutation({
    mutationFn: async (contestId) => {
      const { data } = await contestService.register(contestId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contests', activeTab]);
      toast.success('Successfully registered for the contest! 🎯');
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to register.');
    },
  });

  const handleRegister = (e, contestId) => {
    e.stopPropagation();
    registerMutation.mutate(contestId);
  };

  const handleJoin = (contestId) => {
    navigate(`/contests/${contestId}`);
  };

  // Find the closest upcoming/active contest to display as main banner
  const featuredContest = contestsData?.[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-4 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2">
          <Zap className="w-8 h-8 text-amber-400 fill-amber-500/10" /> Competitive Arenas
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Weekly contests, company coding challenges, and peer-to-peer coding battles.
        </p>
      </div>

      {/* Featured Banner (Upcoming/Active Contest) */}
      {featuredContest && (activeTab === 'upcoming' || activeTab === 'active') && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-bg-card/90 via-amber-950/15 to-bg-card/90 p-6 md:p-8 shadow-glow-sm"
        >
          {/* Neon side borders */}
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-600" />

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse-slow">
                <Star className="w-3 h-3 fill-current" /> {activeTab === 'active' ? 'Live Now' : 'Featured Battle'}
              </span>
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-text-primary">
                {featuredContest.title}
              </h2>
              <p className="text-text-secondary text-xs md:text-sm max-w-xl">
                {featuredContest.description || 'Test your speed, algorithms, and logical thinking against programmers nationwide. High score boosts your Placement Score.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted pt-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  {dayjs(featuredContest.startTime).format('D MMM YYYY, h:mm A')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-text-muted" />
                  {featuredContest.duration || 90} Mins
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-text-muted" />
                  {featuredContest.participants?.length || 0} Registered
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 flex-shrink-0">
              <div className="text-xs font-semibold text-text-secondary uppercase">
                {activeTab === 'active' ? 'Contest Ends In' : 'Contest Starts In'}
              </div>
              <ContestCountdown
                targetDate={activeTab === 'active' ? featuredContest.endTime : featuredContest.startTime}
                onComplete={() => refetch()}
              />
              <div className="pt-2">
                {activeTab === 'active' ? (
                  <button
                    onClick={() => handleJoin(featuredContest._id || featuredContest.id)}
                    className="btn-primary px-8 py-3 flex items-center gap-2 shadow-glow text-sm font-extrabold pulsing-glow"
                  >
                    <PlayCircle className="w-4.5 h-4.5" /> Enter Contest Room
                  </button>
                ) : featuredContest.isRegistered ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl">
                    ✓ Registered
                  </span>
                ) : (
                  <button
                    onClick={(e) => handleRegister(e, featuredContest._id || featuredContest.id)}
                    disabled={registerMutation.isPending}
                    className="btn-primary px-8 py-3 text-sm font-extrabold"
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs list switch */}
      <div className="flex items-center gap-1.5 border-b border-bg-border/60 pb-3">
        {[
          { id: 'upcoming', label: 'Upcoming Battles' },
          { id: 'active', label: 'Live Arenas' },
          { id: 'past', label: 'Past Contests' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-glow-sm border-b-2 border-brand-400'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse pt-4">
          <div className="h-44 bg-bg-card rounded-xl" />
          <div className="h-44 bg-bg-card rounded-xl" />
        </div>
      ) : contestsData?.length === 0 ? (
        <div className="text-center py-16 glass-card bg-bg-secondary/15">
          <Trophy className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <div className="text-text-secondary font-semibold">No contests available</div>
          <p className="text-text-muted text-xs mt-1">There are no {activeTab} contests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contestsData?.map((contest) => (
            <motion.div
              key={contest._id || contest.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleJoin(contest._id || contest.id)}
              className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 hover:border-brand-500/20 hover:bg-bg-hover cursor-pointer flex flex-col justify-between gap-5 group transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                    {contest.type || 'Weekly Contest'}
                  </span>
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                    activeTab === 'active'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse'
                      : activeTab === 'upcoming'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-text-muted/10 text-text-muted border border-text-muted/20'
                  }`}>
                    {activeTab === 'active' ? 'Live' : activeTab === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary text-base group-hover:text-brand-400 transition-colors mt-3">
                  {contest.title}
                </h3>
                <p className="text-text-muted text-xs mt-1.5 line-clamp-2">
                  {contest.description || 'Participate and test your skills. Solve 2 problems in 90 minutes.'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3 border-t border-bg-border/30 text-xs text-text-muted">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-text-secondary">
                    {dayjs(contest.startTime).format('D MMM YYYY, h:mm A')}
                  </span>
                  <span>Duration: {contest.duration || 90} mins</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {activeTab === 'active' ? (
                    <button className="bg-green-500/10 border border-green-500/20 hover:bg-green-500/25 text-green-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs">
                      Join <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : activeTab === 'upcoming' ? (
                    contest.isRegistered ? (
                      <span className="text-green-400 font-semibold bg-green-500/5 px-2.5 py-1 rounded">Registered</span>
                    ) : (
                      <button
                        onClick={(e) => handleRegister(e, contest._id || contest.id)}
                        className="bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/25 text-brand-400 font-bold px-3 py-1.5 rounded-lg text-xs"
                      >
                        Register
                      </button>
                    )
                  ) : (
                    <button className="bg-bg-hover border border-bg-border hover:text-text-primary text-text-secondary font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs">
                      Results
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
