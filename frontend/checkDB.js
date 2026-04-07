import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dofpjpyocluaegmgncyx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZnBqcHlvY2x1YWVnbWduY3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMDA1MTgsImV4cCI6MjA5MDc3NjUxOH0.xh_LGSmQet8DuMd26OH3VNsCO7tS0yo7H7k5i7rBQsk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: carts, error: e1 } = await supabase.from('carts').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Recent Carts:', carts, e1);
  
  const { data: cartItems, error: e2 } = await supabase.from('cart_items').select('*').order('reserved_at', { ascending: false }).limit(5);
  console.log('Recent Cart Items:', cartItems, e2);
}

check();
