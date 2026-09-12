import React, { useEffect, useState } from 'react';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllBatches, getQualityTestsByBatchId, addQualityTest } from '../services/api';
import { HoneyBatch, QualityTest, QualityTestResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { FlaskConical, Plus } from 'lucide-react';

export const QualityPage: React.FC = () => {
  const { user, role } = useAuth();

  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moisture, setMoisture] = useState<number>(16.5);
  const [ph, setPh] = useState<number>(3.85);
  const [color, setColor] = useState('Amber Gold');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<QualityTestResult>('PASS');
  const [verifiedBy, setVerifiedBy] = useState(user ? `Lab Analyst ${user}` : 'Lab Analyst S. Verma');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const batchesData = await getAllBatches();
      setBatches(batchesData);
      if (batchesData.length > 0) {
        const firstBatchId = batchesData[0].batchId;
        setSelectedBatchId(firstBatchId);
        const tests = await getQualityTestsByBatchId(firstBatchId).catch(() => []);
        setQualityTests(tests);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quality test records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleBatchChange = async (batchId: string) => {
    setSelectedBatchId(batchId);
    setLoading(true);
    try {
      const tests = await getQualityTestsByBatchId(batchId).catch(() => []);
      setQualityTests(tests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQualityTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setFormError('Please select a honey batch.');
      return;
    }
    if (moisture < 0 || moisture > 100) {
      setFormError('Moisture content cannot be negative.');
      return;
    }
    if (ph < 0 || ph > 14) {
      setFormError('pH level cannot be negative.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await addQualityTest(selectedBatchId, {
        moisture,
        ph,
        color,
        notes: notes.trim() || undefined,
        result,
        verifiedBy
      });
      setIsModalOpen(false);
      setNotes('');
      handleBatchChange(selectedBatchId);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to record quality test result.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Laboratory Quality Testing"
        subtitle="Physicochemical laboratory analysis, quality certification, and inspection result logs"
        actions={
          (role === 'ADMIN' || role === 'QUALITY_INSPECTOR') ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> + Record Quality Test
            </button>
          ) : undefined
        }
      />

      {/* Batch Selection Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select Honey Batch:</span>
        <select
          value={selectedBatchId}
          onChange={(e) => handleBatchChange(e.target.value)}
          className="form-control"
          style={{ fontWeight: 600, color: 'var(--honey-brown)', flex: '1 1 260px' }}
        >
          {batches.map((b) => (
            <option key={b.id} value={b.batchId}>
              {b.batchId} (Hive: {b.hiveId} • Status: {b.status})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState message="Fetching lab inspection records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatches} />
      ) : qualityTests.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No Quality Test Recorded"
          description={`No laboratory quality test results have been recorded for batch ${selectedBatchId} yet.`}
          action={
            (role === 'ADMIN' || role === 'QUALITY_INSPECTOR') ? (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                + Record Quality Test
              </button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {qualityTests.map((test) => (
            <div key={test.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={test.result} />
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  {new Date(test.timestamp).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Moisture Content</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--honey-brown)' }}>
                    {test.moisture !== null && test.moisture !== undefined ? `${test.moisture}%` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Max Threshold: 20%</div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pH Level</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-info)' }}>
                    {test.ph !== null && test.ph !== undefined ? test.ph : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Standard: 3.4 – 4.5</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Floral Color Grade:</strong> {test.color || 'Amber Gold'}
              </div>

              {test.notes && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  "{test.notes}"
                </div>
              )}

              {test.verifiedBy && (
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  Certified Analyst: <strong style={{ color: 'var(--text-primary)' }}>{test.verifiedBy}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Quality Test Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Record Quality Test — ${selectedBatchId}`}>
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-danger)', fontSize: '0.825rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleAddQualityTest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Moisture Content (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={moisture}
                onChange={(e) => setMoisture(parseFloat(e.target.value))}
                className="form-control"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>pH Level</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="14"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                className="form-control"
                style={{ width: '100%' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Honey Color Grade</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Amber Gold, Light Amber"
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Laboratory Inspection Result</label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as QualityTestResult)}
              className="form-control"
              style={{ width: '100%' }}
            >
              <option value="PASS">PASS (Meets Laboratory Standards)</option>
              <option value="FAIL">FAIL (Quality Parameter Anomaly)</option>
              <option value="REQUIRES_REVIEW">REQUIRES_REVIEW (Secondary Review Needed)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Inspection Findings & Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record certificate number, lab equipment notes, or observation details..."
              rows={3}
              className="form-control"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Certified Analyst Name</label>
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit Test Result'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
