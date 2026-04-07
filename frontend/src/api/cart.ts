import { supabase } from './supabaseClient';
import { CartResponse } from '../types';

// Mapping helpers to convert Supabase snake_case to Frontend camelCase
const mapMedicine = (m: any) => m ? ({
  id: m.id,
  genericName: m.generic_name,
  brandName: m.brand_name,
  dosage: m.dosage,
  form: m.form,
  category: m.category,
  description: m.description,
  standardPrice: m.standard_price,
  imageUrl: m.image_url,
}) : null;

const mapPharmacy = (p: any) => p ? ({
  id: p.id,
  name: p.name,
  address: p.address,
  suburb: p.suburb,
  city: p.city,
  phone: p.phone,
  latitude: p.latitude,
  longitude: p.longitude,
  isActive: p.is_active ?? true
}) : null;

const mapCartItem = (item: any) => ({
  id: item.id,
  cartId: item.cart_id,
  pharmacyId: item.pharmacy_id,
  medicineId: item.medicine_id,
  quantity: item.quantity,
  reservedAt: item.reserved_at,
  expiresAt: item.expires_at,
  status: item.status,
  medicine: mapMedicine(item.medicine),
  pharmacy: mapPharmacy(item.pharmacy),
  price: item.price || 0,
  remainingSeconds: item.remainingSeconds || 0,
  isExpired: item.isExpired || false
});

// Helper to get or create a cart ID for the user/session
async function getOrCreateCartId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = localStorage.getItem('medifind_session_id') || crypto.randomUUID();
  localStorage.setItem('medifind_session_id', sessionId);

  // 1. Try to find cart by user ID
  if (user) {
    const { data: userCart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (userCart) return userCart.id;
  }

  // 2. Try to find cart by session ID
  const { data: sessionCart } = await supabase
    .from('carts')
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (sessionCart) {
    // If user is logged in, link the session cart to them
    if (user) {
      await supabase.from('carts').update({ user_id: user.id }).eq('id', sessionCart.id);
    }
    return sessionCart.id;
  }

  // 3. Create new cart
  const { data: newCart, error } = await supabase
    .from('carts')
    .insert([{ user_id: user?.id, session_id: sessionId }])
    .select()
    .single();

  if (error) throw error;
  return newCart.id;
}

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const cartId = await getOrCreateCartId();
    
    // Fetch active reservations
    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        medicine:medicines(*),
        pharmacy:pharmacies(*)
      `)
      .eq('cart_id', cartId)
      .eq('status', 'reserved');

    if (error) throw error;

    // Fetch prices from inventory and calculate expiration
    const enrichedItems = await Promise.all((items || []).map(async (item) => {
      const { data: inv } = await supabase
        .from('pharmacy_inventory')
        .select('price')
        .eq('pharmacy_id', item.pharmacy_id)
        .eq('medicine_id', item.medicine_id)
        .single();

      const now = new Date();
      const expiresAt = new Date(item.expires_at);
      const remainingMs = expiresAt.getTime() - now.getTime();
      const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

      return mapCartItem({
        ...item,
        price: inv?.price || 0,
        remainingSeconds,
        isExpired: remainingSeconds <= 0
      });
    }));

    const total = enrichedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: enrichedItems,
      total,
      itemCount
    };
  },

  addToCart: async (pId: string, mId: string, qty: number = 1): Promise<CartResponse> => {
    const cartId = await getOrCreateCartId();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('pharmacy_id', pId)
      .eq('medicine_id', mId)
      .eq('status', 'reserved')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ 
          quantity: existing.quantity + qty, 
          expires_at: expiresAt 
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert([{
          cart_id: cartId,
          pharmacy_id: pId,
          medicine_id: mId,
          quantity: qty,
          expires_at: expiresAt
        }]);
    }

    await supabase.rpc('increment_reserved_quantity', {
      p_pharmacy_id: pId,
      p_medicine_id: mId,
      p_qty: qty
    });

    return cartApi.getCart();
  },

  removeFromCart: async (cartItemId: string): Promise<CartResponse> => {
    const { data: item } = await supabase
      .from('cart_items')
      .select('*')
      .eq('id', cartItemId)
      .single();

    if (item && item.status === 'reserved') {
      await supabase.rpc('release_reserved_quantity', {
        p_pharmacy_id: item.pharmacy_id,
        p_medicine_id: item.medicine_id,
        p_qty: item.quantity
      });
    }

    await supabase.from('cart_items').delete().eq('id', cartItemId);
    return cartApi.getCart();
  },

  checkout: async (): Promise<{ message: string; bookingRef: string }> => {
    const cartId = await getOrCreateCartId();
    const bookingRef = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: items } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('status', 'reserved');

    if (!items || items.length === 0) throw new Error('Cart is empty');

    for (const item of items) {
      await supabase.from('cart_items').update({ status: 'checked_out' }).eq('id', item.id);

      await supabase.rpc('checkout_inventory', {
        p_pharmacy_id: item.pharmacy_id,
        p_medicine_id: item.medicine_id,
        p_qty: item.quantity
      });
    }

    return { message: 'Checkout successful', bookingRef };
  },

  getHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { items: [] };

    const { data: carts } = await supabase.from('carts').select('id').eq('user_id', user.id);
    const cartIds = carts?.map(c => c.id) || [];

    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        medicine:medicines(*),
        pharmacy:pharmacies(*)
      `)
      .in('cart_id', cartIds)
      .eq('status', 'checked_out')
      .order('reserved_at', { ascending: false });

    if (error) throw error;
    return { items: (items || []).map(mapCartItem) };
  }
};
