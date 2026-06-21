import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/services';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Target, Brain, Award, ShieldAlert, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function AnalyticsPage() {
  const { user } = useAuth();

  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await userService.getAnalytics();
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pt-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-card rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-bg-card rounded-xl" />
          <div className="h-24 bg-bg-card rounded-xl" />
          <div className="h-24 bg-bg-card rounded-xl" />
          <div className="h-24 bg-bg-card rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-bg-card rounded-2xl" />
          <div className="h-64 bg-bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-text-primary">Failed to load analytics</h2>
        <p className="text-text-muted mt-2">Could not retrieve your data. Please try again later.</p>
      </div>
    );
  }

  const analytics = analyticsData?.analytics || {};
  const {
    retentionScore = user?.retentionScore || 75,
    placementScore = user?.placementScore || 65,
  } = analytics;

  const difficultyBreakdown = {
    easy: analytics.difficultyBreakdown?.find(d => d.name === 'Easy')?.value || user?.easySolved || 0,
    medium: analytics.difficultyBreakdown?.find(d => d.name === 'Medium')?.value || user?.mediumSolved || 0,
    hard: analytics.difficultyBreakdown?.find(d => d.name === 'Hard')?.value || user?.hardSolved || 0,
  };

  const totalSolved = user?.totalSolved || 0;
  const longestStreak = user?.longestStreak || 0;

  const difficultyData = (analytics.difficultyBreakdown || []).filter((d) => d.value > 0);

  const weeklyProgress = (analytics.weeklyData || []).map((w) => ({
    name: w.week,
    solved: w.solved,
  }));

  const monthlyProgress = (analytics.monthlyData || []).map((m) => ({
    name: m.month,
    solved: m.solved,
  }));

  const strongTopics = (analytics.strongTopics || []).map((t) => ({
    name: t.topic,
    solved: t.solved,
  }));

  const weakTopics = (analytics.weakTopics || []).map((t) => ({
    name: t.topic,
    solved: t.solved,
  }));

  // Compute placement readiness level description
  const getReadinessLevel = (score) => {
    if (score >= 90) return { label: 'Top 10% (MAANG Ready)', desc: 'Excellent performance. Keep polishing system design and mock interviews.' };
    if (score >= 70) return { label: 'Interview Ready (Product Companies)', desc: 'Strong grasp of core topics. Highly competitive.' };
    if (score >= 50) return { label: 'Advanced', desc: 'Good problem solver. Recommended to focus on Medium-Hard trees and graphs.' };
    if (score >= 30) return { label: 'Intermediate', desc: 'Consistent solver. Needs practice on recursion, backtracking, and DP.' };
    return { label: 'Beginner', desc: 'Just starting out. Focus on Arrays, Two Pointers, and Stacks.' };
  };

  const readiness = getReadinessLevel(placementScore);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-brand-400" /> Performance Analytics
        </h1>
        <p className="text-text-secondary text-sm">
          Detailed metrics showing accuracy, recall retention, placement preparation level, and roadmap progress.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-xs font-semibold text-text-muted uppercase">Retention Recall</div>
          <div className="text-2xl font-bold text-text-primary mt-1">{retentionScore}%</div>
          <div className="text-[10px] text-green-400 font-medium mt-1 flex items-center gap-1">
            <Brain className="w-3.5 h-3.5" /> Spaced recall rate
          </div>
        </div>

        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-xs font-semibold text-text-muted uppercase">Placement Score</div>
          <div className="text-2xl font-bold text-brand-400 mt-1">{placementScore}%</div>
          <div className="text-[10px] text-brand-400 font-medium mt-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Target placement readiness
          </div>
        </div>

        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-xs font-semibold text-text-muted uppercase">Total Problems Solved</div>
          <div className="text-2xl font-bold text-text-primary mt-1">{totalSolved}</div>
          <div className="text-[10px] text-text-muted font-medium mt-1">Across all 18 topics</div>
        </div>

        <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-xs font-semibold text-text-muted uppercase">Longest Streak</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">{longestStreak} days</div>
          <div className="text-[10px] text-orange-400/90 font-medium mt-1">Keep coding daily!</div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Area Chart */}
        <div className="glass-card p-5 md:p-6 bg-bg-secondary/40 border-bg-border/60">
          <h3 className="font-bold text-text-primary text-sm mb-4">Weekly Progress (Last 8 Weeks)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="solved" stroke="#7c3aed" fillOpacity={1} fill="url(#colorWeekly)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="glass-card p-5 md:p-6 bg-bg-secondary/40 border-bg-border/60">
          <h3 className="font-bold text-text-primary text-sm mb-4">Monthly Activity (Last 6 Months)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="solved" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Pie Chart */}
        <div className="glass-card p-5 md:p-6 bg-bg-secondary/40 border-bg-border/60 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex-1 w-full">
            <h3 className="font-bold text-text-primary text-sm mb-2">Difficulty Accuracy Breakdown</h3>
            <p className="text-xs text-text-muted mb-4">Distribution of Easy, Medium, and Hard solved questions.</p>
            {difficultyData.length === 0 ? (
              <div className="text-text-muted text-xs">No questions solved yet.</div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-bg-border/40 pb-1">
                  <span className="text-green-400 font-semibold">Easy</span>
                  <span>{difficultyBreakdown.easy || 0} solved</span>
                </div>
                <div className="flex justify-between items-center border-b border-bg-border/40 pb-1">
                  <span className="text-yellow-400 font-semibold">Medium</span>
                  <span>{difficultyBreakdown.medium || 0} solved</span>
                </div>
                <div className="flex justify-between items-center border-b border-bg-border/40 pb-1">
                  <span className="text-red-400 font-semibold">Hard</span>
                  <span>{difficultyBreakdown.hard || 0} solved</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-56 w-56 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Placement readiness gauge */}
        <div className="glass-card p-5 md:p-6 bg-bg-secondary/40 border-bg-border/60 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-text-primary text-sm mb-1">Placement Readiness Status</h3>
            <p className="text-xs text-text-muted mb-6">Aggregated score based on problem accuracy, speed, and contest ratings.</p>
          </div>

          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center bg-brand-500/10 border border-brand-500/20 rounded-2xl">
              <Star className="w-10 h-10 text-brand-400 fill-brand-400/10" />
            </div>
            <div>
              <div className="text-xs text-text-muted font-semibold uppercase">Current Status</div>
              <div className="text-base font-bold text-brand-300 mt-0.5">{readiness.label}</div>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{readiness.desc}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2">
              <span>Readiness Progress</span>
              <span>{placementScore}%</span>
            </div>
            <div className="w-full bg-bg-hover h-3 rounded-full overflow-hidden border border-bg-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${placementScore}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-brand rounded-full shadow-glow-sm"
              />
            </div>
          </div>
        </div>

        {/* Strong Topics */}
        <div className="glass-card p-5 md:p-6 bg-bg-secondary/40 border-bg-border/60">
          <h3 className="font-bold text-text-primary text-sm mb-4">Strong Topics (Highest Accuracy)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strongTopics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="solved" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak Topics */}
        <div className="glass-card p-5 md:p-6 bg-bg-secondary/40 border-bg-border/60">
          <h3 className="font-bold text-text-primary text-sm mb-4">Focus Topics (Needs Attention)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weakTopics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="solved" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
