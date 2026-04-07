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

const mapInventoryItem = (item: any): SearchResult => {
  const p = item.pharmacy as any;
  const m = item.medicine as any;

  const result: any = {
    id: item.medicine_id,
    medicineId: item.medicine_id,
    medicineName: m?.generic_name || '',
    brandName: m?.brand_name,
    dosage: m?.dosage,
    form: m?.form,
    category: m?.category,
    imageUrl: m?.image_url,
    pharmacyId: item.pharmacy_id,
    pharmacyName: p?.name || '',
    address: p?.address || '',
    suburb: p?.suburb,
    city: p?.city || 'Harare',
    phone: p?.phone,
    stockStatus: (item.quantity - (item.reserved_quantity || 0)) <= 0 ? 'out_of_stock' : item.stock_status as any,
    quantity: item.quantity,
    reservedQuantity: item.reserved_quantity || 0,
    availableQuantity: Math.max(0, item.quantity - (item.reserved_quantity || 0)),
    price: item.price,
    lastUpdated: item.last_updated,
    distance: item.distance || null
  };

  result.nearestPharmacy = {
    id: item.pharmacy_id,
    name: p?.name || '',
    address: p?.address || '',
    suburb: p?.suburb,
    city: p?.city || 'Harare',
    phone: p?.phone,
    latitude: p?.latitude,
    longitude: p?.longitude,
  };

  return result as SearchResult;
};

export const medicinesApi = {
  search: async (q: string, lat?: number | null, lng?: number | null, status?: string, page = 1): Promise<SearchResponse> => {
    let medicineQuery = supabase.from('medicines').select('id, generic_name, brand_name');
    if (q) {
      medicineQuery = medicineQuery.or(`generic_name.ilike.%${q}%,brand_name.ilike.%${q}%`);
    }
    const { data: medData } = await medicineQuery;
    const medIds = medData?.map(m => m.id) || [];

    if (medIds.length === 0) return { results: [], total: 0, page: 1, limit: 20, query: q };

    let invQuery = supabase
      .from('pharmacy_inventory')
      .select(`
        id, pharmacy_id, medicine_id, stock_status, quantity, reserved_quantity, price, last_updated,
        medicine:medicines!inner(id, generic_name, brand_name, dosage, form, category, image_url),
        pharmacy:pharmacies!inner(id, name, address, suburb, city, phone, latitude, longitude)
      `)
      .in('medicine_id', medIds);

    if (status) {
      invQuery = invQuery.eq('stock_status', status);
    }

    const { data: results, error } = await invQuery;
    if (error) throw error;

    // Client-side ranking/sorting by distance using cast to any
    let processedResults = (results || []).map((item: any) => {
      let distance = null;
      const p = item.pharmacy as any;
      if (lat != null && lng != null && p?.latitude && p?.longitude) {
        const R = 6371;
        const dLat = (p.latitude - lat) * Math.PI / 180;
        const dLon = (p.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(p.latitude * Math.PI / 180) *
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
    const { data: medicine, error: mErr } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single();

    if (mErr) throw mErr;

    const { data: availability, error: aErr } = await supabase
      .from('pharmacy_inventory')
      .select(`
        id, pharmacy_id, medicine_id, stock_status, quantity, reserved_quantity, price, last_updated,
        pharmacy:pharmacies!inner(id, name, address, suburb, phone, latitude, longitude)
      `)
      .eq('medicine_id', id);

    if (aErr) throw aErr;

    const enrichedAvailability = (availability || []).map((item: any) => {
      let distance = null;
      const p = item.pharmacy as any;
      if (lat != null && lng != null && p?.latitude && p?.longitude) {
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
        pharmacyId: item.pharmacy_id,
        pharmacyName: p?.name || '',
        address: p?.address || '',
        suburb: p?.suburb,
        phone: p?.phone,
        latitude: p?.latitude || 0,
        longitude: p?.longitude || 0,
        stockStatus: (item.quantity - (item.reserved_quantity || 0)) <= 0 ? 'out_of_stock' : item.stock_status as any,
        quantity: item.quantity,
        availableQuantity: Math.max(0, item.quantity - (item.reserved_quantity || 0)),
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
        id, pharmacy_id, medicine_id, stock_status, quantity, reserved_quantity, price, last_updated,
        medicine:medicines!inner(id, generic_name, brand_name, dosage, form, category, image_url),
        pharmacy:pharmacies!inner(id, name, address, suburb, city, phone, latitude, longitude)
      `)
      .limit(6);

    if (error) throw error;
    return (data || []).map((item: any) => ({
      ...mapInventoryItem(item),
      distance: null
    }));
  }
};
