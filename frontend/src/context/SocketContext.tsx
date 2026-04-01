import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

// Update with your actual backend URL if different
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const socketRef = React.useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Fallback for various network environments (Zim use case)
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to real-time stock system');
    });

    socket.on('stockUpdated', (data: { pharmacyId: string; medicineId: string; newStock: number; status: string }) => {
      console.log('📡 Real-time stock update received:', data);
      
      // Invalidate relevant queries to trigger UI refresh
      // This will refresh any component using medicine-specific data or inventory lists
      queryClient.invalidateQueries({ queryKey: ['medicine', data.medicineId] });
      queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
