import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../api/supabaseClient';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPharmacist: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  registerPharmacy: (data: RegisterPharmacyData) => Promise<void>;
  logout: () => Promise<void>;
}

export interface RegisterPharmacyData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  pharmacyName: string;
  address: string;
  suburb?: string;
  city: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const mapSupabaseUser = (sbUser: any): User => ({
  id: sbUser.id,
  email: sbUser.email || '',
  firstName: sbUser.user_metadata?.firstName || '',
  lastName: sbUser.user_metadata?.lastName || '',
  role: sbUser.user_metadata?.role || 'patient',
  pharmacy: sbUser.user_metadata?.pharmacy || null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? mapSupabaseUser(session.user) : null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? mapSupabaseUser(session.user) : null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { firstName, lastName, role: 'patient' } }
    });
    if (error) throw error;
  };

  const registerPharmacy = async (data: RegisterPharmacyData) => {
    // 1. Create the pharmacist auth account
    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'pharmacist',
        }
      }
    });
    if (signUpErr) throw signUpErr;
    if (!authData.user) throw new Error('Account creation failed');

    // 2. Create the pharmacy record
    const { data: pharmacy, error: pharmacyErr } = await supabase
      .from('pharmacies')
      .insert([{
        name: data.pharmacyName,
        address: data.address,
        suburb: data.suburb || null,
        city: data.city,
        phone: data.phone || null,
        owner_id: authData.user.id,
        is_active: true,
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
      }])
      .select()
      .single();

    if (pharmacyErr) throw new Error('Pharmacy registration failed: ' + pharmacyErr.message);

    // 3. Update user metadata with pharmacyId so getMyPharmacyId() works
    await supabase.auth.updateUser({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'pharmacist',
        pharmacyId: pharmacy.id,
        pharmacy: { id: pharmacy.id, name: pharmacy.name },
      }
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isPharmacist: user?.role === 'pharmacist',
    login,
    register,
    registerPharmacy,
    logout,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
