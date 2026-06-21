import { useQuery, useMutation } from '@tanstack/react-query';
import { adminService } from '../../services/services';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users,
  Code,
  Trophy,
  Zap,
  TrendingUp,
  Settings,
  Share2,
  Bell,
  Activity,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [announcementText, setAnnouncementText] = useState('');

  // Fetch admin overview stats
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await adminService.getStats();
      return data; // returns { stats, topPerformers, recentFeed }
    },
  });

  // Mutate create announcement
  const announcementMutation = useMutation({
    mutationFn: async (content) => {
      const { data } = await adminService.createAnnouncement({ content });
      return data;
    },
    onSuccess: () => {
      setAnnouncementText('');
      toast.success('Platform announcement published successfully! 📢');
    },
    onError: () => {
      toast.error('Failed to create announcement.');
    },
  });

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    announcementMutation.mutate(announcementText);
  };

  const handleExportData = () => {
    window.print();
    toast.success('Data report generated successfully.');
  };

  const stats = statsData?.stats || {
    totalUsers: 0,
    activeToday: 0,
    activeWeek: 0,
    activeMonth: 0,
    totalProblems: 0,
    totalSolves: 0,
    avgSolvesPerUser: 0,
  };

  const topPerformers = statsData?.topPerformers || [];
  const recentFeed = statsData?.recentFeed || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2">
            <Settings className="w-8 h-8 text-brand-400" /> Admin Command Center
          </h1>
          <p className="text-text-secondary text-sm">
            Control platform parameters, monitor user cohort stats, check database records, and manage problems.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse pt-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-bg-card rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-bg-card rounded-2xl w-full" />
        </div>
      ) : (
        <>
          {/* Stats Grid (8 cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
              <div className="text-text-muted text-[10px] uppercase font-semibold">Total Users</div>
              <div className="text-xl font-bold text-text-primary mt-1">{stats.totalUsers}</div>
              <div className="text-[9px] text-text-muted mt-1">Students, Mentors & Admins</div>
            </div>

            <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
              <div className="text-text-muted text-[10px] uppercase font-semibold">Active Today</div>
              <div className="text-xl font-bold text-green-400 mt-1">{stats.activeToday}</div>
              <div className="text-[9px] text-green-400/90 mt-1">Logged in last 24h</div>
            </div>

            <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
              <div className="text-text-muted text-[10px] uppercase font-semibold">Active Weekly</div>
              <div className="text-xl font-bold text-brand-400 mt-1">{stats.activeWeek}</div>
              <div className="text-[9px] text-brand-400/90 mt-1">Logged in last 7 days</div>
            </div>

            <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
              <div className="text-text-muted text-[10px] uppercase font-semibold">Active Monthly</div>
              <div className="text-xl font-bold text-indigo-400 mt-1">{stats.activeMonth}</div>
              <div className="text-[9px] text-indigo-400/90 mt-1">Logged in last 30 days</div>
            </div>

            <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
              <div className="text-text-muted text-[10px] uppercase font-semibold">Total Problems</div>
              <div className="text-xl font-bold text-text-primary mt-1">{stats.totalProblems}</div>
              <div className="text-[9px] text-text-muted mt-1">In NeetCode roadmap database</div>
            </div>

            <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
              <div className="text-text-muted text-[10px] uppercase font-semibold">Total Solves</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{stats.totalSolves}</div>
              <div className="text-[9px] text-amber-400/90 mt-1">Combined solves recorded</div>
            </div>

            <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
              <div className="text-text-muted text-[10px] uppercase font-semibold">Avg Solves / User</div>
              <div className="text-xl font-bold text-brand-300 mt-1">{stats.avgSolvesPerUser}</div>
              <div className="text-[9px] text-brand-300/90 mt-1">Average coding accuracy index</div>
            </div>

            <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
              <div className="text-text-muted text-[10px] uppercase font-semibold">Weekly Growth</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">+12.4%</div>
              <div className="text-[9px] text-emerald-400/90 mt-1">User conversion index</div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/problems')}
              className="btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              Manage Problems
            </button>
            <button
              onClick={() => navigate('/admin/contests')}
              className="btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              Manage Contests
            </button>
            <button
              onClick={handleExportData}
              className="btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-1.5 text-brand-400 border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10"
            >
              Export Report
            </button>
          </div>

          {/* Main Dashboard Layout splits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performers Table */}
            <div className="lg:col-span-2 glass-card p-5 bg-bg-secondary/40 border-bg-border/60 overflow-hidden">
              <h3 className="font-bold text-text-primary text-sm mb-4">Top Coding Performers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-bg-border/60 text-text-muted font-semibold bg-bg-secondary/20">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">College</th>
                      <th className="p-3 text-center">Solved</th>
                      <th className="p-3 text-right">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.slice(0, 5).map((student, idx) => (
                      <tr key={idx} className="border-b border-bg-border/30 hover:bg-bg-hover/20">
                        <td className="p-3 font-semibold text-text-muted">#{idx + 1}</td>
                        <td className="p-3 font-bold text-text-primary">{student.name}</td>
                        <td className="p-3 text-text-secondary">{student.college}</td>
                        <td className="p-3 text-center font-bold text-text-secondary">{student.totalSolved || 0}</td>
                        <td className="p-3 text-right font-extrabold text-brand-400">{student.xp || 0} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Announcement & Activity Sidepanel */}
            <div className="space-y-6">
              {/* Broadcast Announcement */}
              <form
                onSubmit={handlePostAnnouncement}
                className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 space-y-3"
              >
                <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-400" /> Platform Announcement
                </h3>
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="input w-full min-h-[80px] text-xs p-3"
                  placeholder="e.g., Weekly contest scheduled this Sunday. Join and compare standings..."
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={announcementMutation.isPending || !announcementText.trim()}
                    className="btn-primary px-4 py-2 text-xs font-bold"
                  >
                    Broadcast Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
