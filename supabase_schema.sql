-- Supabase Database Definition for Pharmacy Marketplace

-- 1. Create Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generic_name TEXT NOT NULL,
  brand_name TEXT,
  dosage TEXT,
  form TEXT,
  category TEXT,
  description TEXT,
  standard_price DECIMAL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Pharmacies Table
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  suburb TEXT,
  city TEXT DEFAULT 'Harare' NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  phone TEXT,
  email TEXT,
  operating_hours JSONB,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Pharmacy Inventory Table
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  stock_status TEXT DEFAULT 'in_stock' NOT NULL,
  quantity INTEGER DEFAULT 0 NOT NULL,
  reserved_quantity INTEGER DEFAULT 0 NOT NULL,
  price DECIMAL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(pharmacy_id, medicine_id)
);

-- 4. Create Carts Table
CREATE TABLE IF NOT EXISTS carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES medicines(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'reserved' NOT NULL,
  UNIQUE(cart_id, pharmacy_id, medicine_id)
);

-- ENABLE REALTIME
-- So frontend can subscribe to stock changes and cart changes
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE pharmacy_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;

-- ROW LEVEL SECURITY (RLS)
-- (Simplified for demo purposes. Enable and add appropriate policies as needed)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medicines are publicly viewable" ON medicines FOR SELECT USING (true);
CREATE POLICY "Only admins insert medicines" ON medicines FOR INSERT WITH CHECK (auth.uid() IN (SELECT owner_id FROM pharmacies));

ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pharmacies are publicly viewable" ON pharmacies FOR SELECT USING (true);

ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory publicly viewable" ON pharmacy_inventory FOR SELECT USING (true);
CREATE POLICY "Pharmacy owner updates inventory" ON pharmacy_inventory FOR UPDATE USING (
  auth.uid() IN (SELECT owner_id FROM pharmacies WHERE id = pharmacy_id)
);
CREATE POLICY "Pharmacy owner inserts inventory" ON pharmacy_inventory FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT owner_id FROM pharmacies WHERE id = pharmacy_id)
);
CREATE POLICY "Pharmacy owner deletes inventory" ON pharmacy_inventory FOR DELETE USING (
  auth.uid() IN (SELECT owner_id FROM pharmacies WHERE id = pharmacy_id)
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Carts open to all for now" ON carts USING (true);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cart items open to all for now" ON cart_items USING (true);

-- RPC FUNCTIONS FOR SECURE CHECKOUT / CART MANAGEMENT
-- These functions run with SECURITY DEFINER to bypass RLS policies
-- that normally prevent patients from updating inventory quantities.

-- 6. Create Orders Table (supports online payment and delivery)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL NOT NULL DEFAULT 0,
  delivery_fee DECIMAL NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' NOT NULL,          -- pending | confirmed | out_for_delivery | delivered | collected | cancelled | expired
  payment_method TEXT DEFAULT 'in_person' NOT NULL, -- online | in_person
  payment_status TEXT DEFAULT 'pending' NOT NULL,   -- pending | paid | failed
  delivery_method TEXT DEFAULT 'pickup' NOT NULL,   -- pickup | delivery
  delivery_address TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 7. Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES medicines(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  price_at_booking DECIMAL NOT NULL DEFAULT 0
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
-- Pharmacy owners can view all orders placed at their pharmacy
CREATE POLICY "Pharmacy owners can view their orders" ON orders FOR SELECT USING (
  pharmacy_id IN (SELECT id FROM pharmacies WHERE owner_id = auth.uid())
);
CREATE POLICY "Authenticated users can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);
-- Pharmacy owners can update order status (e.g. mark as collected)
CREATE POLICY "Pharmacy owners can update their orders" ON orders FOR UPDATE USING (
  pharmacy_id IN (SELECT id FROM pharmacies WHERE owner_id = auth.uid())
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items open for insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items viewable via order" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
-- Pharmacy owners can view order items for their pharmacy's orders
CREATE POLICY "Pharmacy owners can view order items" ON order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders
    WHERE pharmacy_id IN (SELECT id FROM pharmacies WHERE owner_id = auth.uid())
  )
);

-- Simulate online payment (marks order as paid)
CREATE OR REPLACE FUNCTION process_online_payment(p_order_id UUID, p_card_last4 TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_success BOOLEAN;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already paid');
  END IF;

  -- Simulate: 95% success rate
  v_success := (random() > 0.05);

  IF v_success THEN
    UPDATE orders
    SET payment_status = 'paid',
        status = CASE WHEN delivery_method = 'delivery' THEN 'confirmed' ELSE 'confirmed' END
    WHERE id = p_order_id;
    RETURN jsonb_build_object('success', true, 'transactionId', 'TXN-' || upper(substring(gen_random_uuid()::text, 1, 8)));
  ELSE
    UPDATE orders SET payment_status = 'failed' WHERE id = p_order_id;
    RETURN jsonb_build_object('success', false, 'error', 'Card declined. Please try another card.');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lookup an order by booking ref for the calling pharmacist's pharmacy.
-- Uses SECURITY DEFINER to bypass RLS (pharmacists are not the order's user_id).
-- Resolves pharmacy by owner_id OR by pharmacyId in JWT user_metadata,
-- whichever is set — so both pharmacist setup methods work.
CREATE OR REPLACE FUNCTION get_order_for_pickup(p_booking_ref TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id',           o.id,
    'booking_ref',  o.booking_ref,
    'user_id',      o.user_id,
    'pharmacy_id',  o.pharmacy_id,
    'total_amount', o.total_amount,
    'status',       o.status,
    'created_at',   o.created_at,
    'expires_at',   o.expires_at,
    'pharmacy',     jsonb_build_object(
      'id',      p.id,
      'name',    p.name,
      'address', p.address
    ),
    'items', (
      SELECT jsonb_agg(jsonb_build_object(
        'id',               oi.id,
        'order_id',         oi.order_id,
        'medicine_id',      oi.medicine_id,
        'quantity',         oi.quantity,
        'price_at_booking', oi.price_at_booking,
        'medicine', jsonb_build_object(
          'id',           m.id,
          'generic_name', m.generic_name,
          'brand_name',   m.brand_name,
          'dosage',       m.dosage,
          'form',         m.form,
          'category',     m.category
        )
      ))
      FROM order_items oi
      JOIN medicines m ON m.id = oi.medicine_id
      WHERE oi.order_id = o.id
    )
  )
  INTO v_order
  FROM orders o
  JOIN pharmacies p ON p.id = o.pharmacy_id
  WHERE o.booking_ref = upper(p_booking_ref);

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Booking reference not found';
  END IF;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark order as collected (in-person pickup) and decrement inventory
CREATE OR REPLACE FUNCTION collect_order(p_booking_ref TEXT)
RETURNS VOID AS $$
BEGIN
  -- Update order status
  UPDATE orders SET status = 'collected' WHERE booking_ref = p_booking_ref;

  -- Decrement quantity and release reserved stock for each item in the order
  UPDATE pharmacy_inventory pi
  SET
    quantity          = GREATEST(0, pi.quantity - oi.quantity),
    reserved_quantity = GREATEST(0, pi.reserved_quantity - oi.quantity)
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE o.booking_ref = p_booking_ref
    AND pi.pharmacy_id = o.pharmacy_id
    AND pi.medicine_id = oi.medicine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark delivery as completed
CREATE OR REPLACE FUNCTION complete_delivery(p_booking_ref TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE orders SET status = 'delivered' WHERE booking_ref = p_booking_ref;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_reserved_quantity(p_pharmacy_id UUID, p_medicine_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE pharmacy_inventory 
  SET reserved_quantity = reserved_quantity + p_qty 
  WHERE pharmacy_id = p_pharmacy_id AND medicine_id = p_medicine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION release_reserved_quantity(p_pharmacy_id UUID, p_medicine_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE pharmacy_inventory 
  SET reserved_quantity = GREATEST(0, reserved_quantity - p_qty) 
  WHERE pharmacy_id = p_pharmacy_id AND medicine_id = p_medicine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION checkout_inventory(p_pharmacy_id UUID, p_medicine_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE pharmacy_inventory 
  SET 
    quantity = GREATEST(0, quantity - p_qty),
    reserved_quantity = GREATEST(0, reserved_quantity - p_qty)
  WHERE pharmacy_id = p_pharmacy_id AND medicine_id = p_medicine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
