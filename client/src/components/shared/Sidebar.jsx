import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, Trophy, Zap, User, BarChart2,
  BookOpen, Rss, Building2, Users, AlertTriangle, Shield,
  ChevronRight, LogOut, Target, X, Menu
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['student', 'mentor', 'admin'] },
  { to: '/roadmap', icon: Map, label: 'Roadmap', roles: ['student', 'mentor', 'admin'] },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', roles: ['student', 'mentor', 'admin'] },
  { to: '/contests', icon: Zap, label: 'Contests', roles: ['student', 'mentor', 'admin'] },
  { to: '/revisions', icon: BookOpen, label: 'Revisions', roles: ['student', 'mentor', 'admin'] },
  { to: '/achievements', icon: Target, label: 'Achievements', roles: ['student', 'mentor', 'admin'] },
  { to: '/feed', icon: Rss, label: 'Feed', roles: ['student', 'mentor', 'admin'] },
  { to: '/analytics', icon: BarChart2, label: 'Analytics', roles: ['student', 'mentor', 'admin'] },
  { to: '/company-tracks', icon: Building2, label: 'Company Tracks', roles: ['student', 'mentor', 'admin'] },
  { to: '/profile', icon: User, label: 'Profile', roles: ['student', 'mentor', 'admin'] },
  // Mentor
  { divider: true, label: 'Mentor', roles: ['mentor', 'admin'] },
  { to: '/mentor', icon: LayoutDashboard, label: 'Mentor Dashboard', roles: ['mentor', 'admin'] },
  { to: '/mentor/students', icon: Users, label: 'Students', roles: ['mentor', 'admin'] },
  { to: '/mentor/warnings', icon: AlertTriangle, label: 'Warnings', roles: ['mentor', 'admin'] },
  // Admin
  { divider: true, label: 'Admin', roles: ['admin'] },
  { to: '/admin', icon: Shield, label: 'Admin Panel', roles: ['admin'] },
  { to: '/admin/users', icon: Users, label: 'Manage Users', roles: ['admin'] },
  { to: '/admin/problems', icon: BookOpen, label: 'Manage Problems', roles: ['admin'] },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics', roles: ['admin'] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-display font-black text-sm">D</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-text-primary">DSAMASTER</h1>
            <p className="text-[10px] text-text-muted">DSA Learning Platform</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=7c3aed&color=fff`}
            alt={user?.name}
            className="w-9 h-9 rounded-full ring-2 ring-brand-600/30"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-brand-400 font-medium">{user?.title || 'Beginner'} • Lv.{user?.level}</p>
          </div>
        </div>
        {/* XP bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-text-muted mb-1.5">
            <span>{user?.xp?.toLocaleString() || 0} XP</span>
            <span>Lv.{(user?.level || 1) + 1}</span>
          </div>
          <div className="progress-bar h-1.5">
            <div className="progress-bar-fill" style={{ width: `${((user?.xp || 0) % 200) / 2}%` }} />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item, idx) => {
          if (item.divider) {
            return (
              <div key={idx} className="pt-4 pb-1 px-3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.label}</span>
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/mentor' || item.to === '/admin'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50" />
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-bg-border">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="sidebar-item w-full text-text-secondary hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-card border border-bg-border"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5 text-text-primary" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <motion.aside
        className={`md:hidden fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-bg-border z-50 flex flex-col ${mobileOpen ? 'flex' : 'hidden'}`}
        initial={{ x: -280 }}
        animate={{ x: mobileOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        <button
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-bg-hover"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-bg-border flex-col z-30">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
