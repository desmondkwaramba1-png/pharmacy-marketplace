import { supabase } from './supabaseClient';
import { CartResponse, CheckoutOptions } from '../types';

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

const single = (val: any) => Array.isArray(val) ? val[0] : val;

const mapCartItem = (item: any) => ({
  id: item.id,
  cartId: item.cart_id,
  pharmacyId: item.pharmacy_id,
  medicineId: item.medicine_id,
  quantity: item.quantity,
  reservedAt: item.reserved_at,
  expiresAt: item.expires_at,
  status: item.status,
  medicine: mapMedicine(single(item.medicine)),
  pharmacy: mapPharmacy(single(item.pharmacy)),
  price: item.price || 0,
  remainingSeconds: item.remainingSeconds || 0,
  isExpired: item.isExpired || false
});

const mapOrderItem = (item: any): any => ({
  id: item.id,
  orderId: item.order_id,
  medicineId: item.medicine_id,
  quantity: item.quantity,
  priceAtBooking: item.price_at_booking,
  medicine: mapMedicine(single(item.medicine))
});

const mapOrder = (order: any): any => ({
  id: order.id,
  bookingRef: order.booking_ref,
  userId: order.user_id,
  pharmacyId: order.pharmacy_id,
  totalAmount: Number(order.total_amount),
  deliveryFee: Number(order.delivery_fee || 0),
  status: order.status,
  paymentMethod: order.payment_method || 'in_person',
  paymentStatus: order.payment_status || 'pending',
  deliveryMethod: order.delivery_method || 'pickup',
  deliveryAddress: order.delivery_address,
  createdAt: order.created_at,
  expiresAt: order.expires_at,
  pharmacy: mapPharmacy(single(order.pharmacy)),
  items: (order.items || []).map(mapOrderItem)
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

let cachedCartId: string | null = null;

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    if (!cachedCartId) {
      cachedCartId = await getOrCreateCartId();
    }
    const cartId = cachedCartId;
    
    // Fetch active reservations with related data
    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        id, quantity, reserved_at, expires_at, status, pharmacy_id, medicine_id,
        medicine:medicines(id, generic_name, brand_name, dosage, form, category, image_url),
        pharmacy:pharmacies(id, name, address, suburb, city, phone)
      `)
      .eq('cart_id', cartId)
      .eq('status', 'reserved');

    if (error) throw error;
    if (!items || items.length === 0) return { items: [], total: 0, itemCount: 0 };

    // Fetch all relevant prices from inventory in ONE batch request instead of a waterfall
    const { data: inventoryData } = await supabase
      .from('pharmacy_inventory')
      .select('pharmacy_id, medicine_id, price')
      .in('pharmacy_id', items.map(i => i.pharmacy_id));

    // Map prices for quick lookup
    const priceMap = new Map();
    inventoryData?.forEach(inv => {
      priceMap.set(`${inv.pharmacy_id}-${inv.medicine_id}`, inv.price);
    });

    const now = new Date();
    const enrichedItems = items.map((item) => {
      const price = priceMap.get(`${item.pharmacy_id}-${item.medicine_id}`) || 0;
      const expiresAt = new Date(item.expires_at);
      const remainingMs = expiresAt.getTime() - now.getTime();
      const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

      return mapCartItem({
        ...item,
        price,
        remainingSeconds,
        isExpired: remainingSeconds <= 0
      });
    });

    const total = enrichedItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: enrichedItems,
      total,
      itemCount
    };
  },

  addToCart: async (pId: string, mId: string, qty: number = 1): Promise<CartResponse> => {
    if (!cachedCartId) {
      cachedCartId = await getOrCreateCartId();
    }
    const cartId = cachedCartId;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Use a high-speed RPC to handle everything in ONE database transaction
    const { error: rpcErr } = await supabase.rpc('add_to_cart_v2', {
      p_cart_id: cartId,
      p_pharmacy_id: pId,
      p_medicine_id: mId,
      p_qty: qty,
      p_expires_at: expiresAt
    });

    if (rpcErr) {
      if (rpcErr.code === 'P0001' || rpcErr.message?.includes('stock')) {
        throw new Error("Insufficient stock or already reserved.");
      }
      throw new Error("Failed to add to cart: " + rpcErr.message);
    }

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

  checkout: async (
    pharmacyId: string,
    options: CheckoutOptions
  ): Promise<{ message: string; bookingRef: string; orderId: string; expiresAt: string; paymentStatus: string; transactionId?: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    const cartId = await getOrCreateCartId();
    const bookingRef = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const DELIVERY_FEE = options.deliveryMethod === 'delivery' ? 5.00 : 0;

    // 1. Get current cart items for this pharmacy
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`*, medicine:medicines(standard_price)`)
      .eq('cart_id', cartId)
      .eq('pharmacy_id', pharmacyId)
      .eq('status', 'reserved');

    if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty for this pharmacy');

    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.medicine?.standard_price || 0) * item.quantity), 0);
    const total = subtotal + DELIVERY_FEE;

    // 2. Create the Order with payment & delivery info
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert([{
        booking_ref: bookingRef,
        user_id: user?.id,
        pharmacy_id: pharmacyId,
        total_amount: total,
        delivery_fee: DELIVERY_FEE,
        status: 'pending',
        payment_method: options.paymentMethod,
        payment_status: 'pending',
        delivery_method: options.deliveryMethod,
        delivery_address: options.deliveryAddress || null,
        delivery_notes: options.deliveryNotes || null,
        expires_at: expiresAt
      }])
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 3. Create Order Items
    await supabase.from('order_items').insert(
      cartItems.map(ci => ({
        order_id: order.id,
        medicine_id: ci.medicine_id,
        quantity: ci.quantity,
        price_at_booking: ci.medicine?.standard_price || 0
      }))
    );

    // 4. Mark cart items as checked_out
    await supabase
      .from('cart_items')
      .update({ status: 'checked_out' })
      .eq('cart_id', cartId)
      .eq('pharmacy_id', pharmacyId);

    // 5. If online payment — call the payment simulation RPC
    let paymentStatus = 'pending';
    let transactionId: string | undefined;

    if (options.paymentMethod === 'online') {
      const { data: payResult } = await supabase.rpc('process_online_payment', {
        p_order_id: order.id,
        p_card_last4: options.cardNumber?.slice(-4) || '0000'
      });

      if (!payResult?.success) {
        throw new Error(payResult?.error || 'Payment failed. Please try again.');
      }
      paymentStatus = 'paid';
      transactionId = payResult.transactionId;
    }

    return {
      message: options.paymentMethod === 'online'
        ? options.deliveryMethod === 'delivery' ? 'Payment confirmed! Delivery on the way.' : 'Payment confirmed! Ready for pickup.'
        : options.deliveryMethod === 'delivery' ? 'Order placed! Pay driver on delivery.' : 'Booking confirmed! Visit pharmacy to collect.',
      bookingRef,
      orderId: order.id,
      expiresAt,
      paymentStatus,
      transactionId
    };
  },

  getOrders: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        pharmacy:pharmacies(name, address),
        items:order_items(
          *,
          medicine:medicines(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapOrder);
  },

  collectOrder: async (bookingRef: string) => {
    const { error } = await supabase.rpc('collect_order', { p_booking_ref: bookingRef });
    if (error) throw error;
    return true;
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
  },

  cleanupExpired: async (): Promise<void> => {
    await supabase.rpc('cleanup_expired_reservations');
  }
};
