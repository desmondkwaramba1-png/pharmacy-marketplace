import apiClient from './client';
import type { User, InventoryItem, AdminAnalytics, Pharmacy } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },

  register: async (email: string, password: string, firstName?: string, lastName?: string): Promise<{ token: string; user: User }> => {
    const { data } = await apiClient.post('/auth/register', { email, password, firstName, lastName });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};

export const adminApi = {
  getInventory: async (params?: { status?: string; q?: string; page?: number }): Promise<{ inventory: InventoryItem[]; total: number; stats: any[] }> => {
    const { data } = await apiClient.get('/admin/inventory', { params });
    return data;
  },

  updateInventory: async (medicineId: string, payload: { stockStatus: string; quantity?: number; price?: number }): Promise<InventoryItem> => {
    const { data } = await apiClient.put(`/admin/inventory/${medicineId}`, payload);
    return data;
  },

  addMedicine: async (payload: any): Promise<InventoryItem> => {
    const { data } = await apiClient.post('/admin/inventory', payload);
    return data;
  },

  removeMedicine: async (medicineId: string): Promise<void> => {
    await apiClient.delete(`/admin/inventory/${medicineId}`);
  },

  getPharmacy: async (): Promise<Pharmacy> => {
    const { data } = await apiClient.get('/admin/pharmacy');
    return data;
  },

  updatePharmacy: async (payload: Partial<Pharmacy>): Promise<Pharmacy> => {
    const { data } = await apiClient.put('/admin/pharmacy', payload);
    return data;
  },

  getAnalytics: async (): Promise<AdminAnalytics> => {
    const { data } = await apiClient.get('/admin/analytics');
    return data;
  },
};
