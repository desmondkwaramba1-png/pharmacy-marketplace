import { supabase } from './supabaseClient';
import type { User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    return {
      token: data.session?.access_token || '',
      user: {
        id: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.firstName,
        lastName: data.user.user_metadata?.lastName,
        role: data.user.user_metadata?.role || 'patient'
      }
    };
  },

  register: async (email: string, password: string, firstName?: string, lastName?: string): Promise<{ token: string; user: User }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          role: 'patient'
        }
      }
    });

    if (error) throw error;
    
    return {
      token: data.session?.access_token || '',
      user: {
        id: data.user!.id,
        email: data.user!.email || '',
        firstName,
        lastName,
        role: 'patient'
      }
    };
  },

  getMe: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    return {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.firstName,
      lastName: user.user_metadata?.lastName,
      role: user.user_metadata?.role || 'patient'
    };
  },
};
