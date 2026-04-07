import { supabase } from './supabaseClient';
import type { SearchResponse, MedicineDetail, SearchResult } from '../types';

const mapMedicine = (m: any) => ({
  id: m.id,
  genericName: m.generic_name,
  brandName: m.brand_name,
  dosage: m.dosage,
  form: m.form,
  category: m.category,
  description: m.description,
  standardPrice: m.standard_price,
  imageUrl: m.image_url,
  createdAt: m.created_at,
  updatedAt: m.updated_at
});

const mapPharmacy = (p: any) => ({
  id: p.id,
  name: p.name,
  address: p.address,
  suburb: p.suburb,
  city: p.city,
  latitude: p.latitude,
  longitude: p.longitude,
  phone: p.phone,
  email: p.email,
  operatingHours: p.operating_hours ? JSON.parse(p.operating_hours) : null,
  logoUrl: p.logo_url,
  isActive: p.is_active
});

const mapInventoryItem = (item: any): SearchResult => {
  const result: any = {
    id: item.medicine_id, // For compatibility with med.id usage
    medicineId: item.medicine_id,
    medicineName: item.medicine?.generic_name || '',
    brandName: item.medicine?.brand_name,
    dosage: item.medicine?.dosage,
    form: item.medicine?.form,
    category: item.medicine?.category,
    imageUrl: item.medicine?.image_url,
    pharmacyId: item.pharmacy_id,
    pharmacyName: item.pharmacy?.name || '',
    address: item.pharmacy?.address || '',
    suburb: item.pharmacy?.suburb,
    city: item.pharmacy?.city || 'Harare',
    phone: item.pharmacy?.phone,
    stockStatus: item.stock_status as any,
    quantity: item.quantity,
    price: item.price,
    lastUpdated: item.last_updated,
    distance: item.distance || null
  };

  // Add compatibility for components expecting nearestPharmacy structure
  result.nearestPharmacy = {
    id: item.pharmacy_id,
    name: item.pharmacy?.name || '',
    address: item.pharmacy?.address || '',
    suburb: item.pharmacy?.suburb,
    city: item.pharmacy?.city || 'Harare',
    phone: item.pharmacy?.phone,
    latitude: item.pharmacy?.latitude,
    longitude: item.pharmacy?.longitude,
  };

  return result as SearchResult;
};

export const medicinesApi = {
  search: async (q: string, lat?: number | null, lng?: number | null, status?: string, page = 1): Promise<SearchResponse> => {
    // 1. Get base medicine IDs matching search
    let medicineQuery = supabase.from('medicines').select('id');
    if (q) {
      medicineQuery = medicineQuery.or(`generic_name.ilike.%${q}%,brand_name.ilike.%${q}%`);
    }
    const { data: medData } = await medicineQuery;
    const medIds = medData?.map(m => m.id) || [];

    if (medIds.length === 0) return { results: [], total: 0, page: 1, limit: 20, query: q };

    // 2. Query inventory for these medicines
    let invQuery = supabase
      .from('pharmacy_inventory')
      .select(`
        *,
        medicine:medicines(*),
        pharmacy:pharmacies(*)
      `)
      .in('medicine_id', medIds);

    if (status) {
      invQuery = invQuery.eq('stock_status', status);
    }

    const { data: results, error } = await invQuery;
    if (error) throw error;

    // 3. Client-side ranking/sorting by distance
    let processedResults = (results || []).map(item => {
      let distance = null;
      if (lat != null && lng != null && item.pharmacy?.latitude && item.pharmacy?.longitude) {
        // Haversine formula
        const R = 6371; // km
        const dLat = (item.pharmacy.latitude - lat) * Math.PI / 180;
        const dLon = (item.pharmacy.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(item.pharmacy.latitude * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
      }
      return { ...item, distance };
    });

    if (lat != null && lng != null) {
      processedResults.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
    }

    const limit = 20;
    const paginated = processedResults.slice((page - 1) * limit, page * limit);

    return {
      query: q,
      results: paginated.map(mapInventoryItem),
      total: processedResults.length,
      page,
      limit,
    };
  },

  getById: async (id: string, lat?: number | null, lng?: number | null): Promise<MedicineDetail> => {
    // 1. Get medicine info
    const { data: medicine, error: mErr } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single();
    
    if (mErr) throw mErr;

    // 2. Get availability
    const { data: availability, error: aErr } = await supabase
      .from('pharmacy_inventory')
      .select(`
        *,
        pharmacy:pharmacies(*)
      `)
      .eq('medicine_id', id);

    if (aErr) throw aErr;

    // 3. Calculate distances
    const enrichedAvailability = (availability || []).map(item => {
      let distance = null;
      if (lat != null && lng != null && item.pharmacy?.latitude && item.pharmacy?.longitude) {
        const R = 6371;
        const dLat = (item.pharmacy.latitude - lat) * Math.PI / 180;
        const dLon = (item.pharmacy.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(item.pharmacy.latitude * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = R * c;
      }
      return {
        pharmacyId: item.pharmacy_id,
        pharmacyName: item.pharmacy?.name || '',
        address: item.pharmacy?.address || '',
        suburb: item.pharmacy?.suburb,
        phone: item.pharmacy?.phone,
        latitude: item.pharmacy?.latitude || 0,
        longitude: item.pharmacy?.longitude || 0,
        stockStatus: item.stock_status as any,
        quantity: item.quantity,
        price: item.price,
        lastUpdated: item.last_updated,
        distance
      };
    });

    return {
      ...mapMedicine(medicine),
      availability: enrichedAvailability
    };
  },

  getPopular: async (lat?: number | null, lng?: number | null): Promise<any[]> => {
    const { data, error } = await supabase
      .from('pharmacy_inventory')
      .select(`
        *,
        medicine:medicines(*),
        pharmacy:pharmacies(*)
      `)
      .limit(6);
    
    if (error) throw error;
    return (data || []).map(item => ({
      ...mapInventoryItem(item),
      distance: null
    }));
  }
};

