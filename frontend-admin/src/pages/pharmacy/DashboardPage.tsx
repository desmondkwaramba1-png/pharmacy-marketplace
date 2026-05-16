import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../api/supabaseClient';
import { toast } from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  activeReservations: number;
  completedToday: number;
  revenueToday: number;
  lowStockItems: number;
}

interface ActiveReservation {
  id: string;
  bookingRef: string;
  medicineName: string;
  dosage: string;
  quantity: number;
  reservedAt: string;
  expiresAt: string;
  status: string;
  totalAmount: number;
  userId: string | null;
}

interface LowStockItem {
  id: string;
  genericName: string;
  dosage?: string;
  quantity: number;
  reservedQuantity: number;
  stockStatus: string;
}

interface ActivityEvent {
  id: string;
  type: string;
  label: string;
  timestamp: string;
  bookingRef?: string;
  amount?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getMyPharmacyId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const pharmacyId = user.user_metadata?.pharmacyId;
  if (!pharmacyId) throw new Error('No pharmacy assigned');
  return pharmacyId;
}

function useCountdown(expiresAt: string) {
  const [secs, setSecs] = useState(() => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
  useEffect(() => {
    const id = setInterval(() => {
      setSecs(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return secs;
}

function CountdownCell({ expiresAt }: { expiresAt: string }) {
  const secs = useCountdown(expiresAt);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  const isUrgent = secs < 180;
  const expired = secs <= 0;
  return (
    <span style={{
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      color: expired ? '#DC2626' : isUrgent ? '#D97706' : '#0f172a',
      background: expired ? '#FEE2E2' : isUrgent ? '#FEF3C7' : 'transparent',
      padding: expired || isUrgent ? '2px 8px' : undefined,
      borderRadius: 6,
    }}>
      {expired ? 'EXPIRED' : `${mins}:${String(s).padStart(2, '0')}`}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: '#fef3c7', color: '#D97706', label: 'Pending' },
    confirmed: { bg: '#e0f4f8', color: '#0284a8', label: 'Confirmed' },
    collected: { bg: '#D1FAE5', color: '#059669', label: 'Collected' },
    expired:   { bg: '#FEE2E2', color: '#DC2626', label: 'Expired' },
    cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
}

// ── Data fetchers ─────────────────────────────────────────────────────────────
async function fetchDashboardData() {
  const pharmacyId = await getMyPharmacyId();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [activeRes, completedRes, inventoryRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, booking_ref, total_amount, created_at, expires_at, status, user_id, order_items(quantity, price_at_booking, medicine:medicines(generic_name, dosage))')
      .eq('pharmacy_id', pharmacyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),

    supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('pharmacy_id', pharmacyId)
      .eq('status', 'collected')
      .gte('created_at', todayStart.toISOString()),

    supabase
      .from('pharmacy_inventory')
      .select('id, quantity, reserved_quantity, stock_status, medicine:medicines(generic_name, dosage)')
      .eq('pharmacy_id', pharmacyId)
      .in('stock_status', ['low_stock', 'out_of_stock']),
  ]);

  const activeOrders: ActiveReservation[] = (activeRes.data || []).map((o: any) => {
    const firstItem = o.order_items?.[0];
    return {
      id: o.id,
      bookingRef: o.booking_ref,
      medicineName: firstItem?.medicine?.generic_name || 'Unknown',
      dosage: firstItem?.medicine?.dosage || '',
      quantity: firstItem?.quantity || 0,
      reservedAt: o.created_at,
      expiresAt: o.expires_at,
      status: o.status,
      totalAmount: Number(o.total_amount),
      userId: o.user_id,
    };
  });

  const completedToday = completedRes.data?.length || 0;
  const revenueToday = (completedRes.data || []).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  const lowStock: LowStockItem[] = (inventoryRes.data || []).map((item: any) => ({
    id: item.id,
    genericName: item.medicine?.generic_name || 'Unknown',
    dosage: item.medicine?.dosage || '',
    quantity: item.quantity,
    reservedQuantity: item.reserved_quantity || 0,
    stockStatus: item.stock_status,
  }));

  const stats: DashboardStats = {
    activeReservations: activeOrders.length,
    completedToday,
    revenueToday,
    lowStockItems: lowStock.length,
  };

  return { stats, activeOrders, lowStock };
}

async function fetchRecentActivity(): Promise<ActivityEvent[]> {
  const pharmacyId = await getMyPharmacyId();
  const { data } = await supabase
    .from('orders')
    .select('id, booking_ref, status, total_amount, created_at')
    .eq('pharmacy_id', pharmacyId)
    .order('created_at', { ascending: false })
    .limit(10);

  return (data || []).map((o: any): ActivityEvent => {
    const label =
      o.status === 'collected' ? `Order ${o.booking_ref} collected — $${Number(o.total_amount).toFixed(2)}` :
      o.status === 'pending' ? `New reservation ${o.booking_ref}` :
      o.status === 'expired' ? `Reservation ${o.booking_ref} expired` :
      `Order ${o.booking_ref} ${o.status}`;
    return {
      id: o.id,
      type: o.status,
      label,
      timestamp: o.created_at,
      bookingRef: o.booking_ref,
      amount: Number(o.total_amount),
    };
  });
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  gradient: string;
  iconBg: string;
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
}
function StatCard({ gradient, icon, iconBg, label, value, sub, valueColor }: StatCardProps) {
  return (
    <div style={{
      background: gradient,
      borderRadius: 14,
      padding: '20px 22px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>{icon}</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: valueColor || '#0f172a', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-main'],
    queryFn: fetchDashboardData,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: fetchRecentActivity,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Collect mutation
  const collectMut = useMutation({
    mutationFn: async (bookingRef: string) => {
      const { error } = await supabase.rpc('collect_order', { p_booking_ref: bookingRef.toUpperCase() });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Order marked as collected!');
      qc.invalidateQueries({ queryKey: ['dashboard-main'] });
      qc.invalidateQueries({ queryKey: ['dashboard-activity'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to collect order'),
  });

  // Cancel mutation
  const cancelMut = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reservation cancelled');
      qc.invalidateQueries({ queryKey: ['dashboard-main'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to cancel'),
  });

  const stats = data?.stats;
  const activeOrders = data?.activeOrders || [];
  const lowStock = data?.lowStock || [];

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 4 }}>
          {greeting}, {user?.firstName || user?.email?.split('@')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          {user?.pharmacy?.name || 'Pharmacy'} · {new Date().toLocaleDateString('en-ZW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ height: 110, borderRadius: 14, background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard
            gradient="linear-gradient(135deg, #e0f4f8, #b3e5f0)"
            iconBg="rgba(2,132,168,0.15)"
            icon="📋"
            label="Active Reservations"
            value={stats?.activeReservations ?? 0}
            valueColor="#0284a8"
            sub="Pending collection"
          />
          <StatCard
            gradient="linear-gradient(135deg, #EDE9FE, #DDD6FE)"
            iconBg="rgba(124,58,237,0.12)"
            icon="✅"
            label="Completed Today"
            value={stats?.completedToday ?? 0}
            valueColor="#7C3AED"
            sub="Orders fulfilled"
          />
          <StatCard
            gradient="linear-gradient(135deg, #D1FAE5, #A7F3D0)"
            iconBg="rgba(2,195,154,0.15)"
            icon="💰"
            label="Revenue Today"
            value={`$${(stats?.revenueToday ?? 0).toFixed(2)}`}
            valueColor="#059669"
            sub="USD collected"
          />
          <StatCard
            gradient="linear-gradient(135deg, #FEF3C7, #FDE68A)"
            iconBg="rgba(217,119,6,0.12)"
            icon="⚠️"
            label="Low Stock Items"
            value={stats?.lowStockItems ?? 0}
            valueColor="#D97706"
            sub="Needs attention"
          />
        </div>
      )}

      {/* Two-column grid: active reservations + alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(260px, 340px)', gap: 20, marginBottom: 24 }}>
        {/* Active reservations table */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Active Reservations</h2>
            <button
              onClick={() => refetch()}
              style={{
                fontSize: 12, color: '#0284a8', fontWeight: 600, background: '#e0f4f8',
                border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              }}
            >↻ Refresh</button>
          </div>

          {activeOrders.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
              <div style={{ fontWeight: 600 }}>No active reservations</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>New reservations will appear here</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Ref #', 'Medicine', 'Qty', 'Reserved', 'Expires In', 'Status', 'Actions'].map(col => (
                      <th key={col} style={{
                        padding: '10px 14px', textAlign: 'left',
                        fontWeight: 700, color: '#64748b', fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((res, idx) => (
                    <tr key={res.id} style={{
                      borderTop: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                    }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0284a8', whiteSpace: 'nowrap' }}>
                        {res.bookingRef}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{res.medicineName}</div>
                        {res.dosage && <div style={{ fontSize: 11, color: '#94a3b8' }}>{res.dosage}</div>}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{res.quantity}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(res.reservedAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <CountdownCell expiresAt={res.expiresAt} />
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <StatusBadge status={res.status} />
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => collectMut.mutate(res.bookingRef)}
                            disabled={collectMut.isPending}
                            style={{
                              padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                              background: '#D1FAE5', color: '#059669', border: '1px solid #A7F3D0',
                              cursor: 'pointer',
                            }}
                          >Collect</button>
                          <button
                            onClick={() => { if (confirm(`Cancel reservation ${res.bookingRef}?`)) cancelMut.mutate(res.id); }}
                            style={{
                              padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                              background: 'transparent', color: '#DC2626', border: 'none',
                              cursor: 'pointer',
                            }}
                          >Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Low stock alerts */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>⚠️ Stock Alerts</h2>
            </div>
            <div style={{ padding: '10px 0', maxHeight: 280, overflowY: 'auto' }}>
              {lowStock.length === 0 ? (
                <div style={{ padding: '24px 18px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  All items are well-stocked ✓
                </div>
              ) : lowStock.map(item => (
                <div key={item.id} style={{
                  padding: '10px 18px',
                  borderBottom: '1px solid #f8fafc',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: item.stockStatus === 'out_of_stock' ? '#DC2626' : '#D97706',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.genericName} {item.dosage}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {item.quantity} units · {item.reservedQuantity} reserved
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                    background: item.stockStatus === 'out_of_stock' ? '#FEE2E2' : '#FEF3C7',
                    color: item.stockStatus === 'out_of_stock' ? '#DC2626' : '#D97706',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.stockStatus === 'out_of_stock' ? 'OUT' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            flex: 1,
          }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Recent Activity</h2>
            </div>
            <div style={{ padding: '10px 0', maxHeight: 320, overflowY: 'auto' }}>
              {(activity || []).length === 0 ? (
                <div style={{ padding: '24px 18px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No recent activity
                </div>
              ) : (activity || []).map(ev => (
                <div key={ev.id} style={{
                  padding: '10px 18px',
                  borderBottom: '1px solid #f8fafc',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    background: ev.type === 'collected' ? '#D1FAE5' : ev.type === 'pending' ? '#e0f4f8' : ev.type === 'expired' ? '#FEE2E2' : '#F3F4F6',
                  }}>
                    {ev.type === 'collected' ? '✅' : ev.type === 'pending' ? '📋' : ev.type === 'expired' ? '⏰' : '❌'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{ev.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {new Date(ev.timestamp).toLocaleString('en-ZW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
