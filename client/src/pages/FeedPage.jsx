import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { feedService } from '../services/services';
import { useLiveFeed } from '../hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, CheckCircle, RefreshCw, Rss, ArrowDown } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const EVENT_CONFIG = {
  problem_solved: {
    icon: CheckCircle,
    color: 'text-green-400 border-green-500/20 bg-green-500/5',
    border: 'border-l-green-500',
  },
  badge_earned: {
    icon: Trophy,
    color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    border: 'border-l-amber-500',
  },
  streak_milestone: {
    icon: Flame,
    color: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
    border: 'border-l-orange-500',
  },
};

export default function FeedPage() {
  const [liveEventsList, setLiveEventsList] = useState([]);
  const { liveEvents } = useLiveFeed();

  // Prepend live events when they arrive via Socket.io
  useEffect(() => {
    if (liveEvents.length > 0) {
      const latest = liveEvents[0];
      // Avoid duplicate adding
      setLiveEventsList((prev) => {
        if (prev.find((e) => e._id === latest._id || e.id === latest.id)) return prev;
        return [latest, ...prev];
      });
    }
  }, [liveEvents]);

  // Fetch paginated feed events
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await feedService.getFeed(pageParam);
      return data || { events: [], hasMore: false };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
  });

  const dbEvents = data?.pages.flatMap((page) => page.events) || [];

  // Merge live socket events and database events
  const allEvents = [...liveEventsList, ...dbEvents].filter(
    (event, index, self) => self.findIndex((e) => e._id === event._id || e.id === event.id) === index
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2.5">
            <Rss className="w-8 h-8 text-brand-400 fill-brand-500/10" /> Competitive Feed
          </h1>
          <p className="text-text-secondary text-sm">
            Real-time coding events and milestones of students on the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            Live
          </span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-bg-hover hover:bg-bg-hover/80 border border-bg-border text-text-secondary transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse pt-4">
          <div className="h-24 bg-bg-card rounded-xl w-full" />
          <div className="h-24 bg-bg-card rounded-xl w-full" />
          <div className="h-24 bg-bg-card rounded-xl w-full" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 glass-card bg-bg-secondary/15">
          <div className="text-red-400 font-semibold">Failed to load feed events</div>
          <button onClick={() => refetch()} className="btn-primary mt-4 px-6 py-2.5">
            Retry
          </button>
        </div>
      ) : allEvents.length === 0 ? (
        <div className="text-center py-16 glass-card bg-bg-secondary/15">
          <Rss className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <div className="text-text-secondary font-semibold">Feed is empty</div>
          <p className="text-text-muted text-xs mt-1">Start solving problems to trigger events!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {allEvents.map((event) => {
              const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.problem_solved;
              const Icon = config.icon;
              const displayTime = dayjs(event.createdAt).fromNow();

              return (
                <motion.div
                  key={event._id || event.id}
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`glass-card p-4 bg-bg-secondary/40 border border-bg-border/60 border-l-4 ${config.border} flex items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={event.user?.photoURL || 'https://via.placeholder.com/150'}
                      alt={event.user?.name}
                      className="w-10 h-10 rounded-full border border-bg-border flex-shrink-0 object-cover"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary">
                        {event.user?.name || 'A user'}
                      </div>
                      <div className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                        <span className={`inline-flex p-1 rounded ${config.color}`}>
                          <Icon className="w-3 h-3" />
                        </span>
                        <span className="text-text-primary/90 font-medium">
                          {event.message}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-text-muted flex-shrink-0 whitespace-nowrap self-start sm:self-center">
                    {displayTime}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="pt-4 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="btn-secondary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2"
              >
                {isFetchingNextPage ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowDown className="w-3.5 h-3.5" /> Load More Activity
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
