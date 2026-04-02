import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../api/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
  // We expose the Supabase client here if needed for direct subscriptions elsewhere
  supabase: any; 
}

const SocketContext = createContext<SocketContextType>({ supabase });

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Supabase Realtime Subscription for inventory changes
    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pharmacy_inventory'
        },
        (payload) => {
          console.log('📡 Real-time inventory change:', payload);
          
          // Invalidate relevant queries to trigger UI refresh
          // This ensures stock numbers in search and detail pages update instantly
          queryClient.invalidateQueries({ queryKey: ['search'] });
          queryClient.invalidateQueries({ queryKey: ['medicine'] });
          queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔌 Connected to Supabase real-time inventory system');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ supabase }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
