// Utility functions for DSAMASTER

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return { text: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/20' };
    case 'medium': return { text: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/20' };
    case 'hard': return { text: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20' };
    default: return { text: 'text-text-muted', bg: 'bg-bg-hover', border: 'border-bg-border' };
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'solved': return { color: '#22c55e', label: 'Solved' };
    case 'attempted': return { color: '#f59e0b', label: 'Attempted' };
    default: return { color: '#64748b', label: 'Not Started' };
  }
};

export const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common': return { text: 'text-slate-400', glow: '' };
    case 'rare': return { text: 'text-blue-400', glow: 'shadow-blue-500/30' };
    case 'epic': return { text: 'text-purple-400', glow: 'shadow-purple-500/30' };
    case 'legendary': return { text: 'text-yellow-400', glow: 'shadow-yellow-500/40' };
    default: return { text: 'text-slate-400', glow: '' };
  }
};

export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getReadinessColor = (score) => {
  if (score >= 90) return '#f59e0b'; // gold
  if (score >= 75) return '#22c55e'; // green
  if (score >= 55) return '#3b82f6'; // blue
  if (score >= 35) return '#a78bfa'; // purple
  return '#64748b'; // gray
};

export const getXPForDifficulty = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 10;
    case 'Medium': return 20;
    case 'Hard': return 40;
    default: return 10;
  }
};
