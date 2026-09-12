import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllBatches, createPackage, getAllPackages, getPackageById, getBatchTraceability } from '../services/api';
import { Package, HoneyBatch, TraceabilityEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import { Package as PackageIcon, Plus, ShieldCheck, Search, X, AlertTriangle, QrCode } from 'lucide-react';

const REQUIRED_PREREQUISITE_STAGES = [
  'HARVESTED',
  'QUALITY_TESTED',
  'AI_SCREENED',
  'PROCESSED',
  'READY_FOR_PACKAGING'
];

export const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPackageId, setNewPackageId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Batch Validation State
  const [checkingTraceability, setCheckingTraceability] = useState(false);
  const [missingStages, setMissingStages] = useState<string[]>([]);

  const calculateNextPackageId = (currentPackages: Package[]): string => {
    const year = new Date().getFullYear();
    let maxSeq = 0;
    for (const pkg of currentPackages) {
      const match = pkg.packageId.match(/HC-PKG-\d{4}-(\d+)/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
    const nextSeq = maxSeq + 1;
    return `HC-PKG-${year}-${String(nextSeq).padStart(3, '0')}`;
  };

  const loadPackagesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const batchesData = await getAllBatches();
      setBatches(batchesData);

      let packagesData = await getAllPackages().catch(() => []);
      if (packagesData.length === 0) {
        const p1 = await getPackageById('HC-PKG-2026-001').catch(() => null);
        packagesData = [p1].filter((p): p is Package => p !== null);
      }
      setPackages(packagesData);
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request Timeout: HoneyChain backend server did not respond in time.');
      } else if (err.response?.status === 401) {
        setError('401 Unauthorized: Session expired or invalid authentication token.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load consumer packages.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try { localStorage.removeItem('hc_user_created_packages'); } catch {}
    loadPackagesData();
  }, []);

  const validateBatchTraceability = async (batchId: string) => {
    if (!batchId) {
      setMissingStages([]);
      return;
    }
    setCheckingTraceability(true);
    try {
      const events: TraceabilityEvent[] = await getBatchTraceability(batchId).catch(() => []);
      const presentTypes = new Set(events.map((e) => e.eventType));
      const missing = REQUIRED_PREREQUISITE_STAGES.filter((st) => !presentTypes.has(st as any));
      setMissingStages(missing);
    } catch {
      setMissingStages([]);
    } finally {
      setCheckingTraceability(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId && isModalOpen) {
      validateBatchTraceability(selectedBatchId);
    }
  }, [selectedBatchId, isModalOpen]);

  const eligibleBatches = batches.filter(
    (b) => b.status === 'READY_FOR_PACKAGING' || b.status === 'PROCESSED'
  );

  const handleOpenModal = () => {
    const nextId = calculateNextPackageId(packages);
    setNewPackageId(nextId);
    const defaultBatch = eligibleBatches.length > 0 ? eligibleBatches[0].batchId : '';
    setSelectedBatchId(defaultBatch);
    setFormError(null);
    setIsModalOpen(true);
    if (defaultBatch) {
      validateBatchTraceability(defaultBatch);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackageId.trim() || !selectedBatchId) {
      setFormError('Package Serial ID and Batch Selection are required.');
      return;
    }

    if (missingStages.length > 0) {
      setFormError(`Package creation unavailable — this batch has incomplete traceability records. Missing: ${missingStages.join(', ')}`);
      return;
    }

    setCreating(true);
    setFormError(null);

    try {
      const publicBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
      const qrUrl = `${publicBaseUrl}/verify/${newPackageId.trim()}`;

      const created = await createPackage({
        packageId: newPackageId.trim(),
        batchId: selectedBatchId,
        qrUrl,
        status: 'PACKAGED'
      });

      setPackages((prev) => [created, ...prev.filter((p) => p.packageId !== created.packageId)]);
      setSuccessMessage(`Consumer package ${created.packageId} created successfully.`);
      setIsModalOpen(false);
      loadPackagesData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create retail package.');
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
    <>
      <PageHeader
        title="Consumer Packages"
        subtitle="Retail package QR serialization, batch binding, and customer verification"
        actions={
          (role === 'ADMIN' || role === 'BEEKEEPER') ? (
            <button className="btn-primary" onClick={handleOpenModal}>
              <Plus size={16} /> + Create Consumer Package
            </button>
          ) : undefined
        }
      />

      {successMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--status-success-bg)',
          border: '1px solid var(--status-success-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--status-success)',
          fontWeight: 600,
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>✅ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} style={{ background: 'none', border: 'none', color: 'var(--status-success)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div style={{ marginBottom: '1.25rem', maxWidth: '360px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Package ID, Batch Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading consumer packages..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPackagesData} />
      ) : filteredPackages.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="No Packages Found"
          description="No retail consumer packages have been created yet."
          action={
            (role === 'ADMIN' || role === 'BEEKEEPER') ? (
              <button className="btn-primary" onClick={handleOpenModal}>
                + Create Consumer Package
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Package Serial ID</th>
                  <th>Linked Batch</th>
                  <th>Status</th>
                  <th>Customer Verification QR</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => {
                  const publicBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
                  const verifyUrl = `${publicBaseUrl}/verify/${pkg.packageId}`;
                  return (
                    <tr key={pkg.id}>
                      <td style={{ fontWeight: 700, color: 'var(--honey-brown)' }}>
                        {pkg.packageId}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {pkg.batchId}
                      </td>
                      <td>
                        <StatusBadge status={pkg.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verifyUrl)}`}
                            alt={`Customer verification QR for ${pkg.packageId}`}
                            style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#FFFFFF', padding: '2px', border: '1px solid var(--border-color)' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--honey-brown)' }}>CUSTOMER VERIFICATION QR</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/verify/{pkg.packageId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => navigate(`/verify/${pkg.packageId}`)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                        >
                          <ShieldCheck size={14} /> Open Verify Portal
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Package Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Consumer Package">
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-danger)', fontSize: '0.825rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreatePackage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Package Serial ID</label>
            <input
              type="text"
              value={newPackageId}
              onChange={(e) => setNewPackageId(e.target.value)}
              placeholder="e.g. HC-PKG-2026-002"
              className="form-control"
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Select Honey Batch (READY_FOR_PACKAGING)</label>
            {eligibleBatches.length === 0 ? (
              <div style={{ padding: '0.65rem 0.85rem', background: 'var(--status-warning-bg)', border: '1px solid var(--status-warning-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-warning)', fontSize: '0.825rem' }}>
                ⚠️ No batches are currently in READY_FOR_PACKAGING status. Please complete processing for a batch first.
              </div>
            ) : (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="form-control"
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
                required
              >
                {eligibleBatches.map((b) => (
                  <option key={b.id} value={b.batchId}>
                    {b.batchId} ({b.quantity} {b.unit} • Status: {b.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedBatchId && checkingTraceability && (
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Checking batch prerequisite traceability stages...
            </div>
          )}

          {selectedBatchId && !checkingTraceability && missingStages.length > 0 && (
            <div style={{ padding: '0.75rem', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-danger)', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <AlertTriangle size={16} /> Package creation blocked — batch has incomplete traceability lineage.
              </div>
              <div style={{ fontSize: '0.775rem', marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
                Missing prerequisite stages:
              </div>
              <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0, fontSize: '0.775rem' }}>
                {missingStages.map((st) => (
                  <li key={st} style={{ fontWeight: 600 }}>• {st}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creating || eligibleBatches.length === 0 || checkingTraceability || missingStages.length > 0}>
              {creating ? 'Saving...' : 'Create Consumer Package'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
