import { supabase } from './supabaseClient';
import type { Pharmacy } from '../types';

export const pharmaciesApi = {
  getNearby: async (lat?: number | null, lng?: number | null, radius = 50): Promise<Pharmacy[]> => {
    // 1. Fetch all active pharmacies
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;

    // 2. Client-side distance filtering (radius in km)
    const processed = (data || []).map(p => {
      let distance = null;
      if (lat != null && lng != null && p.latitude && p.longitude) {
        const R = 6371;
        const dLat = (p.latitude - lat) * Math.PI / 180;
        const dLon = (p.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(p.latitude * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
      }
      return { 
        id: p.id,
        name: p.name,
        address: p.address,
        suburb: p.suburb,
        city: p.city,
        latitude: p.latitude,
        longitude: p.longitude,
        phone: p.phone,
        email: p.email,
        isActive: p.is_active,
        distance 
      };
    });

    if (lat != null && lng != null) {
      return processed
        .filter(p => p.distance === null || p.distance <= radius)
        .sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    return processed as Pharmacy[];
  },

  getById: async (id: string, lat?: number | null, lng?: number | null): Promise<Pharmacy> => {
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;

    let distance = null;
    if (lat != null && lng != null && data.latitude && data.longitude) {
      const R = 6371;
      const dLat = (data.latitude - lat) * Math.PI / 180;
      const dLon = (data.longitude - lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(data.latitude * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;
    }

    return {
      id: data.id,
      name: data.name,
      address: data.address,
      suburb: data.suburb,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone,
      email: data.email,
      isActive: data.is_active,
      distance
    } as Pharmacy;
  },
};
