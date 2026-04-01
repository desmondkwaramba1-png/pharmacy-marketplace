import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/auth';
import { useDebounce } from '../../hooks/useDebounce';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import type { InventoryItem, StockStatus } from '../../types';
import { FiSearch, FiX, FiPlus, FiSave, FiTrash2, FiBox } from 'react-icons/fi';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

const FILTERS: { label: React.ReactNode; value: string }[] = [
  { label: 'All', value: '' },
  { label: <><FaCheckCircle color="var(--color-success)" style={{ display: 'inline', marginRight: 4 }} /> In Stock</>, value: 'in_stock' },
  { label: <><FaExclamationTriangle color="var(--color-warning)" style={{ display: 'inline', marginRight: 4 }} /> Low Stock</>, value: 'low_stock' },
  { label: <><FaTimesCircle color="var(--color-error)" style={{ display: 'inline', marginRight: 4 }} /> Out of Stock</>, value: 'out_of_stock' },
];

function AddMedicineModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    genericName: '', brandName: '', dosage: '', form: 'tablet',
    category: '', description: '', imageUrl: '', stockStatus: 'in_stock', quantity: 0, price: '',
  });

  const set = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add New Medicine</h2>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label required">Generic Name</label>
            <input className="form-input" value={form.genericName} onChange={(e) => set('genericName', e.target.value)} placeholder="e.g. Paracetamol" />
          </div>
          <div className="form-group">
            <label className="form-label">Brand Name</label>
            <input className="form-input" value={form.brandName} onChange={(e) => set('brandName', e.target.value)} placeholder="e.g. Panadol" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-group">
              <label className="form-label">Dosage</label>
              <input className="form-input" value={form.dosage} onChange={(e) => set('dosage', e.target.value)} placeholder="500mg" />
            </div>
            <div className="form-group">
              <label className="form-label">Form</label>
              <select className="form-input form-select" value={form.form} onChange={(e) => set('form', e.target.value)}>
                {['tablet','capsule','syrup','injection','cream','inhaler','powder'].map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select category</option>
              {['Painkiller','Antibiotic','Antidiabetic','Antihypertensive','Antimalarial','Supplement','Antacid','Bronchodilator','Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input className="form-input" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://example.com/image.jpg" />
          </div>
          <div className="form-group">
            <label className="form-label">Stock Status</label>
            <div className="stock-radio-group">
              {[
                ['in_stock', <><FaCheckCircle style={{ display: 'inline' }} /> In Stock</>],
                ['low_stock', <><FaExclamationTriangle style={{ display: 'inline' }} /> Low</>],
                ['out_of_stock', <><FaTimesCircle style={{ display: 'inline' }} /> Out</>]
              ].map(([v,l]) => (
                <label key={v as string}>
                  <input type="radio" className="stock-radio" name="modal-stock" value={v as string} checked={form.stockStatus === v} onChange={() => set('stockStatus', v)} />
                  <span className="stock-radio-label">{l}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input className="form-input" type="number" min={0} value={form.quantity} onChange={(e) => set('quantity', parseInt(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Price (USD)</label>
              <input className="form-input" type="number" step="0.01" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0.00" />
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={() => { if (form.genericName.trim()) onSave(form); }}
          >
            Add Medicine
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [localEdits, setLocalEdits] = useState<Record<string, { stockStatus: string; quantity: number; price: string }>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory', activeFilter, debouncedSearch],
    queryFn: () => adminApi.getInventory({ status: activeFilter || undefined, q: debouncedSearch || undefined }),
    staleTime: 2 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ medicineId, payload }: { medicineId: string; payload: any }) =>
      adminApi.updateInventory(medicineId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inventory'] }),
  });

  const addMutation = useMutation({
    mutationFn: adminApi.addMedicine,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-inventory'] }); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.removeMedicine,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inventory'] }),
  });

  const getEdit = (item: InventoryItem) =>
    localEdits[item.medicineId] ?? { stockStatus: item.stockStatus, quantity: item.quantity, price: item.price?.toString() ?? '' };

  const setEdit = (medicineId: string, changes: Partial<{ stockStatus: string; quantity: number; price: string }>) =>
    setLocalEdits((prev) => ({ ...prev, [medicineId]: { ...getEdit({ medicineId, stockStatus: 'in_stock', quantity: 0, price: null } as any), ...prev[medicineId], ...changes } }));

  const handleUpdate = async (item: InventoryItem) => {
    const edit = getEdit(item);
    setSavingId(item.medicineId);
    try {
      await updateMutation.mutateAsync({
        medicineId: item.medicineId,
        payload: { stockStatus: edit.stockStatus, quantity: edit.quantity, price: edit.price ? parseFloat(edit.price) : undefined },
      });
      setLocalEdits((prev) => { const n = { ...prev }; delete n[item.medicineId]; return n; });
    } finally {
      setSavingId(null);
    }
  };

  const stats = data?.stats ?? [];
  const getCount = (s: string) => stats.find((st: any) => st.stockStatus === s)?._count?.stockStatus ?? 0;

  return (
    <div className="page">
      <header className="app-header">
        <h1 className="app-header-title">Inventory</h1>
        <button id="add-medicine-btn" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><FiPlus /> Add</button>
      </header>

      <div className="page-content">
        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <span className="search-icon"><FiSearch /></span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicines..."
          />
          {search && <button className="clear-btn" onClick={() => setSearch('')}><FiX /></button>}
        </div>

        {/* Filter pills */}
        <div className="filter-pills" style={{ marginBottom: 16 }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`pill ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
              {f.value === 'low_stock' && getCount('low_stock') > 0 && (
                <span style={{ marginLeft: 4, background: 'var(--color-warning)', color: 'white', borderRadius: 999, fontSize: 10, padding: '0 5px' }}>
                  {getCount('low_stock')}
                </span>
              )}
              {f.value === 'out_of_stock' && getCount('out_of_stock') > 0 && (
                <span style={{ marginLeft: 4, background: 'var(--color-error)', color: 'white', borderRadius: 999, fontSize: 10, padding: '0 5px' }}>
                  {getCount('out_of_stock')}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading && <SkeletonList count={4} />}

        {data?.inventory.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-state-icon"><FiBox /></div>
            <div className="empty-state-title">No medicines yet</div>
            <div className="empty-state-text">Add your first medicine to start tracking stock</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><FiPlus /> Add Medicine</button>
          </div>
        )}

        <div className="results-list">
          {data?.inventory.map((item) => {
            const edit = getEdit(item);
            const isSaving = savingId === item.medicineId;
            const isDirty =
              edit.stockStatus !== item.stockStatus ||
              edit.quantity !== item.quantity ||
              (edit.price || '') !== (item.price?.toString() || '');

            return (
              <div key={item.id} className="inventory-item">
                <div className="inventory-item-header" style={{ display: 'flex', gap: 12 }}>
                  {item.medicine.imageUrl ? (
                    <img src={item.medicine.imageUrl} alt={item.medicine.genericName} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: '#f0f0f0' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      <FiBox color="var(--color-primary)" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="inventory-item-name">{item.medicine.genericName} {item.medicine.dosage && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{item.medicine.dosage}</span>}</div>
                    <div className="inventory-item-meta">
                      {[item.medicine.form, item.medicine.brandName].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <Badge status={edit.stockStatus as StockStatus} />
                </div>

                {/* Stock radio */}
                <div className="stock-radio-group">
                  {[
                    ['in_stock', <><FaCheckCircle style={{ display: 'inline' }} /> In Stock</>],
                    ['low_stock', <><FaExclamationTriangle style={{ display: 'inline' }} /> Low</>],
                    ['out_of_stock', <><FaTimesCircle style={{ display: 'inline' }} /> Out</>]
                  ].map(([v, l]) => (
                    <label key={v as string}>
                      <input
                        type="radio"
                        name={`stock-${item.medicineId}`}
                        value={v as string}
                        checked={edit.stockStatus === v}
                        onChange={() => setEdit(item.medicineId, { stockStatus: v as string })}
                        className="stock-radio"
                      />
                      <span className="stock-radio-label">{l}</span>
                    </label>
                  ))}
                </div>

                {/* Qty + Price */}
                <div className="inventory-input-row">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12 }}>Quantity</label>
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      value={edit.quantity}
                      onChange={(e) => setEdit(item.medicineId, { quantity: parseInt(e.target.value) || 0 })}
                      style={{ height: 40 }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12 }}>Price (USD)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      min={0}
                      value={edit.price}
                      onChange={(e) => setEdit(item.medicineId, { price: e.target.value })}
                      placeholder="0.00"
                      style={{ height: 40 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {isDirty && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => handleUpdate(item)}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : <><FiSave /> Update Stock</>}
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => { if (confirm(`Remove ${item.medicine.genericName} from inventory?`)) deleteMutation.mutate(item.medicineId); }}
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="inventory-update-time">
                  Last updated: {new Date(item.lastUpdated).toLocaleString()}
                  {item.updatedBy ? ` by ${item.updatedBy.firstName}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <AddMedicineModal
          onClose={() => setShowModal(false)}
          onSave={(formData) => addMutation.mutate(formData)}
        />
      )}
    </div>
  );
}
