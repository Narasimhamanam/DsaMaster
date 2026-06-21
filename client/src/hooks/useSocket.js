import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';

// Generic real-time event listener hook
export const useSocketEvent = (event, callback) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }, [socket, event, callback]);
};

// Real-time feed events hook
export const useLiveFeed = () => {
  const [liveEvents, setLiveEvents] = useState([]);

  useSocketEvent('feed_event', (event) => {
    setLiveEvents((prev) => [{ ...event, _id: Date.now(), isLive: true }, ...prev].slice(0, 50));
  });

  return { liveEvents };
};

// Real-time leaderboard hook
export const useLiveLeaderboard = (onUpdate) => {
  useSocketEvent('leaderboard_update', onUpdate);
};

// Real-time achievements hook
export const useLiveAchievements = (onAchievement) => {
  useSocketEvent('achievement_unlocked', onAchievement);
};
