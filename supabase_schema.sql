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
