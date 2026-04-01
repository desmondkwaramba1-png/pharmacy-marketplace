import apiClient from './client';
import type { Pharmacy } from '../types';

export const pharmaciesApi = {
  getNearby: async (lat?: number | null, lng?: number | null, radius = 10): Promise<Pharmacy[]> => {
    const params: Record<string, any> = { radius };
    if (lat != null) params.lat = lat;
    if (lng != null) params.lng = lng;
    const { data } = await apiClient.get('/pharmacies/nearby', { params });
    return data;
  },

  getById: async (id: string, lat?: number | null, lng?: number | null): Promise<Pharmacy> => {
    const params: Record<string, any> = {};
    if (lat != null) params.lat = lat;
    if (lng != null) params.lng = lng;
    const { data } = await apiClient.get(`/pharmacies/${id}`, { params });
    return data;
  },
};
