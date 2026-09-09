import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllBatches, getProcessingRecordsByBatchId, addProcessingRecord } from '../services/api';
import { HoneyBatch, ProcessingRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { Filter, Plus, Clock, User, CheckCircle, AlertTriangle, Thermometer } from 'lucide-react';

export const ProcessingPage: React.FC = () => {
  const { user, role } = useAuth();

  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<HoneyBatch | null>(null);
  const [processingRecords, setProcessingRecords] = useState<ProcessingRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operation, setOperation] = useState('FILTRATION');
  const [operator, setOperator] = useState(user ? `Operator ${user}` : 'Processing Manager K. Singh');
  const [processingTemperature, setProcessingTemperature] = useState<number>(36.5);
  const [description, setDescription] = useState('Raw honey filtered using 200-micron mesh screen to retain natural pollen grains.');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const batchesData = await getAllBatches();
      setBatches(batchesData);
      if (batchesData.length > 0) {
        const firstBatch = batchesData[0];
        setSelectedBatchId(firstBatch.batchId);
        setSelectedBatch(firstBatch);
        const records = await getProcessingRecordsByBatchId(firstBatch.batchId).catch(() => []);
        setProcessingRecords(records);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load processing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleBatchChange = async (batchId: string) => {
    setSelectedBatchId(batchId);
    const found = batches.find((b) => b.batchId === batchId) || null;
    setSelectedBatch(found);
    setLoading(true);
    try {
      const records = await getProcessingRecordsByBatchId(batchId).catch(() => []);
      setProcessingRecords(records);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isBatchBlockedFromProcessing = (b: HoneyBatch | null) => {
    if (!b) return true;
    return b.status === 'HARVESTED' || b.status === 'REQUIRES_REVIEW' || b.status === 'RECALLED';
  };

  const handleAddProcessingRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId || !operation.trim()) {
      setFormError('Please select a batch and operation.');
      return;
    }
    if (isBatchBlockedFromProcessing(selectedBatch)) {
      setFormError(`Processing blocked: Batch ${selectedBatchId} is in status ${selectedBatch?.status}. Quality test PASS is required.`);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const nowIso = new Date().toISOString();

    try {
      await addProcessingRecord(selectedBatchId, {
        operation: operation.trim(),
        processType: operation.trim(),
        operator: operator.trim(),
        verifiedBy: operator.trim(),
        startedAt: nowIso,
        completedAt: nowIso,
        processingTemperature: processingTemperature,
        tempSource: 'Manual Processing Temperature',
        description: description.trim()
      });
      setIsModalOpen(false);
      handleBatchChange(selectedBatchId);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to log processing step.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Processing & Operations History"
        subtitle="Log honey extraction, micro-filtration, pasteurization, and packaging preparation"
        actions={
          (role === 'ADMIN' || role === 'BEEKEEPER') ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Record Processing Step
            </button>
          ) : undefined
        }
      />

      {/* Batch Selector & Quality Gate Warning Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Batch:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => handleBatchChange(e.target.value)}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#121824',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer',
              flex: '1 1 280px'
            }}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.batchId}>
                {b.batchId} ({b.quantity} {b.unit} • Status: {b.status})
              </option>
            ))}
          </select>
        </div>

        {selectedBatch && isBatchBlockedFromProcessing(selectedBatch) && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>
              <strong>Quality Gate Restriction:</strong> Batch <strong>{selectedBatch.batchId}</strong> has status <strong>{selectedBatch.status}</strong>. Normal processing is blocked until laboratory quality testing is completed with a PASS result.
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingState message="Fetching processing logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatches} />
      ) : processingRecords.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No Processing Steps Logged"
          description={`No processing records have been logged for batch ${selectedBatchId} yet.`}
          action={
            (role === 'ADMIN' || role === 'BEEKEEPER') ? (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)} disabled={isBatchBlockedFromProcessing(selectedBatch)}>
                Add Processing Step
              </button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {processingRecords.map((record) => (
            <div key={record.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {record.operation || record.processType}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Batch: {selectedBatchId}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {record.processingTemperature != null && (
                    <div style={{ fontSize: '0.825rem', color: 'var(--honey-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Thermometer size={16} />
                      <span>{record.processingTemperature}°C ({record.tempSource || 'Manual Processing Temperature'})</span>
                    </div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} />
                    <span>{new Date(record.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {record.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                  {record.description}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--honey-gold)', paddingTop: '0.65rem', borderTop: '1px solid var(--border-color)' }}>
                <User size={14} />
                <span>Operator: <strong>{record.operator || record.verifiedBy || 'Processing Manager'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Processing Record Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Log Processing Step for ${selectedBatchId}`}>
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleAddProcessingRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Processing Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#121824', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            >
              <option value="EXTRACTION">EXTRACTION</option>
              <option value="FILTRATION">FILTRATION</option>
              <option value="PASTEURIZATION">PASTEURIZATION</option>
              <option value="PACKAGING_PREPARATION">PACKAGING_PREPARATION</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Operator / Manager</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Manual Processing Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={processingTemperature}
                onChange={(e) => setProcessingTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Operation Notes & Observations</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter processing observations, filter mesh size, or temperature curve notes..."
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
            ℹ️ Temperature Source Label: <strong>Manual Processing Temperature</strong> (DHT22 is not a processing temperature sensor)
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Process Log'}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
