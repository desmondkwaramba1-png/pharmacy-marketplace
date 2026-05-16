import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../api/supabaseClient';
import { toast } from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────
type ReservationStatus = 'pending' | 'collected' | 'expired' | 'cancelled';

interface ReservationItem {
  id: string;
  medicineName: string;
  brandName?: string;
  dosage?: string;
  quantity: number;
  priceAtBooking: number;
}

interface Reservation {
  id: string;
  bookingRef: string;
  status: ReservationStatus;
  totalAmount: number;
  createdAt: string;
  expiresAt: string;
  userId: string | null;
  items: ReservationItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getMyPharmacyId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const pharmacyId = user.user_metadata?.pharmacyId;
  if (!pharmacyId) throw new Error('No pharmacy assigned');
  return pharmacyId;
}

async function fetchReservations(params: {
  status?: ReservationStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<Reservation[]> {
  const pharmacyId = await getMyPharmacyId();

  let query = supabase
    .from('orders')
    .select(`
      id, booking_ref, status, total_amount, created_at, expires_at, user_id,
      order_items(id, quantity, price_at_booking, medicine:medicines(generic_name, brand_name, dosage))
    `)
    .eq('pharmacy_id', pharmacyId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (params.status) query = query.eq('status', params.status);
  if (params.fromDate) query = query.gte('created_at', params.fromDate);
  if (params.toDate) query = query.lte('created_at', params.toDate + 'T23:59:59');

  const { data, error } = await query;
  if (error) throw error;

  let results: Reservation[] = (data || []).map((o: any): Reservation => ({
    id: o.id,
    bookingRef: o.booking_ref,
    status: o.status as ReservationStatus,
    totalAmount: Number(o.total_amount),
    createdAt: o.created_at,
    expiresAt: o.expires_at,
    userId: o.user_id,
    items: (o.order_items || []).map((item: any): ReservationItem => ({
      id: item.id,
      medicineName: item.medicine?.generic_name || 'Unknown',
      brandName: item.medicine?.brand_name,
      dosage: item.medicine?.dosage,
      quantity: item.quantity,
      priceAtBooking: Number(item.price_at_booking),
    })),
  }));

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(r =>
      r.bookingRef.toLowerCase().includes(q) ||
      r.items.some(i => i.medicineName.toLowerCase().includes(q))
    );
  }

  return results;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: '#fef3c7', color: '#D97706', label: '⏳ Pending' },
    collected: { bg: '#D1FAE5', color: '#059669', label: '✅ Collected' },
    expired:   { bg: '#FEE2E2', color: '#DC2626', label: '⏰ Expired' },
    cancelled: { bg: '#F3F4F6', color: '#6B7280', label: '✕ Cancelled' },
  };
  const s = map[status] || map.expired;
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function exportCSV(reservations: Reservation[]) {
  const rows = reservations.flatMap(r =>
    r.items.map(item => [
      r.bookingRef,
      r.status,
      item.medicineName,
      item.dosage || '',
      item.quantity,
      item.priceAtBooking.toFixed(2),
      r.totalAmount.toFixed(2),
      r.userId ? 'Registered' : 'Guest',
      new Date(r.createdAt).toLocaleString(),
      new Date(r.expiresAt).toLocaleString(),
    ])
  );
  const headers = ['Ref #', 'Status', 'Medicine', 'Dosage', 'Qty', 'Unit Price', 'Total', 'Patient', 'Created', 'Expires'];
  const csv = [headers, ...rows].map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

const TABS: { label: string; value: ReservationStatus | 'all' }[] = [
  { label: 'Active', value: 'pending' },
  { label: 'Completed', value: 'collected' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'All', value: 'all' },
];

// ── Confirm Dialog ────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmColor?: string;
}
function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = '#DC2626' }: ConfirmDialogProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onCancel}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 28, maxWidth: 360, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 20 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: confirmColor, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReservationsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<ReservationStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: string; reservation: Reservation } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: reservations = [], isLoading, refetch } = useQuery({
    queryKey: ['reservations', activeTab, search, fromDate, toDate],
    queryFn: () => fetchReservations({
      status: activeTab === 'all' ? undefined : activeTab,
      search: search || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const collectMut = useMutation({
    mutationFn: async (bookingRef: string) => {
      const { error } = await supabase.rpc('collect_order', { p_booking_ref: bookingRef.toUpperCase() });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Marked as collected!'); qc.invalidateQueries({ queryKey: ['reservations'] }); },
    onError: (e: any) => toast.error(e.message || 'Failed'),
  });

  const cancelMut = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Reservation cancelled'); qc.invalidateQueries({ queryKey: ['reservations'] }); },
    onError: (e: any) => toast.error(e.message || 'Failed'),
  });

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'collect') collectMut.mutate(confirmAction.reservation.bookingRef);
    if (confirmAction.type === 'cancel') cancelMut.mutate(confirmAction.reservation.id);
    setConfirmAction(null);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 4 }}>📋 Reservations</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Manage all patient reservations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => exportCSV(reservations)}
            style={{
              padding: '10px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#475569',
            }}
          >⬇ Export CSV</button>
          <button
            onClick={() => refetch()}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #0284a8, #02C39A)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >↻ Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4, width: 'fit-content', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab.value ? '#fff' : 'transparent',
              color: activeTab === tab.value ? '#0284a8' : '#64748b',
              boxShadow: activeTab === tab.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>🔍</span>
          <input
            type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by ref or medicine…"
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8,
              border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>From</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, outline: 'none' }} />
          <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>To</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, outline: 'none' }} />
          {(fromDate || toDate) && (
            <button onClick={() => { setFromDate(''); setToDate(''); }}
              style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14, fontWeight: 500 }}>
          {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ height: 80, borderRadius: 12, background: '#f1f5f9' }} />)}
        </div>
      ) : reservations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#64748b' }}>No reservations found</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Try a different tab or filter</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reservations.map(res => {
            const isExpanded = expandedId === res.id;
            const isPending = res.status === 'pending';
            const timeLabel = isPending
              ? `Expires ${new Date(res.expiresAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}`
              : `${new Date(res.createdAt).toLocaleDateString('en-ZW', { day: '2-digit', month: 'short', year: 'numeric' })}`;

            return (
              <div key={res.id} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
              }}>
                {/* Row header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : res.id)}
                  style={{
                    padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', flexWrap: 'wrap',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0284a8', minWidth: 100 }}>{res.bookingRef}</div>
                  <StatusBadge status={res.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.items.map(i => `${i.medicineName}${i.dosage ? ` ${i.dosage}` : ''} ×${i.quantity}`).join(', ')}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {res.userId ? '👤 Registered Patient' : '👤 Guest'} · {timeLabel}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    ${res.totalAmount.toFixed(2)}
                  </div>
                  <span style={{ fontSize: 16, color: '#94a3b8', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▾
                  </span>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 18px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ paddingTop: 14, marginBottom: 14 }}>
                      {res.items.map(item => (
                        <div key={item.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0', borderBottom: '1px solid #f8fafc',
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{item.medicineName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                              {[item.brandName, item.dosage].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>×{item.quantity}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>${item.priceAtBooking.toFixed(2)} ea</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                      <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Created</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(res.createdAt).toLocaleString('en-ZW')}</div>
                      </div>
                      <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Expires</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(res.expiresAt).toLocaleString('en-ZW')}</div>
                      </div>
                    </div>

                    {isPending && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setConfirmAction({ type: 'collect', reservation: res })}
                          style={{
                            flex: 2, padding: '10px', borderRadius: 10, border: 'none',
                            background: 'linear-gradient(135deg, #059669, #02C39A)',
                            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                          }}
                        >✅ Mark as Collected</button>
                        <button
                          onClick={() => setConfirmAction({ type: 'cancel', reservation: res })}
                          style={{
                            flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #FEE2E2',
                            background: '#fff', color: '#DC2626', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                          }}
                        >✕ Cancel</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <ConfirmDialog
          message={
            confirmAction.type === 'collect'
              ? `Mark reservation ${confirmAction.reservation.bookingRef} as collected? This cannot be undone.`
              : `Cancel reservation ${confirmAction.reservation.bookingRef}? The patient will be notified.`
          }
          confirmLabel={confirmAction.type === 'collect' ? 'Collect' : 'Cancel Reservation'}
          confirmColor={confirmAction.type === 'collect' ? '#059669' : '#DC2626'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
