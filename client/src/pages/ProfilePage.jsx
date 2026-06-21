import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User,
  Link2,
  Target,
  Bell,
  Award,
  Code,
  Github,
  Globe,
  Flame,
  Star,
  Trophy,
} from 'lucide-react';
import dayjs from 'dayjs';

const TABS = [
  { id: 'profile', label: 'Edit Profile', icon: User },
  { id: 'goals', label: 'Study Goals', icon: Target },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'achievements', label: 'My Badges', icon: Award },
];

const ACHIEVEMENTS_LIST = [
  { achievementId: 'first_problem', name: 'First Step', description: 'Solved your first problem!', icon: '🎯', rarity: 'common' },
  { achievementId: 'ten_problems', name: 'Getting Started', description: 'Solved 10 problems!', icon: '🔥', rarity: 'common' },
  { achievementId: 'twenty_five_problems', name: 'On a Roll', description: 'Solved 25 problems!', icon: '💪', rarity: 'common' },
  { achievementId: 'fifty_problems', name: 'Dedicated Solver', description: 'Solved 50 problems!', icon: '⭐', rarity: 'rare' },
  { achievementId: 'hundred_problems', name: 'Century Club', description: 'Solved 100 problems!', icon: '💯', rarity: 'rare' },
  { achievementId: 'two_fifty_problems', name: 'Elite Coder', description: 'Solved 250 problems!', icon: '🏅', rarity: 'epic' },
  { achievementId: 'streak_3', name: 'Habit Builder', description: 'Achieve a 3-day coding streak!', icon: '📅', rarity: 'common' },
  { achievementId: 'streak_7', name: 'Consistency Master', description: 'Achieve a 7-day coding streak!', icon: '⚡', rarity: 'rare' },
  { achievementId: 'streak_30', name: 'Unstoppable Force', description: 'Achieve a 30-day coding streak!', icon: '👑', rarity: 'legendary' },
];

