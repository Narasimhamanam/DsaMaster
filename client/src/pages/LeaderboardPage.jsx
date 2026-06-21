import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Flame, Star, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'daily', label: 'Daily', fetcher: () => leaderboardService.getDaily() },
  { id: 'weekly', label: 'Weekly', fetcher: () => leaderboardService.getWeekly() },
  { id: 'monthly', label: 'Monthly', fetcher: () => leaderboardService.getMonthly() },
  { id: 'alltime', label: 'All Time', fetcher: () => leaderboardService.getAllTime() },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('weekly');
  const [searchCollege, setSearchCollege] = useState('');

  // Fetch leaderboard data based on tab
  const { data: leaderboardData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['leaderboard', activeTab],
    queryFn: async () => {
      const activeFetcher = TABS.find((t) => t.id === activeTab).fetcher;
      const { data } = await activeFetcher();
      return data.rankings || [];
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const filteredLeaderboard = (leaderboardData || []).filter((entry) => {
    if (!searchCollege.trim()) return true;
    return entry.user?.college?.toLowerCase().includes(searchCollege.toLowerCase());
  });

  // Podium (Top 3)
  const podium = [
    filteredLeaderboard[1], // 2nd place
    filteredLeaderboard[0], // 1st place
    filteredLeaderboard[2], // 3rd place
  ];

  // List (Rank 4 onwards)
  const listEntries = filteredLeaderboard.slice(3);

  // Check if current user is in leaderboard, if not, we can show a placeholder or find them
  const currentUserRank = (leaderboardData || []).findIndex(
    (entry) => entry.user?.uid === user?.uid || entry.user?._id === user?._id
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" /> Leaderboard
          </h1>
          <p className="text-text-secondary text-sm">
            Compete with peers and see who is dominating the DSA roadmaps.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-bg-hover hover:bg-bg-hover/80 border border-bg-border text-text-secondary transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-bg-secondary/20 p-4 rounded-xl border border-bg-border/40">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'bg-bg-hover/60 text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchCollege}
            onChange={(e) => setSearchCollege(e.target.value)}
            placeholder="Search by College..."
            className="input w-full pl-10 text-xs py-2"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse pt-8">
          <div className="h-64 bg-bg-card rounded-2xl w-full" />
          <div className="h-48 bg-bg-card rounded-2xl w-full" />
        </div>
      ) : (
        <>
          {/* Podium section */}
          {filteredLeaderboard.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end justify-center pt-8 pb-4 max-w-3xl mx-auto">
              {/* 2nd Place */}
              {podium[0] ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-400 overflow-hidden shadow-lg bg-bg-card">
                      <img
                        src={podium[0].user?.photoURL || 'https://via.placeholder.com/150'}
                        alt={podium[0].user?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center border-2 border-bg-primary text-[10px] font-bold text-bg-primary">
                      2
                    </div>
                  </div>
                  <div className="text-center w-full max-w-[120px]">
                    <div className="text-xs font-bold text-text-primary truncate">{podium[0].user?.name}</div>
                    <div className="text-[10px] text-text-muted truncate mt-0.5">{podium[0].user?.college}</div>
                    <div className="text-xs font-semibold text-slate-300 mt-1 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-slate-400" /> {podium[0].xp || 0} XP
                    </div>
                  </div>
                  <div className="w-full bg-slate-400/10 border border-slate-400/20 h-24 sm:h-28 rounded-t-2xl mt-4 flex items-center justify-center text-slate-400 text-sm font-bold shadow-inner">
                    Podium
                  </div>
                </motion.div>
              ) : (
                <div />
              )}

              {/* 1st Place */}
              {podium[1] ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center z-10"
                >
                  <div className="relative mb-3">
                    <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2 drop-shadow-md animate-bounce" />
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 overflow-hidden shadow-glow bg-bg-card">
                      <img
                        src={podium[1].user?.photoURL || 'https://via.placeholder.com/150'}
                        alt={podium[1].user?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-bg-primary text-[10px] font-bold text-bg-primary">
                      1
                    </div>
                  </div>
                  <div className="text-center w-full max-w-[130px]">
                    <div className="text-sm font-extrabold text-text-primary truncate">{podium[1].user?.name}</div>
                    <div className="text-[10px] text-text-muted truncate mt-0.5">{podium[1].user?.college}</div>
                    <div className="text-xs font-bold text-yellow-400 mt-1 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" /> {podium[1].xp || 0} XP
                    </div>
                  </div>
                  <div className="w-full bg-yellow-400/10 border border-yellow-400/20 h-32 sm:h-36 rounded-t-2xl mt-4 flex items-center justify-center text-yellow-400 text-base font-bold shadow-inner">
                    Winner
                  </div>
                </motion.div>
              ) : (
                <div />
              )}

              {/* 3rd Place */}
              {podium[2] ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-600 overflow-hidden shadow-lg bg-bg-card">
                      <img
                        src={podium[2].user?.photoURL || 'https://via.placeholder.com/150'}
                        alt={podium[2].user?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center border-2 border-bg-primary text-[10px] font-bold text-bg-primary">
                      3
                    </div>
                  </div>
                  <div className="text-center w-full max-w-[120px]">
                    <div className="text-xs font-bold text-text-primary truncate">{podium[2].user?.name}</div>
                    <div className="text-[10px] text-text-muted truncate mt-0.5">{podium[2].user?.college}</div>
                    <div className="text-xs font-semibold text-amber-500 mt-1 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-amber-600" /> {podium[2].xp || 0} XP
                    </div>
                  </div>
                  <div className="w-full bg-amber-600/10 border border-amber-600/20 h-20 sm:h-24 rounded-t-2xl mt-4 flex items-center justify-center text-amber-600 text-sm font-bold shadow-inner">
                    Podium
                  </div>
                </motion.div>
              ) : (
                <div />
              )}
            </div>
          )}

          {/* Leaderboard Table List */}
          <div className="glass-card bg-bg-secondary/40 border-bg-border/60 overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-bg-border/60 text-xs font-semibold text-text-muted bg-bg-secondary/20">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4">User Details</th>
                    <th className="p-4 text-center">Solved</th>
                    <th className="p-4 text-center">Streak</th>
                    <th className="p-4 text-center">Level</th>
                    <th className="p-4 text-right">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-text-muted text-sm font-medium">
                        No students found on the leaderboard.
                      </td>
                    </tr>
                  ) : (
                    listEntries.map((entry, index) => {
                      const actualRank = index + 4;
                      const isCurrentUser = entry.user?.uid === user?.uid || entry.user?._id === user?._id;
                      return (
                        <tr
                          key={entry._id || index}
                          className={`border-b border-bg-border/30 hover:bg-bg-hover/30 transition-colors ${
                            isCurrentUser ? 'bg-brand-500/10 border-l-4 border-l-brand-500' : ''
                          }`}
                        >
                          <td className="p-4 text-center font-semibold text-text-secondary text-sm">
                            #{actualRank}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={entry.user?.photoURL || 'https://via.placeholder.com/150'}
                                alt={entry.user?.name}
                                className="w-8 h-8 rounded-full border border-bg-border flex-shrink-0 object-cover"
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-text-primary truncate">
                                  {entry.user?.name} {isCurrentUser && <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded ml-1.5 font-bold">YOU</span>}
                                </div>
                                <div className="text-[11px] text-text-muted truncate mt-0.5">
                                  {entry.user?.college} • {entry.user?.branch}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold text-text-secondary text-sm">
                            {entry.user?.totalSolved || entry.solvedCount || 0}
                          </td>
                          <td className="p-4 text-center font-bold text-orange-400 text-sm">
                            <span className="inline-flex items-center gap-1">
                              <Flame className="w-4 h-4" /> {entry.user?.currentStreak || entry.streak || 0}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-brand-400 text-xs">
                            LVL {entry.user?.level || entry.level || 1}
                          </td>
                          <td className="p-4 text-right font-extrabold text-brand-300 text-sm">
                            {entry.xp || 0} XP
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky user rank summary if not in top list */}
          {currentUserRank > 100 && (
            <div className="bg-brand-600/10 border border-brand-500/30 p-4 rounded-xl flex items-center justify-between text-sm shadow-glow-sm">
              <div className="flex items-center gap-3">
                <Medal className="w-5 h-5 text-brand-400" />
                <div>
                  <span className="font-semibold text-text-primary">Your Standing</span>
                  <p className="text-text-muted text-xs mt-0.5">You are currently ranked #{currentUserRank + 1} on the board.</p>
                </div>
              </div>
              <div className="font-extrabold text-brand-400 text-base">Rank #{currentUserRank + 1}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
