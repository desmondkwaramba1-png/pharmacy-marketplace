import React, { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/auth';
import { useDebounce } from '../../hooks/useDebounce';
import type { InventoryItem, StockStatus } from '../../types';
import { toast } from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    in_stock:    { bg: '#D1FAE5', color: '#059669', label: 'In Stock' },
    low_stock:   { bg: '#FEF3C7', color: '#D97706', label: 'Low Stock' },
    out_of_stock:{ bg: '#FEE2E2', color: '#DC2626', label: 'Out of Stock' },
  };
  const s = map[status] || map.out_of_stock;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
}

function exportCSV(items: InventoryItem[]) {
  const headers = ['Name', 'Brand', 'Dosage', 'Form', 'Status', 'Quantity', 'Reserved', 'Available', 'Price USD', 'Last Updated'];
  const rows = items.map(i => [
    i.medicine.genericName,
    i.medicine.brandName || '',
    i.medicine.dosage || '',
    i.medicine.form || '',
    i.stockStatus,
    i.quantity,
    i.reservedQuantity,
    i.availableQuantity,
    i.price ?? '',
    new Date(i.lastUpdated).toLocaleString(),
  ]);
  const csv = [headers, ...rows].map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
interface EditModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSave: (payload: { stockStatus: string; quantity: number; price?: number }) => void;
  isSaving: boolean;
}
function EditModal({ item, onClose, onSave, isSaving }: EditModalProps) {
  const [stockStatus, setStockStatus] = useState(item.stockStatus);
  const [quantity, setQuantity] = useState(item.quantity);
  const [price, setPrice] = useState(item.price?.toString() ?? '');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20, color: '#0f172a' }}>
          Edit — {item.medicine.genericName} {item.medicine.dosage}
        </h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[
            { v: 'in_stock', label: '✓ In Stock', bg: '#D1FAE5', color: '#059669' },
            { v: 'low_stock', label: '⚠ Low', bg: '#FEF3C7', color: '#D97706' },
            { v: 'out_of_stock', label: '✕ Out', bg: '#FEE2E2', color: '#DC2626' },
          ].map(opt => (
            <button
              key={opt.v}
              onClick={() => setStockStatus(opt.v as StockStatus)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: stockStatus === opt.v ? `2px solid ${opt.color}` : '2px solid #e2e8f0',
                background: stockStatus === opt.v ? opt.bg : '#fff',
                color: stockStatus === opt.v ? opt.color : '#64748b',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{opt.label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Total Quantity</label>
            <input
              type="number" min={0} value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                fontSize: 15, fontWeight: 600, outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Price (USD)</label>
            <input
              type="number" step="0.01" min={0} value={price} placeholder="0.00"
              onChange={e => setPrice(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                fontSize: 15, fontWeight: 600, outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            onClick={() => onSave({ stockStatus, quantity, price: price ? parseFloat(price) : undefined })}
            disabled={isSaving}
            style={{
              flex: 2, padding: '11px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #0284a8, #02C39A)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >{isSaving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Medicine Modal ────────────────────────────────────────────────────────
interface AddModalProps { onClose: () => void; onSave: (data: any, img: File | null) => void; isSaving: boolean; }
function AddMedicineModal({ onClose, onSave, isSaving }: AddModalProps) {
  const [form, setForm] = useState({
    genericName: '', brandName: '', dosage: '', form: 'tablet',
    category: '', stockStatus: 'in_stock', quantity: 0, price: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      overflowY: 'auto',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 500,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', margin: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20, color: '#0f172a' }}>
          Add Medicine to Inventory
        </h2>

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>Generic Name *</label>
            <input style={inputStyle} value={form.genericName} onChange={e => set('genericName', e.target.value)} placeholder="e.g. Paracetamol" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Brand Name</label>
              <input style={inputStyle} value={form.brandName} onChange={e => set('brandName', e.target.value)} placeholder="e.g. Panadol" />
            </div>
            <div>
              <label style={labelStyle}>Dosage</label>
              <input style={inputStyle} value={form.dosage} onChange={e => set('dosage', e.target.value)} placeholder="500mg" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Form</label>
              <select style={inputStyle} value={form.form} onChange={e => set('form', e.target.value)}>
                {['tablet','capsule','syrup','injection','cream','inhaler','powder'].map(f => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select…</option>
                {['Painkiller','Antibiotic','Antidiabetic','Antihypertensive','Antimalarial','Supplement','Antacid','Bronchodilator','Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Stock Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { v: 'in_stock', label: '✓ In Stock', color: '#059669', bg: '#D1FAE5' },
                { v: 'low_stock', label: '⚠ Low', color: '#D97706', bg: '#FEF3C7' },
                { v: 'out_of_stock', label: '✕ Out', color: '#DC2626', bg: '#FEE2E2' },
              ].map(opt => (
                <button key={opt.v} type="button" onClick={() => set('stockStatus', opt.v)}
                  style={{
                    flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    border: form.stockStatus === opt.v ? `2px solid ${opt.color}` : '2px solid #e2e8f0',
                    background: form.stockStatus === opt.v ? opt.bg : '#fff',
                    color: form.stockStatus === opt.v ? opt.color : '#64748b', cursor: 'pointer',
                  }}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Quantity</label>
              <input style={inputStyle} type="number" min={0} value={form.quantity} onChange={e => set('quantity', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>Price (USD)</label>
              <input style={inputStyle} type="number" step="0.01" min={0} value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Medicine Image (optional)</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
              style={{ ...inputStyle, padding: '8px 12px', fontSize: 12 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (form.genericName.trim()) onSave(form, imageFile); }}
            disabled={isSaving || !form.genericName.trim()}
            style={{
              flex: 2, padding: '11px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #0284a8, #02C39A)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              opacity: !form.genericName.trim() ? 0.6 : 1,
            }}
          >{isSaving ? 'Adding…' : 'Add Medicine'}</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
  fontSize: 14, outline: 'none', background: '#fff',
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showAdd, setShowAdd] = useState(() => searchParams.get('action') === 'add');
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory', activeFilter, debouncedSearch],
    queryFn: () => adminApi.getInventory({ status: activeFilter || undefined, q: debouncedSearch || undefined }),
    staleTime: 2 * 60 * 1000,
  });

  const updateMut = useMutation({
    mutationFn: ({ medicineId, payload }: { medicineId: string; payload: any }) =>
      adminApi.updateInventory(medicineId, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-inventory'] }); toast.success('Inventory updated'); },
    onError: (e: any) => toast.error(e.message || 'Update failed'),
  });

  const addMut = useMutation({
    mutationFn: async ({ formData, imageFile }: { formData: any; imageFile: File | null }) => {
      let imageUrl = '';
      if (imageFile) {
        const res = await adminApi.uploadImage(imageFile);
        imageUrl = res.imageUrl;
      }
      const priceNum = formData.price ? parseFloat(formData.price) : undefined;
      return adminApi.addMedicine({ ...formData, standardPrice: priceNum, price: priceNum, imageUrl });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-inventory'] }); setShowAdd(false); toast.success('Medicine added!'); },
    onError: (e: any) => toast.error(e.message || 'Failed to add medicine'),
  });

  const deleteMut = useMutation({
    mutationFn: adminApi.removeMedicine,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-inventory'] }); toast.success('Medicine removed'); },
    onError: (e: any) => toast.error(e.message || 'Delete failed'),
  });

  const inventory = data?.inventory || [];
  const stats = data?.stats || [];
  const getCount = (s: string) => stats.find((st: any) => st.stockStatus === s)?._count?.stockStatus ?? 0;
  const totalInStock = getCount('in_stock');
  const totalLow = getCount('low_stock');
  const totalOut = getCount('out_of_stock');

  const filters = [
    { value: '', label: 'All' },
    { value: 'in_stock', label: '✓ In Stock' },
    { value: 'low_stock', label: '⚠ Low Stock' },
    { value: 'out_of_stock', label: '✕ Out of Stock' },
  ];

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 4 }}>💊 Inventory</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Manage your pharmacy's medicine stock</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => exportCSV(inventory)}
            style={{
              padding: '10px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#475569',
            }}
          >⬇ Export CSV</button>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #0284a8, #02C39A)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >+ Add Medicine</button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22,
      }}>
        {[
          { label: 'Total Medicines', val: inventory.length + (isLoading ? '…' : ''), color: '#0284a8', bg: '#e0f4f8' },
          { label: 'In Stock', val: totalInStock, color: '#059669', bg: '#D1FAE5' },
          { label: 'Low Stock', val: totalLow, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Out of Stock', val: totalOut, color: '#DC2626', bg: '#FEE2E2' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '14px 16px', borderRadius: 12, background: s.bg,
            border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>🔍</span>
          <input
            type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search medicines…"
            style={{ ...inputStyle, paddingLeft: 36, width: '100%', height: 42 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: activeFilter === f.value ? 'none' : '1.5px solid #e2e8f0',
                background: activeFilter === f.value ? 'linear-gradient(135deg, #0284a8, #02C39A)' : '#fff',
                color: activeFilter === f.value ? '#fff' : '#475569',
                cursor: 'pointer',
              }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ height: 64, borderRadius: 10, background: '#f1f5f9' }} />)}
        </div>
      ) : inventory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>No medicines found</div>
          <div style={{ fontSize: 14, marginBottom: 20 }}>
            {search || activeFilter ? 'Try adjusting your search or filter' : 'Add your first medicine to get started'}
          </div>
          {!search && !activeFilter && (
            <button onClick={() => setShowAdd(true)} style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #0284a8, #02C39A)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>+ Add First Medicine</button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
            display: 'block',
          }} className="inventory-desktop-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Medicine', 'Form', 'Stock Status', 'Qty', 'Reserved', 'Available', 'Price (USD)', 'Last Updated', 'Actions'].map(col => (
                    <th key={col} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontWeight: 700, color: '#64748b', fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, idx) => (
                  <tr key={item.id} style={{
                    borderTop: '1px solid #f1f5f9',
                    background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.medicine.genericName}</div>
                      {item.medicine.brandName && <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.medicine.brandName}</div>}
                      {item.medicine.dosage && <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{item.medicine.dosage}</div>}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', textTransform: 'capitalize' }}>{item.medicine.form || '—'}</td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={item.stockStatus} /></td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: item.reservedQuantity > 0 ? '#D97706' : '#64748b' }}>{item.reservedQuantity}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: item.availableQuantity > 0 ? '#059669' : '#DC2626' }}>{item.availableQuantity}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{item.price != null ? `$${item.price.toFixed(2)}` : '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 11, whiteSpace: 'nowrap' }}>
                      {new Date(item.lastUpdated).toLocaleDateString('en-ZW', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setEditItem(item)}
                          style={{
                            padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                            background: '#e0f4f8', color: '#0284a8', border: 'none', cursor: 'pointer',
                          }}
                        >Edit</button>
                        <button
                          onClick={() => { if (confirm(`Remove ${item.medicine.genericName}?`)) deleteMut.mutate(item.medicineId); }}
                          style={{
                            padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                            background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer',
                          }}
                        >Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="inventory-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: 12 }}>
            {inventory.map(item => (
              <div key={item.id} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{item.medicine.genericName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {[item.medicine.dosage, item.medicine.form].filter(Boolean).join(' · ')}
                      {item.medicine.brandName ? ` · ${item.medicine.brandName}` : ''}
                    </div>
                  </div>
                  <StatusBadge status={item.stockStatus} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'Total', val: item.quantity, color: '#0f172a' },
                    { label: 'Reserved', val: item.reservedQuantity, color: item.reservedQuantity > 0 ? '#D97706' : '#64748b' },
                    { label: 'Available', val: item.availableQuantity, color: item.availableQuantity > 0 ? '#059669' : '#DC2626' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: '#f8fafc', borderRadius: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setEditItem(item)}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      background: 'linear-gradient(135deg, #0284a8, #02C39A)', color: '#fff', border: 'none', cursor: 'pointer',
                    }}
                  >Edit</button>
                  <button
                    onClick={() => { if (confirm(`Remove ${item.medicine.genericName}?`)) deleteMut.mutate(item.medicineId); }}
                    style={{
                      padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer',
                    }}
                  >Remove</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit modal */}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          isSaving={updateMut.isPending}
          onSave={async payload => {
            setSavingId(editItem.medicineId);
            try {
              await updateMut.mutateAsync({ medicineId: editItem.medicineId, payload });
              setEditItem(null);
            } finally {
              setSavingId(null);
            }
          }}
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <AddMedicineModal
          onClose={() => setShowAdd(false)}
          isSaving={addMut.isPending}
          onSave={(formData, imageFile) => addMut.mutate({ formData, imageFile })}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .inventory-desktop-table { display: none !important; }
          .inventory-mobile-cards { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
