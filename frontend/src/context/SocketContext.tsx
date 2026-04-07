import React, { createContext, useContext, useEffect, ReactNode, useMemo } from 'react';
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
    const channel = supabase.channel('inventory-updates');

    // Debounced invalidation to prevent "flickering" during rapid DB changes
    let debounceTimer: any;
    const invalidate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['search'] });
        queryClient.invalidateQueries({ queryKey: ['medicine'] });
        queryClient.invalidateQueries({ queryKey: ['pharmacies'] });
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
      }, 500); 
    };

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pharmacy_inventory'
        },
        (payload) => {
          console.log('📡 Real-time inventory change:', payload);
          invalidate();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔌 Connected to Supabase real-time inventory system');
        }
      });

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const value = useMemo(() => ({ supabase }), []);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
