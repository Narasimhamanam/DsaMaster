import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Flame, Star, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Topbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState('');

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await userService.getNotifications();
      return data;
    },
    refetchInterval: 60000, // every minute
  });

  const markReadMutation = useMutation({
    mutationFn: userService.markNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const unreadCount = notifData?.unreadCount || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/roadmap?search=${encodeURIComponent(search)}`);
      setSearch('');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-4 md:px-6 py-3 bg-bg-secondary/80 backdrop-blur-md border-b border-bg-border">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md ml-10 md:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 ml-auto">
        {/* Streak */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-bold text-orange-400">{user?.currentStreak || 0}</span>
        </div>

        {/* XP */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/10 border border-brand-600/20">
          <Star className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-bold text-brand-400">{user?.xp?.toLocaleString() || 0}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notification-bell"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) markReadMutation.mutate();
            }}
            className="relative p-2 rounded-xl hover:bg-bg-hover transition-colors"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-600 text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-card overflow-hidden z-40"
                >
                  <div className="flex items-center justify-between p-4 border-b border-bg-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}>
                      <X className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-bg-border">
                    {notifData?.notifications?.length === 0 && (
                      <p className="p-4 text-center text-text-muted text-sm">No notifications yet</p>
                    )}
                    {notifData?.notifications?.slice(0, 10).map((notif) => (
                      <div key={notif._id} className={`p-3.5 hover:bg-bg-hover transition-colors ${!notif.isRead ? 'bg-brand-600/5' : ''}`}>
                        <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                        <p className="text-xs text-text-muted mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-text-muted mt-1">{dayjs(notif.createdAt).fromNow()}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <img
          src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=7c3aed&color=fff`}
          alt={user?.name}
          className="w-8 h-8 rounded-full ring-2 ring-brand-600/30 cursor-pointer"
          onClick={() => navigate('/profile')}
        />
      </div>
    </header>
  );
};

export default Topbar;
