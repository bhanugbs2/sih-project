import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '../components/common/UIComponents';
import { getAllBatches, getBatchTraceability } from '../services/api';
import { HoneyBatch, TraceabilityEvent } from '../types';
import { FileCheck2, ShieldCheck, Clock, Layers, Hash } from 'lucide-react';

export const TraceabilityPage: React.FC = () => {
  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const batchesData = await getAllBatches();
      setBatches(batchesData);
      if (batchesData.length > 0) {
        const firstBatchId = batchesData[0].batchId;
        setSelectedBatchId(firstBatchId);
        const traceEvents = await getBatchTraceability(firstBatchId).catch(() => []);
        setEvents(traceEvents);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load traceability events.');
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
      const traceEvents = await getBatchTraceability(batchId).catch(() => []);
      setEvents(traceEvents);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Supply Chain Traceability Audit"
        subtitle="Cryptographic event timeline, merkle hashing, and blockchain verification records"
      />

      {/* Batch Selector */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Batch Code:</span>
        <select
          value={selectedBatchId}
          onChange={(e) => handleBatchChange(e.target.value)}
          style={{
            padding: '0.65rem 1.25rem',
            background: '#121824',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--honey-gold)',
            fontWeight: 700,
            fontSize: '0.95rem',
            outline: 'none',
            cursor: 'pointer',
            flex: '1 1 280px'
          }}
        >
          {batches.map((b) => (
            <option key={b.id} value={b.batchId}>
              {b.batchId} ({b.status})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState message="Fetching cryptographic event ledger..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatches} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No Traceability Events Found"
          description={`No supply chain events have been anchored for batch ${selectedBatchId} yet.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          {events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                gap: '1.25rem',
                borderLeft: '4px solid var(--honey-gold)'
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--honey-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={22} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Event Stage: <span className="gradient-text">{evt.eventType}</span>
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Clock size={14} />
                    <span>{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  wordBreak: 'break-all',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    <Hash size={12} /> Cryptographic SHA-256 Payload Hash:
                  </div>
                  {evt.eventDataHash}
                </div>

                <div style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: evt.blockchainReference ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${evt.blockchainReference ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  fontSize: '0.85rem',
                  color: evt.blockchainReference ? 'var(--accent-emerald)' : 'var(--honey-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Layers size={16} />
                  <span>
                    <strong>Blockchain Ref:</strong> {evt.blockchainReference || 'Pending blockchain verification'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};
