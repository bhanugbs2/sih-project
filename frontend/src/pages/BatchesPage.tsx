import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <>
      <PageHeader
        title="Honey Batches Log"
        subtitle="Production batch record management and lifecycle status tracking"
        actions={
          (role === 'ADMIN' || role === 'BEEKEEPER') ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> + Register Harvest Batch
            </button>
          ) : undefined
        }
      />

      {/* Hardware Disclosure Notice */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'var(--status-warning-bg)',
        border: '1px solid var(--status-warning-border)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        color: 'var(--status-warning)',
        fontSize: '0.825rem'
      }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Manual Harvest Weight Record:</strong> ESP32 prototype hardware is deployed with DHT22 environmental sensors. Harvest quantities are recorded manually by apiary personnel.
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Batch Code, Hive ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ cursor: 'pointer' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="HARVESTED">HARVESTED</option>
            <option value="QUALITY_TESTED">QUALITY_TESTED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="PROCESSED">PROCESSED</option>
            <option value="READY_FOR_PACKAGING">READY_FOR_PACKAGING</option>
            <option value="REQUIRES_REVIEW">REQUIRES_REVIEW</option>
            <option value="PACKAGED">PACKAGED</option>
            <option value="RECALLED">RECALLED</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching honey production batches..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatchesData} />
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="No Honey Batches Found"
          description={search ? 'No batches match your filter criteria.' : 'No harvest batches have been created yet.'}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Source Hive</th>
                  <th>Harvest Date</th>
                  <th>Quantity</th>
                  <th>Measurement Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} onClick={() => navigate(`/batches/${batch.batchId}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: 'var(--honey-brown)' }}>{batch.batchId}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{batch.hiveId}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{batch.harvestDate}</td>
                    <td style={{ color: 'var(--status-success)', fontWeight: 600 }}>
                      {batch.quantity} {batch.unit || 'kg'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {batch.quantitySource || 'Manual Harvest Quantity'}
                    </td>
                    <td><StatusBadge status={batch.status} /></td>
                    <td>
                      <button className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}>
                        View Timeline <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Batch Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Honey Harvest Batch">
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-danger)', fontSize: '0.825rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Batch Code / ID</label>
            <input
              type="text"
              placeholder="e.g. HC-BATCH-2026-VALLEY-12"
              value={newBatchId}
              onChange={(e) => setNewBatchId(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Select Source Hive</label>
            <select
              value={selectedHiveId}
              onChange={(e) => setSelectedHiveId(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            >
              {hives.map((h) => (
                <option key={h.id} value={h.hiveId}>{h.hiveId} ({h.name})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="form-control"
                style={{ width: '100%' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Quantity (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                className="form-control"
                style={{ width: '100%' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Harvest Notes & Super Observations</label>
            <textarea
              placeholder="Record frame conditions, floral source, or extraction notes..."
              value={harvestNotes}
              onChange={(e) => setHarvestNotes(e.target.value)}
              rows={3}
              className="form-control"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Saving...' : 'Register Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
