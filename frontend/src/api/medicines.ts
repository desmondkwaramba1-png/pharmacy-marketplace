import apiClient from './client';
import type { SearchResponse, MedicineDetail, Medicine } from '../types';

export const medicinesApi = {
  search: async (q: string, lat?: number | null, lng?: number | null, status?: string, page = 1): Promise<SearchResponse> => {
    const params: Record<string, any> = { q, page, limit: 20 };
    if (lat != null) params.lat = lat;
    if (lng != null) params.lng = lng;
    if (status) params.status = status;
    const { data } = await apiClient.get('/medicines/search', { params });
    return data;
  },

  getById: async (id: string, lat?: number | null, lng?: number | null): Promise<MedicineDetail> => {
    const params: Record<string, any> = {};
    if (lat != null) params.lat = lat;
    if (lng != null) params.lng = lng;
    const { data } = await apiClient.get(`/medicines/${id}`, { params });
    return data;
  },

  getPopular: async (lat?: number | null, lng?: number | null): Promise<any[]> => {
    const params: Record<string, any> = {};
    if (lat != null) params.lat = lat;
    if (lng != null) params.lng = lng;
    const { data } = await apiClient.get('/medicines/popular', { params });
    return data;
  },
};
