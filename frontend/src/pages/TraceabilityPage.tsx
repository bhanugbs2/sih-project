import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '../components/common/UIComponents';
import { getAllBatches, getBatchTraceability, anchorBlockchainEvent, getBlockchainConfigStatus } from '../services/api';
import { HoneyBatch, TraceabilityEvent } from '../types';
import { FileCheck2, ShieldCheck, Clock, Layers, Hash, Link2, Server, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const TraceabilityPage: React.FC = () => {
  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [events, setEvents] = useState<TraceabilityEvent[]>([]);
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadBatchesAndConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const [batchesData, configData] = await Promise.all([
        getAllBatches(),
        getBlockchainConfigStatus().catch(() => null)
      ]);
      setBatches(batchesData);
      setBlockchainInfo(configData);

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
    loadBatchesAndConfig();
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

  const handleAnchorEvent = async (eventId: string) => {
    setAnchoringId(eventId);
    setActionMessage(null);
    try {
      const updated = await anchorBlockchainEvent(eventId);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      if (updated.blockchainStatus === 'BLOCKCHAIN_ANCHORED') {
        setActionMessage(`Event ${eventId} successfully anchored to EVM blockchain! Tx: ${updated.blockchainTransactionHash?.substring(0, 16)}...`);
      } else {
        setActionMessage(`Event ${eventId} status updated to: ${updated.blockchainStatus}`);
      }
    } catch (err: any) {
      setActionMessage(`Anchoring error: ${err.message || 'Failed to submit transaction.'}`);
    } finally {
      setAnchoringId(null);
    }
  };

  const getStatusBadge = (evt: TraceabilityEvent) => {
    const status = evt.blockchainStatus || 'OFF_CHAIN_VERIFIED';
    switch (status) {
      case 'BLOCKCHAIN_ANCHORED':
        return (
          <span style={{ padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={12} /> BLOCKCHAIN ANCHORED
          </span>
        );
      case 'PENDING':
        return (
          <span style={{ padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 600, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={12} /> PENDING ANCHORING
          </span>
        );
      case 'FAILED':
        return (
          <span style={{ padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 600, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertTriangle size={12} /> ANCHORING FAILED
          </span>
        );
      case 'NOT_CONFIGURED':
      default:
        return (
          <span style={{ padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--honey-gold)', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 600, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={12} /> OFF-CHAIN VERIFIED
          </span>
        );
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Supply Chain Traceability & Blockchain Audit"
        subtitle="Cryptographic SHA-256 data proof timeline and EVM smart contract immutability ledger"
      />

      {/* Blockchain Configuration Panel Banner */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Server size={20} color="var(--honey-gold)" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              EVM Blockchain Anchoring Engine
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Network: {blockchainInfo?.networkName || 'Localhost EVM'} | Contract: {blockchainInfo?.contractAddress || 'NOT_DEPLOYED'}
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', background: blockchainInfo?.configured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: blockchainInfo?.configured ? 'var(--accent-emerald)' : 'var(--honey-gold)', border: `1px solid ${blockchainInfo?.configured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, fontWeight: 600 }}>
          {blockchainInfo?.configured ? 'EVM RPC ONLINE' : 'OFF-CHAIN DB VERIFIED (NO LIVE RPC)'}
        </span>
      </div>

      {actionMessage && (
        <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
          {actionMessage}
        </div>
      )}

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
        <LoadingState message="Fetching cryptographic event ledger and blockchain proofs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatchesAndConfig} />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Stage: <span className="gradient-text">{evt.eventType}</span>
                    </h3>
                    {getStatusBadge(evt)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Clock size={14} />
                    <span>{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* SHA-256 Canonical Data Hash */}
                <div style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  wordBreak: 'break-all',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    <Hash size={12} /> Deterministic SHA-256 Canonical Data Hash:
                  </div>
                  {evt.blockchainDataHash || evt.eventDataHash}
                </div>

                {/* Blockchain Proof Status / Transaction Hash */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: evt.blockchainTransactionHash ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${evt.blockchainTransactionHash ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  fontSize: '0.85rem',
                  color: evt.blockchainTransactionHash ? 'var(--accent-emerald)' : 'var(--honey-gold)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', wordBreak: 'break-all' }}>
                    <Layers size={16} />
                    <span>
                      <strong>EVM Tx Hash:</strong> {evt.blockchainTransactionHash || 'No transaction executed (Off-chain database verified)'}
                    </span>
                  </div>
                  {(!evt.blockchainStatus || evt.blockchainStatus !== 'BLOCKCHAIN_ANCHORED') && (
                    <button
                      onClick={() => handleAnchorEvent(evt.id)}
                      disabled={anchoringId === evt.id}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: 'var(--honey-gold)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: '#000',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {anchoringId === evt.id ? 'Anchoring...' : 'Anchor to Blockchain'}
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};