const RARITY_COLORS = {
  common: 'border-slate-500/20 text-slate-400 bg-slate-500/5',
  rare: 'border-blue-500/30 text-blue-400 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
  epic: 'border-purple-500/30 text-purple-400 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
  legendary: 'border-amber-500/40 text-amber-400 bg-amber-500/5 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    photoURL: '',
    college: '',
    branch: '',
    year: '1',
    leetcodeUrl: '',
    gfgUrl: '',
    githubUrl: '',
    bio: '',
  });

  const [goalsForm, setGoalsForm] = useState({
    dailyGoal: 3,
    weeklyGoal: 15,
    monthlyGoal: 50,
  });

  const [notifForm, setNotifForm] = useState({
    emailNotifications: true,
    pushNotifications: true,
  });

  // Populate form states when user context is loaded
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        photoURL: user.photoURL || '',
        college: user.college || '',
        branch: user.branch || '',
        year: user.year?.toString() || '1',
        leetcodeUrl: user.leetcodeUrl || '',
        gfgUrl: user.gfgUrl || '',
        githubUrl: user.githubUrl || '',
        bio: user.bio || '',
      });
      setGoalsForm({
        dailyGoal: user.dailyGoal || 3,
        weeklyGoal: user.weeklyGoal || 15,
        monthlyGoal: user.monthlyGoal || 50,
      });
      setNotifForm({
        emailNotifications: user.emailNotifications !== false,
        pushNotifications: user.pushNotifications !== false,
      });
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await userService.updateProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data.user);
      toast.success('Settings updated successfully! ⚡');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to save settings.');
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      ...profileForm,
      year: parseInt(profileForm.year),
    });
  };

  const handleGoalsSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      dailyGoal: parseInt(goalsForm.dailyGoal),
      weeklyGoal: parseInt(goalsForm.weeklyGoal),
      monthlyGoal: parseInt(goalsForm.monthlyGoal),
    });
  };

  const handleNotifSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(notifForm);
  };

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoalsChange = (e) => {
    setGoalsForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // User earned achievements
  const earnedMap = useMemo(() => {
    const map = {};
    (user?.achievements || []).forEach((ach) => {
      map[ach.achievementId] = ach;
    });
    return map;
  }, [user]);

  const earnedBadges = ACHIEVEMENTS_LIST.filter((a) => !!earnedMap[a.achievementId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-4 pb-12">
      {/* Top Banner Stats Card */}
      <div className="glass-card p-6 md:p-8 bg-bg-secondary/40 border-bg-border/60 relative overflow-hidden rounded-2xl">
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 -z-10" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.photoURL || 'https://via.placeholder.com/150'}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-bg-border object-cover"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-display font-bold text-text-primary">
                  {user?.name}
                </h1>
                <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/15">
                  LVL {user?.level || 1}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {user?.college} • {user?.branch}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5 italic max-w-sm">
                "{user?.bio || 'Coding everyday towards placement readiness!'}"
              </p>
            </div>
          </div>

          {/* Stats quick view */}
          <div className="flex items-center gap-6 flex-wrap pt-2 md:pt-0">
            <div className="text-center bg-bg-primary/30 border border-bg-border/40 p-3 rounded-xl min-w-[80px]">
              <div className="text-text-muted text-[10px] font-semibold uppercase">Solved</div>
              <div className="text-lg font-bold text-text-primary mt-0.5">{user?.totalSolved || 0}</div>
            </div>
            <div className="text-center bg-bg-primary/30 border border-bg-border/40 p-3 rounded-xl min-w-[80px]">
              <div className="text-text-muted text-[10px] font-semibold uppercase">Streak</div>
              <div className="text-lg font-bold text-orange-400 mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-4.5 h-4.5" /> {user?.currentStreak || 0}
              </div>
            </div>
            <div className="text-center bg-bg-primary/30 border border-bg-border/40 p-3 rounded-xl min-w-[80px]">
              <div className="text-text-muted text-[10px] font-semibold uppercase">XP</div>
              <div className="text-lg font-bold text-brand-400 mt-0.5 flex items-center justify-center gap-1">
                <Star className="w-4 h-4" /> {user?.xp || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-1.5 border-b border-bg-border/60 pb-3 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/40'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.form
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleProfileSubmit}
              className="glass-card p-6 md:p-8 bg-bg-secondary/40 border-bg-border/60 space-y-6"
            >
              <h3 className="font-bold text-text-primary text-base pb-3 border-b border-bg-border/30">
                Academic & Contact Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    name="photoURL"
                    value={profileForm.photoURL}
                    onChange={handleProfileChange}
                    className="input w-full text-xs"
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2 flex items-center gap-1">
                    Email Address <span className="text-[10px] text-text-muted lowercase font-normal">(Linked to Google Account)</span>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input w-full opacity-60 cursor-not-allowed bg-bg-secondary/40"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2 flex items-center gap-1">
                    Password <span className="text-[10px] text-text-muted lowercase font-normal">(Managed by Google)</span>
                  </label>
                  <input
                    type="text"
                    value="••••••••••••••••"
                    className="input w-full opacity-60 cursor-not-allowed bg-bg-secondary/40"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    College / University
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={profileForm.college}
                    onChange={handleProfileChange}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Branch / Department
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={profileForm.branch}
                    onChange={handleProfileChange}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Current Year
                  </label>
                  <select
                    name="year"
                    value={profileForm.year}
                    onChange={handleProfileChange}
                    className="input w-full cursor-pointer"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-bg-border/30">
                <h3 className="font-bold text-text-primary text-sm">Coding Portals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-text-muted" /> LeetCode Profile
                    </label>
                    <input
                      type="url"
                      name="leetcodeUrl"
                      value={profileForm.leetcodeUrl}
                      onChange={handleProfileChange}
                      className="input w-full text-xs"
                      placeholder="https://leetcode.com/u/username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-text-muted" /> GeeksforGeeks
                    </label>
                    <input
                      type="url"
                      name="gfgUrl"
                      value={profileForm.gfgUrl}
                      onChange={handleProfileChange}
                      className="input w-full text-xs"
                      placeholder="https://auth.geeksforgeeks.org/user/username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-text-muted" /> GitHub Profile
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={profileForm.githubUrl}
                      onChange={handleProfileChange}
                      className="input w-full text-xs"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  Short Bio
                </label>
                <textarea
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  className="input w-full min-h-[80px] text-sm"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary py-3 px-8 text-xs font-bold"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Settings'}
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'goals' && (
            <motion.form
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleGoalsSubmit}
              className="glass-card p-6 md:p-8 bg-bg-secondary/40 border-bg-border/60 space-y-6"
            >
              <h3 className="font-bold text-text-primary text-base pb-3 border-b border-bg-border/30">
                DSA Roadmap Study Goals
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-text-secondary uppercase mb-2">
                    <span>Daily Goal</span>
                    <span>{goalsForm.dailyGoal} Problems</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="dailyGoal"
                    value={goalsForm.dailyGoal}
                    onChange={handleGoalsChange}
                    className="w-full accent-brand-500 h-1.5 bg-bg-border rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-text-secondary uppercase mb-2">
                    <span>Weekly Goal</span>
                    <span>{goalsForm.weeklyGoal} Problems</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    name="weeklyGoal"
                    value={goalsForm.weeklyGoal}
                    onChange={handleGoalsChange}
                    className="w-full accent-brand-500 h-1.5 bg-bg-border rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-text-secondary uppercase mb-2">
                    <span>Monthly Goal</span>
                    <span>{goalsForm.monthlyGoal} Problems</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    name="monthlyGoal"
                    value={goalsForm.monthlyGoal}
                    onChange={handleGoalsChange}
                    className="w-full accent-brand-500 h-1.5 bg-bg-border rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary py-3 px-8 text-xs font-bold"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Goals'}
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'notifications' && (
            <motion.form
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleNotifSubmit}
              className="glass-card p-6 md:p-8 bg-bg-secondary/40 border-bg-border/60 space-y-6"
            >
              <h3 className="font-bold text-text-primary text-base pb-3 border-b border-bg-border/30">
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-bg-primary/20 border border-bg-border/40 rounded-xl cursor-pointer">
                  <div>
                    <span className="font-semibold text-text-primary text-sm block">Email Alerts</span>
                    <span className="text-text-muted text-xs">Receive daily reminder emails, contest invitations, and warnings.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifForm.emailNotifications}
                    onChange={(e) => setNotifForm((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="w-5 h-5 rounded accent-brand-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-bg-primary/20 border border-bg-border/40 rounded-xl cursor-pointer">
                  <div>
                    <span className="font-semibold text-text-primary text-sm block">Push Notifications</span>
                    <span className="text-text-muted text-xs">Receive real-time contest stand updates, live feed alerts, and achievements.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifForm.pushNotifications}
                    onChange={(e) => setNotifForm((prev) => ({ ...prev, pushNotifications: e.target.checked }))}
                    className="w-5 h-5 rounded accent-brand-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary py-3 px-8 text-xs font-bold"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Notification Preferences'}
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-6 md:p-8 bg-bg-secondary/40 border-bg-border/60 space-y-6"
            >
              <h3 className="font-bold text-text-primary text-base pb-3 border-b border-bg-border/30">
                Unlocked Badges ({earnedBadges.length} earned)
              </h3>

              {earnedBadges.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-xs font-semibold">
                  You haven't unlocked any badges yet. Start solving problems on the Roadmap!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {earnedBadges.map((ach) => {
                    const earnedInfo = earnedMap[ach.achievementId];
                    const diffColors = RARITY_COLORS[ach.rarity] || RARITY_COLORS.common;
                    return (
                      <div
                        key={ach.achievementId}
                        className={`glass-card p-4 border rounded-xl flex flex-col items-center justify-between text-center relative overflow-hidden ${diffColors}`}
                      >
                        <div className="text-2xl mb-1.5">{ach.icon}</div>
                        <h4 className="font-bold text-text-primary text-xs truncate w-full">{ach.name}</h4>
                        <p className="text-[10px] text-text-muted line-clamp-1 mt-0.5">{ach.description}</p>
                        {earnedInfo?.unlockedAt && (
                          <div className="text-[9px] text-text-muted mt-2 border-t border-bg-border/30 pt-1.5 w-full">
                            {dayjs(earnedInfo.unlockedAt).format('D MMM YYYY')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
