import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllBatches, createPackage, getPackageById } from '../services/api';
import { Package, HoneyBatch } from '../types';
import { useAuth } from '../context/AuthContext';
import { Package as PackageIcon, Plus, QrCode, ShieldCheck, ArrowRight, Search } from 'lucide-react';

export const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPackageId, setNewPackageId] = useState('HC-PKG-2026-003');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadPackagesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const batchesData = await getAllBatches();
      setBatches(batchesData);
      if (batchesData.length > 0) setSelectedBatchId(batchesData[0].batchId);

      // Attempt to load existing demo packages
      const p1 = await getPackageById('HC-PKG-2026-001').catch(() => null);
      const p2 = await getPackageById('HC-PKG-2026-002').catch(() => null);
      const existing = [p1, p2].filter((p): p is Package => p !== null);
      setPackages(existing);
    } catch (err: any) {
      setError(err.message || 'Failed to load consumer packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackagesData();
  }, []);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackageId.trim() || !selectedBatchId) {
      setFormError('Package ID and Batch selection are required.');
      return;
    }

    setCreating(true);
    setFormError(null);

    try {
      const created = await createPackage({
        packageId: newPackageId.trim(),
        batchId: selectedBatchId,
        qrUrl: `https://honeychain.io/verify/${newPackageId.trim()}`,
        status: 'PACKAGED'
      });
      setPackages((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewPackageId(`HC-PKG-2026-00${packages.length + 4}`);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create retail package.');
    } finally {
      setCreating(false);
    }
  };

  const filteredPackages = packages.filter(
    (p) =>
      p.packageId.toLowerCase().includes(search.toLowerCase()) ||
      p.batchId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <PageHeader
        title="Consumer Package Serialization"
        subtitle="Retail QR serialization, batch binding, and public verification records"
        actions={
          role === 'ADMIN' ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Create Package
            </button>
          ) : undefined
        }
      />

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '380px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Package ID, Batch Code..."
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
      </div>

      {loading ? (
        <LoadingState message="Loading retail packages..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPackagesData} />
      ) : filteredPackages.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="No Packages Found"
          description="No retail packages have been serialized yet."
          action={
            role === 'ADMIN' ? (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                Serialize First Package
              </button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--honey-gold)' }}>
                    {pkg.packageId}
                  </span>
                  <StatusBadge status={pkg.status} />
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Linked Batch: <strong style={{ color: 'var(--text-primary)' }}>{pkg.batchId}</strong>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Packaged Date: {pkg.packagingDate ? new Date(pkg.packagingDate).toLocaleDateString() : 'Today'}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/verify/${pkg.packageId}`)}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.85rem' }}
                >
                  <ShieldCheck size={16} /> Public Verify Portal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Package Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Retail Package">
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreatePackage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Package Serial ID</label>
            <input
              type="text"
              value={newPackageId}
              onChange={(e) => setNewPackageId(e.target.value)}
              placeholder="e.g. HC-PKG-2026-003"
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Select Honey Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#121824', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            >
              {batches.map((b) => (
                <option key={b.id} value={b.batchId}>
                  {b.batchId} ({b.quantity} {b.unit} • {b.status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Saving...' : 'Create Package'}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
