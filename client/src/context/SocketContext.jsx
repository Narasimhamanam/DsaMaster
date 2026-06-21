import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
