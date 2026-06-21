import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, Award, Lock, Sparkles, Filter, Check } from 'lucide-react';
import dayjs from 'dayjs';

// Hardcoded achievements matching the server structure
const ACHIEVEMENTS_LIST = [
  { achievementId: 'first_problem', name: 'First Step', description: 'Solved your first problem!', icon: '🎯', category: 'problems', xpReward: 50, rarity: 'common' },
  { achievementId: 'ten_problems', name: 'Getting Started', description: 'Solved 10 problems!', icon: '🔥', category: 'problems', xpReward: 100, rarity: 'common' },
  { achievementId: 'twenty_five_problems', name: 'On a Roll', description: 'Solved 25 problems!', icon: '💪', category: 'problems', xpReward: 150, rarity: 'common' },
  { achievementId: 'fifty_problems', name: 'Dedicated Solver', description: 'Solved 50 problems!', icon: '⭐', category: 'problems', xpReward: 250, rarity: 'rare' },
  { achievementId: 'hundred_problems', name: 'Century Club', description: 'Solved 100 problems!', icon: '💯', category: 'problems', xpReward: 500, rarity: 'rare' },
  { achievementId: 'two_fifty_problems', name: 'Elite Coder', description: 'Solved 250 problems!', icon: '🏅', category: 'problems', xpReward: 1000, rarity: 'epic' },
  { achievementId: 'streak_3', name: 'Habit Builder', description: 'Achieve a 3-day coding streak!', icon: '📅', category: 'streaks', xpReward: 50, rarity: 'common' },
  { achievementId: 'streak_7', name: 'Consistency Master', description: 'Achieve a 7-day coding streak!', icon: '⚡', category: 'streaks', xpReward: 150, rarity: 'rare' },
  { achievementId: 'streak_30', name: 'Unstoppable Force', description: 'Achieve a 30-day coding streak!', icon: '👑', category: 'streaks', xpReward: 800, rarity: 'legendary' },
  { achievementId: 'contest_join', name: 'Gladiator', description: 'Participate in your first contest!', icon: '🛡️', category: 'contests', xpReward: 100, rarity: 'common' },
  { achievementId: 'contest_win', name: 'Champion', description: 'Rank #1 in any weekly contest!', icon: '🏆', category: 'contests', xpReward: 1000, rarity: 'legendary' },
];

const RARITY_STYLES = {
  common: { border: 'border-slate-500/20', bg: 'bg-slate-500/5', text: 'text-slate-400', label: 'Common', glow: '' },
  rare: { border: 'border-blue-500/25', bg: 'bg-blue-500/5', text: 'text-blue-400', label: 'Rare', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
  epic: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-400', label: 'Epic', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]' },
  legendary: { border: 'border-amber-500/40', bg: 'bg-amber-500/5', text: 'text-amber-400', label: 'Legendary', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)] border-amber-500/30 animate-pulse-slow' },
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all'); // all, earned, locked, problems, streaks, contests
  const [activeCategory, setActiveCategory] = useState('all');

  const earnedAchievements = useMemo(() => {
    return user?.achievements || [];
  }, [user]);

  // Compute earned mapping for instant lookup
  const earnedMap = useMemo(() => {
    const map = {};
    earnedAchievements.forEach((ach) => {
      map[ach.achievementId] = ach;
    });
    return map;
  }, [earnedAchievements]);

  // Stats
  const stats = useMemo(() => {
    const totalCount = ACHIEVEMENTS_LIST.length;
    const earnedCount = ACHIEVEMENTS_LIST.filter((a) => !!earnedMap[a.achievementId]).length;
    const totalXp = ACHIEVEMENTS_LIST.reduce((acc, current) => {
      if (earnedMap[current.achievementId]) return acc + current.xpReward;
      return acc;
    }, 0);

    return {
      total: totalCount,
      earned: earnedCount,
      percent: totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0,
      xp: totalXp,
    };
  }, [earnedMap]);

  // Filtering
  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS_LIST.filter((ach) => {
      const isEarned = !!earnedMap[ach.achievementId];

      if (activeFilter === 'earned' && !isEarned) return false;
      if (activeFilter === 'locked' && isEarned) return false;

      if (
        activeFilter !== 'all' &&
        activeFilter !== 'earned' &&
        activeFilter !== 'locked' &&
        ach.category !== activeFilter
      ) {
        return false;
      }

      return true;
    });
  }, [earnedMap, activeFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2">
            <Award className="w-8 h-8 text-brand-400 fill-brand-500/10" /> Achievements & Badges
          </h1>
          <p className="text-text-secondary text-sm">
            Unlock achievements by solving problems, keeping streaks active, and entering contests.
          </p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text-muted uppercase">Badges Unlocked</div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {stats.earned} <span className="text-sm font-semibold text-text-muted">/ {stats.total}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 border border-brand-500/20">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text-muted uppercase">Completion Progress</div>
            <div className="text-2xl font-bold text-text-primary mt-1">{stats.percent}%</div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-bg-hover" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-brand-500" strokeWidth="3" strokeDasharray={`${stats.percent}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-[10px] font-bold text-brand-400">XP</div>
          </div>
        </div>

        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text-muted uppercase">XP Earned from Badges</div>
            <div className="text-2xl font-bold text-brand-400 mt-1">+{stats.xp} XP</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-bg-secondary/20 p-4 rounded-xl border border-bg-border/40">
        <Filter className="w-4 h-4 text-text-muted mr-2" />
        {[
          { id: 'all', label: 'All Badges' },
          { id: 'earned', label: 'Earned' },
          { id: 'locked', label: 'Locked' },
          { id: 'problems', label: 'Problem Solving' },
          { id: 'streaks', label: 'Streaks' },
          { id: 'contests', label: 'Contests' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === f.id
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'bg-bg-hover/60 text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((ach) => {
            const isEarned = !!earnedMap[ach.achievementId];
            const earnedInfo = earnedMap[ach.achievementId];
            const rStyle = RARITY_STYLES[ach.rarity] || RARITY_STYLES.common;
            return (
              <motion.div
                key={ach.achievementId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-5 bg-bg-secondary/40 border flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-200 ${
                  isEarned ? `${rStyle.border} ${rStyle.glow}` : 'border-bg-border/40 opacity-60'
                }`}
              >
                {/* Earned Shimmer Effect */}
                {isEarned && (
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                )}

                {/* Locked overlay icon */}
                {!isEarned && (
                  <div className="absolute top-3 right-3 text-text-muted" title="Locked">
                    <Lock className="w-4 h-4" />
                  </div>
                )}

                {/* Earned Check badge */}
                {isEarned && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400" title="Earned">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="space-y-3 flex flex-col items-center">
                  {/* Large Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 ${
                      isEarned ? 'bg-bg-hover scale-105 filter drop-shadow-md' : 'bg-bg-secondary grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div>
                    <h3 className="font-bold text-text-primary text-sm sm:text-base">
                      {ach.name}
                    </h3>
                    <p className="text-text-muted text-xs mt-1.5 max-w-[180px] leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="w-full mt-5 pt-3 border-t border-bg-border/30 flex justify-between items-center text-xs">
                  <span className={`font-bold capitalize ${rStyle.text}`}>
                    {rStyle.label}
                  </span>
                  {isEarned && earnedInfo?.unlockedAt ? (
                    <span className="text-text-muted text-[10px]">
                      {dayjs(earnedInfo.unlockedAt).format('D MMM YYYY')}
                    </span>
                  ) : (
                    <span className="font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/15">
                      +{ach.xpReward} XP
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
