import { supabase } from './supabaseClient';
import type { User, InventoryItem, AdminAnalytics, Pharmacy, StockStatus } from '../types';

// Helper to get the current pharmacist's pharmacy ID
async function getMyPharmacyId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const pharmacyId = user.user_metadata?.pharmacyId;
  if (!pharmacyId) throw new Error('Pharmacist not assigned to a pharmacy');
  return pharmacyId;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { 
      token: data.session?.access_token || '', 
      user: {
        id: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.firstName,
        lastName: data.user.user_metadata?.lastName,
        role: data.user.user_metadata?.role || 'pharmacist',
        pharmacy: data.user.user_metadata?.pharmacy
      } as User
    };
  },

  getMe: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.firstName,
      lastName: user.user_metadata?.lastName,
      role: user.user_metadata?.role || 'pharmacist',
      pharmacy: user.user_metadata?.pharmacy
    } as User;
  },
};

export const adminApi = {
  getInventory: async (params?: { status?: string; q?: string; page?: number }): Promise<{ inventory: InventoryItem[]; total: number; stats: any[] }> => {
    const pharmacyId = await getMyPharmacyId();
    
    // 1. Build query for inventory items
    let query = supabase
      .from('pharmacy_inventory')
      .select(`
        *,
        medicine:medicines(*)
      `)
      .eq('pharmacy_id', pharmacyId);

    if (params?.status) {
      query = query.eq('stock_status', params.status);
    }

    if (params?.q) {
      const { data: medData } = await supabase
        .from('medicines')
        .select('id')
        .or(`generic_name.ilike.%${params.q}%,brand_name.ilike.%${params.q}%`);
      
      const medIds = medData?.map(m => m.id) || [];
      query = query.in('medicine_id', medIds);
    }

    const { data, error, count } = await query.order('last_updated', { ascending: false });
    if (error) throw error;

    const statsQuery = await supabase
      .from('pharmacy_inventory')
      .select('stock_status')
      .eq('pharmacy_id', pharmacyId);
    
    const statsMap: Record<string, number> = {};
    (statsQuery.data || []).forEach(item => {
      statsMap[item.stock_status] = (statsMap[item.stock_status] || 0) + 1;
    });

    const stats = Object.entries(statsMap).map(([status, count]) => ({
      stockStatus: status,
      _count: { stockStatus: count }
    }));

    const inventory = (data || []).map(item => ({
      id: item.id,
      pharmacyId: item.pharmacy_id,
      medicineId: item.medicine_id,
      stockStatus: (item.quantity - (item.reserved_quantity || 0)) <= 0 ? 'out_of_stock' : item.stock_status as StockStatus,
      quantity: item.quantity,
      reservedQuantity: item.reserved_quantity || 0,
      availableQuantity: Math.max(0, item.quantity - (item.reserved_quantity || 0)),
      price: item.price,
      lastUpdated: item.last_updated,
      updatedBy: item.updated_by ? { id: item.updated_by } : null,
      medicine: {
        id: item.medicine.id,
        genericName: item.medicine.generic_name,
        brandName: item.medicine.brand_name,
        dosage: item.medicine.dosage,
        form: item.medicine.form,
        category: item.medicine.category,
        description: item.medicine.description,
        standardPrice: item.medicine.standard_price,
        imageUrl: item.medicine.image_url,
      }
    } as InventoryItem));

    return {
      inventory,
      total: count || inventory.length,
      stats
    };
  },

  updateInventory: async (medicineId: string, payload: { stockStatus: string; quantity?: number; price?: number }): Promise<InventoryItem> => {
    const pharmacyId = await getMyPharmacyId();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('pharmacy_inventory')
      .update({
        stock_status: payload.stockStatus,
        quantity: payload.quantity,
        price: payload.price,
        last_updated: new Date().toISOString(),
        updated_by: user?.id
      })
      .eq('pharmacy_id', pharmacyId)
      .eq('medicine_id', medicineId)
      .select(`
        *,
        medicine:medicines(*)
      `)
      .single();

    if (error) throw error;
    return data as any;
  },

  addMedicine: async (payload: any): Promise<InventoryItem> => {
    const pharmacyId = await getMyPharmacyId();
    const { data: { user } } = await supabase.auth.getUser();

    let medicineId = '';
    const { data: existingMed } = await supabase
      .from('medicines')
      .select('id')
      .eq('generic_name', payload.genericName)
      .eq('dosage', payload.dosage)
      .maybeSingle();

    if (existingMed) {
      medicineId = existingMed.id;
    } else {
      const { data: newMed, error: medErr } = await supabase
        .from('medicines')
        .insert([{
          generic_name: payload.genericName,
          brand_name: payload.brandName,
          dosage: payload.dosage,
          form: payload.form,
          category: payload.category,
          description: payload.description,
          standard_price: payload.standardPrice,
          image_url: payload.imageUrl
        }])
        .select()
        .single();
      if (medErr) throw medErr;
      medicineId = newMed.id;
    }

    const { data: invItem, error: invErr } = await supabase
      .from('pharmacy_inventory')
      .insert([{
        pharmacy_id: pharmacyId,
        medicine_id: medicineId,
        stock_status: payload.stockStatus,
        quantity: payload.quantity,
        price: payload.price,
        updated_by: user?.id
      }])
      .select(`
        *,
        medicine:medicines(*)
      `)
      .single();

    if (invErr) throw invErr;
    return invItem as any;
  },

  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('medicine-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('medicine-images')
      .getPublicUrl(filePath);

    return { imageUrl: publicUrl };
  },

  removeMedicine: async (medicineId: string): Promise<void> => {
    const pharmacyId = await getMyPharmacyId();
    const { error } = await supabase
      .from('pharmacy_inventory')
      .delete()
      .eq('pharmacy_id', pharmacyId)
      .eq('medicine_id', medicineId);
    if (error) throw error;
  },

  getPharmacy: async (): Promise<Pharmacy> => {
    const pharmacyId = await getMyPharmacyId();
    const { data, error } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('id', pharmacyId)
      .single();
    if (error) throw error;
    
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
    } as Pharmacy;
  },

  updatePharmacy: async (payload: Partial<Pharmacy>): Promise<Pharmacy> => {
    const pharmacyId = await getMyPharmacyId();
    const { data, error } = await supabase
      .from('pharmacies')
      .update({
        name: payload.name,
        address: payload.address,
        suburb: payload.suburb,
        city: payload.city,
        latitude: payload.latitude,
        longitude: payload.longitude,
        phone: payload.phone,
        email: payload.email,
      })
      .eq('id', pharmacyId)
      .select()
      .single();
    
    if (error) throw error;
    return data as any;
  },

  getAnalytics: async (): Promise<AdminAnalytics> => {
    const pharmacyId = await getMyPharmacyId();
    const { data: items } = await supabase
      .from('pharmacy_inventory')
      .select('stock_status, quantity, reserved_quantity')
      .eq('pharmacy_id', pharmacyId);
    
    const metrics = (items || []).reduce((acc, curr) => {
      acc.total++;
      const available = curr.quantity - (curr.reserved_quantity || 0);
      const effectiveStatus = available <= 0 ? 'out_of_stock' : curr.stock_status;

      if (effectiveStatus === 'in_stock') acc.inStock++;
      else if (effectiveStatus === 'low_stock') acc.lowStock++;
      else if (effectiveStatus === 'out_of_stock') acc.outOfStock++;
      return acc;
    }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });

    return {
      totalMedicines: metrics.total,
      inStock: metrics.inStock,
      lowStock: metrics.lowStock,
      outOfStock: metrics.outOfStock,
      weeklySearches: 0, 
      directionRequests: 0,
      avgRating: 5.0,
    };
  },

  getOrder: async (bookingRef: string) => {
    const pharmacyId = await getMyPharmacyId();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          medicine:medicines(*)
        )
      `)
      .eq('booking_ref', bookingRef.toUpperCase())
      .eq('pharmacy_id', pharmacyId)
      .single();

    if (error) throw new Error('Booking not found for this pharmacy.');
    return data;
  },

  collectOrder: async (bookingRef: string) => {
    const { error } = await supabase.rpc('collect_order', { p_booking_ref: bookingRef.toUpperCase() });
    if (error) throw error;
    return true;
  }
};
