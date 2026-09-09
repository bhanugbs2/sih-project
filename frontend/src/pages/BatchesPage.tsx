import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllBatches, getAllHives, createBatch } from '../services/api';
import { HoneyBatch, Hive } from '../types';
import { useAuth } from '../context/AuthContext';
import { PackageCheck, Plus, Search, Filter, ArrowRight, Info } from 'lucide-react';

export const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBatchId, setNewBatchId] = useState('');
  const [selectedHiveId, setSelectedHiveId] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('kg');
  const [harvestNotes, setHarvestNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadBatchesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [batchesData, hivesData] = await Promise.all([
        getAllBatches(),
        getAllHives().catch(() => [])
      ]);
      setBatches(batchesData);
      setHives(hivesData);
      if (hivesData.length > 0) setSelectedHiveId(hivesData[0].hiveId);
    } catch (err: any) {
      setError(err.message || 'Failed to load honey batches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatchesData();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchId.trim() || !selectedHiveId || quantity <= 0) {
      setFormError('Batch ID, Source Hive, and valid positive Quantity are required.');
      return;
    }

    setCreating(true);
    setFormError(null);

    try {
      await createBatch({
        batchId: newBatchId.trim(),
        hiveId: selectedHiveId,
        harvestDate,
        quantity,
        unit,
        harvestNotes: harvestNotes.trim() || undefined,
        quantitySource: 'Manual Harvest Quantity',
        status: 'HARVESTED'
      });
      setIsModalOpen(false);
      setNewBatchId('');
      setHarvestNotes('');
      loadBatchesData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create honey batch.');
    } finally {
      setCreating(false);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchId.toLowerCase().includes(search.toLowerCase()) ||
      b.hiveId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <PageHeader
        title="Honey Harvest Batches"
        subtitle="Track honey batch lifecycle from harvest to quality screening, processing, and packaging readiness"
        actions={
          (role === 'ADMIN' || role === 'BEEKEEPER') ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Register Harvest Batch
            </button>
          ) : undefined
        }
      />

      {/* Hardware Disclosure Notice */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#fbbf24',
        fontSize: '0.875rem'
      }}>
        <Info size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong>Manual Harvest Quantity Notice:</strong> ESP32 node is currently deployed with DHT22 temperature & humidity sensors. Load-cell hardware is not installed. All harvest weights are manually recorded by the beekeeper.
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Batch Code, Hive ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.75rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL" style={{ background: '#121824' }}>All Statuses</option>
            <option value="HARVESTED" style={{ background: '#121824' }}>HARVESTED</option>
            <option value="QUALITY_TESTED" style={{ background: '#121824' }}>QUALITY_TESTED</option>
            <option value="PROCESSING" style={{ background: '#121824' }}>PROCESSING</option>
            <option value="PROCESSED" style={{ background: '#121824' }}>PROCESSED</option>
            <option value="READY_FOR_PACKAGING" style={{ background: '#121824' }}>READY_FOR_PACKAGING</option>
            <option value="REQUIRES_REVIEW" style={{ background: '#121824' }}>REQUIRES_REVIEW</option>
            <option value="PACKAGED" style={{ background: '#121824' }}>PACKAGED</option>
            <option value="RECALLED" style={{ background: '#121824' }}>RECALLED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching honey batches..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatchesData} />
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No Honey Batches Found"
          description={search ? 'No batches match your filter criteria.' : 'No harvest batches have been created yet.'}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Batch ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Source Hive</th>
                <th style={{ padding: '0.75rem 1rem' }}>Harvest Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Harvest Quantity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Quantity Source</th>
                <th style={{ padding: '0.75rem 1rem' }}>Lifecycle Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((batch) => (
                <tr
                  key={batch.id}
                  onClick={() => navigate(`/batches/${batch.batchId}`)}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--honey-gold)' }}>{batch.batchId}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>{batch.hiveId}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    📅 {batch.harvestDate}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {batch.quantity} {batch.unit || 'kg'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    {batch.quantitySource || 'Manual Harvest Quantity'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <StatusBadge status={batch.status} />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                      Inspect Timeline <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Batch Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Honey Harvest Batch">
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Batch Code / ID</label>
            <input
              type="text"
              placeholder="e.g. HC-BATCH-2026-VALLEY-12"
              value={newBatchId}
              onChange={(e) => setNewBatchId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Select Source Hive</label>
            <select
              value={selectedHiveId}
              onChange={(e) => setSelectedHiveId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#121824', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            >
              {hives.map((h) => (
                <option key={h.id} value={h.hiveId}>{h.hiveId} ({h.name})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Manual Harvest Quantity (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Harvest Notes & Super Observations</label>
            <textarea
              placeholder="Record frame conditions, floral source, or extraction notes..."
              value={harvestNotes}
              onChange={(e) => setHarvestNotes(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
            ℹ️ Source Label: <strong>Manual Harvest Quantity</strong> (Load-cell hardware not installed)
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Saving...' : 'Register Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
