// Shared TypeScript types for MediFind

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  pharmacy?: { id: string; name: string } | null;
}

export interface Medicine {
  id: string;
  genericName: string;
  brandName?: string;
  dosage?: string;
  form?: string;
  category?: string;
  description?: string;
  standardPrice?: number;
  imageUrl?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  suburb?: string;
  city: string;
  phone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  distance?: number | null;
  operatingHours?: Record<string, string> | null;
  isActive: boolean;
  logoUrl?: string;
}

export interface SearchResult {
  medicineId: string;
  medicineName: string;
  brandName?: string;
  dosage?: string;
  form?: string;
  category?: string;
  imageUrl?: string;
  pharmacyId: string;
  pharmacyName: string;
  address: string;
  suburb?: string;
  city: string;
  phone?: string;
  stockStatus: StockStatus;
  quantity: number;
  price?: number | null;
  distance?: number | null;
  lastUpdated: string;
}

export interface MedicineDetail extends Medicine {
  availability: Array<{
    pharmacyId: string;
    pharmacyName: string;
    address: string;
    suburb?: string;
    phone?: string;
    latitude: number;
    longitude: number;
    stockStatus: StockStatus;
    quantity: number;
    price?: number | null;
    distance?: number | null;
    lastUpdated: string;
  }>;
}

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  medicineId: string;
  stockStatus: StockStatus;
  quantity: number;
  price?: number | null;
  lastUpdated: string;
  medicine: Medicine;
  updatedBy?: { firstName?: string; lastName?: string } | null;
}

export interface AdminAnalytics {
  totalMedicines: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  weeklySearches: number;
  directionRequests: number;
  avgRating: number;
}

export interface SearchResponse {
  query: string;
  total: number;
  page: number;
  limit: number;
  results: SearchResult[];
}

export interface Coords {
  lat: number;
  lng: number;
}
