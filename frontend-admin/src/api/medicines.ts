import { supabase } from './supabaseClient';
import type { SearchResponse, MedicineDetail, Medicine } from '../types';

const mapMedicine = (m: any): Medicine => ({
  id: m.id,
  genericName: m.generic_name,
  brandName: m.brand_name,
  dosage: m.dosage,
  form: m.form,
  category: m.category,
  description: m.description,
  standardPrice: m.standard_price,
  imageUrl: m.image_url,
});

export const medicinesApi = {
  search: async (q: string): Promise<Medicine[]> => {
    let query = supabase.from('medicines').select('*');
    if (q) {
      query = query.or(`generic_name.ilike.%${q}%,brand_name.ilike.%${q}%`);
    }
    const { data, error } = await query.limit(20);
    if (error) throw error;
    return (data || []).map(mapMedicine);
  },

  getById: async (id: string): Promise<MedicineDetail> => {
    const { data: medicine, error: mErr } = await supabase
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single();
    
    if (mErr) throw mErr;

    const { data: availability, error: aErr } = await supabase
      .from('pharmacy_inventory')
      .select(`
        *,
        pharmacy:pharmacies(*)
      `)
      .eq('medicine_id', id);

    if (aErr) throw aErr;

    return {
      ...mapMedicine(medicine),
      availability: (availability || []).map(item => ({
        pharmacyId: item.pharmacy_id,
        pharmacyName: item.pharmacy?.name || '',
        address: item.pharmacy?.address || '',
        stockStatus: item.stock_status as any,
        quantity: item.quantity,
        price: item.price,
        lastUpdated: item.last_updated,
        latitude: item.pharmacy?.latitude || 0,
        longitude: item.pharmacy?.longitude || 0,
      }))
    };
  },

  getPopular: async (): Promise<Medicine[]> => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .limit(6);
    
    if (error) throw error;
    return (data || []).map(mapMedicine);
  },
};
