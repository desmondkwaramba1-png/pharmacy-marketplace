-- 1. First, remove any duplicate cart items that might prevent the unique constraint from being added
DELETE FROM cart_items
WHERE id NOT IN (
  SELECT min(id)
  FROM cart_items
  GROUP BY cart_id, pharmacy_id, medicine_id
);

-- 2. Add the missing unique constraint
ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_cart_id_pharmacy_id_medicine_id_key 
UNIQUE (cart_id, pharmacy_id, medicine_id);

-- 3. Re-create the RPC just to be absolutely sure it's up to date
CREATE OR REPLACE FUNCTION add_to_cart_v2(
  p_cart_id UUID, 
  p_pharmacy_id UUID, 
  p_medicine_id UUID, 
  p_qty INTEGER, 
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
  -- Upsert the cart item
  INSERT INTO cart_items (cart_id, pharmacy_id, medicine_id, quantity, expires_at, status)
  VALUES (p_cart_id, p_pharmacy_id, p_medicine_id, p_qty, p_expires_at, 'reserved')
  ON CONFLICT (cart_id, pharmacy_id, medicine_id) 
  DO UPDATE SET 
    quantity = cart_items.quantity + EXCLUDED.quantity,
    expires_at = EXCLUDED.expires_at,
    status = 'reserved';

  -- Update the inventory stock in the same transaction
  UPDATE pharmacy_inventory 
  SET reserved_quantity = reserved_quantity + p_qty 
  WHERE pharmacy_id = p_pharmacy_id AND medicine_id = p_medicine_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
