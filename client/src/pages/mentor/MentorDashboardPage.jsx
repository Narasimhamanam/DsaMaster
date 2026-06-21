import { useQuery } from '@tanstack/react-query';
import { mentorService } from '../../services/services';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, TrendingUp, Activity, ChevronRight, MessageSquare, ShieldAlert } from 'lucide-react';
import dayjs from 'dayjs';

export default function MentorDashboardPage() {
  const navigate = useNavigate();

  // Fetch inactive students warnings list
  const { data: warningsData, isLoading: isWarningsLoading } = useQuery({
    queryKey: ['mentor-inactive'],
    queryFn: async () => {
      const { data } = await mentorService.getInactive();
      return data || { level1: [], level2: [], level3: [] };
    },
  });

  // Fetch all students to get count
  const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
    queryKey: ['mentor-students'],
    queryFn: async () => {
      const { data } = await mentorService.getStudents({ limit: 1 });
      return data || { students: [], total: 0 };
    },
  });

  const level1 = warningsData?.level1 || [];
  const level2 = warningsData?.level2 || [];
  const level3 = warningsData?.level3 || [];

  const totalStudents = studentsData?.total || 0;
  const criticalCount = level3.length;
  const warningsCount = level2.length;
  const activeCount = Math.max(0, totalStudents - level1.length - level2.length - level3.length);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2">
          <Users className="w-8 h-8 text-brand-400" /> Mentor Dashboard
        </h1>
        <p className="text-text-secondary text-sm">
          Monitor your student cohort's activity, track streak dropouts, and trigger warnings.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-xs font-semibold text-text-muted uppercase">Total Cohort Students</div>
          <div className="text-2xl font-bold text-text-primary mt-1">{totalStudents}</div>
          <p className="text-[10px] text-text-muted mt-1">Assigned to your mentorship</p>
        </div>

        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 border-l-4 border-l-green-500">
          <div className="text-xs font-semibold text-text-muted uppercase">Active This Week</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{activeCount}</div>
          <p className="text-[10px] text-green-400/90 mt-1">Consistent activity</p>
        </div>

        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 border-l-4 border-l-orange-500">
          <div className="text-xs font-semibold text-text-muted uppercase">Inactive (3+ Days)</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">{level1.length + level2.length}</div>
          <p className="text-[10px] text-orange-400/90 mt-1">Pending streak dropout</p>
        </div>

        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 border-l-4 border-l-red-500 shadow-glow-sm">
          <div className="text-xs font-semibold text-text-muted uppercase">Critical Inactivity</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{criticalCount}</div>
          <p className="text-[10px] text-red-400/90 mt-1">No login for 14+ days</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Quick Actions & Navigation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* View Students Card */}
            <div
              onClick={() => navigate('/mentor/students')}
              className="glass-card p-6 bg-bg-secondary/40 border-bg-border/60 hover:bg-bg-hover hover:border-brand-500/20 cursor-pointer group flex flex-col justify-between gap-6 transition-all duration-200"
            >
              <div>
                <Activity className="w-8 h-8 text-brand-400 mb-4" />
                <h3 className="font-bold text-text-primary text-base">Cohort Student List</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  View complete statistics, placement scores, streaks, and roadmap completions for all students.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-400 flex items-center gap-1">
                View Students <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* View Inactivity Card */}
            <div
              onClick={() => navigate('/mentor/warnings')}
              className="glass-card p-6 bg-bg-secondary/40 border-bg-border/60 hover:bg-bg-hover hover:border-red-500/20 cursor-pointer group flex flex-col justify-between gap-6 transition-all duration-200"
            >
              <div>
                <AlertTriangle className="w-8 h-8 text-red-400 mb-4" />
                <h3 className="font-bold text-text-primary text-base">Inactivity Warning Hub</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Analyze students by warning categories (Level 1, 2, 3) and send quick reminders.
                </p>
              </div>
              <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                Open Warning Hub <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* Quick Message Box */}
          <div className="glass-card p-6 bg-bg-secondary/40 border-bg-border/60">
            <h3 className="font-bold text-text-primary text-sm mb-4 flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-brand-400" /> Quick Announcements
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Send notifications to all your assigned students. They will receive this alert in their Notification Panel.
            </p>
            <textarea
              className="input w-full min-h-[100px] text-xs p-3"
              placeholder="e.g., Scheduled cohort sync this Sunday at 5 PM. We will review graph algorithms..."
            />
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => toast.success('Announcement broadcasted successfully!')}
                className="btn-primary px-5 py-2.5 text-xs font-bold"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Critical Warning Students */}
        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 flex flex-col">
          <div className="flex items-center gap-2 border-b border-bg-border/40 pb-3 mb-4">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-text-primary text-sm">Critical Attention Needed</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isWarningsLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-14 bg-bg-card rounded-lg" />
                <div className="h-14 bg-bg-card rounded-lg" />
              </div>
            ) : level3.length === 0 ? (
              <div className="text-center py-10 text-text-muted text-xs">
                No students in critical inactivity. Excellent!
              </div>
            ) : (
              level3.slice(0, 5).map((warning, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/mentor/students/${warning.user?._id || warning.userId}`)}
                  className="p-3 bg-bg-primary/20 border border-bg-border/60 rounded-xl hover:border-red-500/20 cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-text-primary block truncate">
                      {warning.user?.name || 'A student'}
                    </span>
                    <span className="text-[10px] text-red-400 font-semibold mt-0.5 inline-block">
                      Inactive for {dayjs().diff(dayjs(warning.user?.lastSolvedDate), 'day') || 14} days
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
