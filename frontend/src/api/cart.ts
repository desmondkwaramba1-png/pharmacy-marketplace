import apiClient from './client';

const SESSION_KEY = 'medifind_session_id';

function getSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function sessionHeaders() {
  return { 'x-session-id': getSessionId() };
}

export interface CartItemDetail {
  id: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  reservedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  isExpired: boolean;
  medicine: {
    id: string;
    genericName: string;
    brandName?: string;
    dosage?: string;
    form?: string;
    imageUrl?: string;
  } | null;
  pharmacy: {
    id: string;
    name: string;
    address: string;
    suburb?: string;
    phone?: string;
  } | null;
  price: number | null;
  lineTotal: number | null;
}

export interface CartResponse {
  items: CartItemDetail[];
  total: number;
  itemCount: number;
}

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const { data } = await apiClient.get('/cart', { headers: sessionHeaders() });
    return data;
  },

  addToCart: async (pharmacyId: string, medicineId: string, quantity = 1): Promise<CartResponse> => {
    const { data } = await apiClient.post('/cart/add', { pharmacyId, medicineId, quantity }, { headers: sessionHeaders() });
    return data;
  },

  removeFromCart: async (cartItemId: string): Promise<CartResponse> => {
    const { data } = await apiClient.delete(`/cart/${cartItemId}`, { headers: sessionHeaders() });
    return data;
  },

  checkout: async (): Promise<{ message: string; bookingRef: string }> => {
    const { data } = await apiClient.post('/cart/checkout', {}, { headers: sessionHeaders() });
    return data;
  },

  getHistory: async (): Promise<{ items: any[] }> => {
    const { data } = await apiClient.get('/cart/history', { headers: sessionHeaders() });
    return data;
  },
};
