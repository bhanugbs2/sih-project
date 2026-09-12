import React, { useEffect, useState } from 'react';
import { PageHeader, LoadingState, EmptyState, ErrorState } from '../components/common/UIComponents';
import { getAllBatches, getBatchTraceability, anchorBlockchainEvent, getBlockchainConfigStatus } from '../services/api';
import { HoneyBatch, TraceabilityEvent } from '../types';
import { FileCheck2, ShieldCheck, Clock, Hash, Layers, Server, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

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
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'var(--status-success-bg)', color: 'var(--status-success)', border: '1px solid var(--status-success-border)', fontWeight: 600, fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={12} /> ANCHORED ON-CHAIN
          </span>
        );
      case 'PENDING':
        return (
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'var(--status-info-bg)', color: 'var(--status-info)', border: '1px solid var(--status-info-border)', fontWeight: 600, fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} /> PENDING ANCHORING
          </span>
        );
      case 'FAILED':
        return (
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'var(--status-danger-bg)', color: 'var(--status-danger)', border: '1px solid var(--status-danger-border)', fontWeight: 600, fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertTriangle size={12} /> ANCHORING FAILED
          </span>
        );
      default:
        return (
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'var(--status-warning-bg)', color: 'var(--status-warning)', border: '1px solid var(--status-warning-border)', fontWeight: 600, fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={12} /> OFF-CHAIN VERIFIED
          </span>
        );
    }
  };

  return (
    <>
      <PageHeader
        title="Supply Chain Audit & Blockchain Verification"
        subtitle="Cryptographic SHA-256 data hash logs and EVM smart contract anchor status"
      />

      {/* Blockchain System Info Card */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Server size={18} color="var(--honey-brown)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              Blockchain Verification Infrastructure
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Network: {blockchainInfo?.networkName || 'Localhost EVM'} | Contract Address: {blockchainInfo?.contractAddress || 'Not Deployed'}
            </div>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', background: blockchainInfo?.configured ? 'var(--status-success-bg)' : 'var(--status-warning-bg)', color: blockchainInfo?.configured ? 'var(--status-success)' : 'var(--status-warning)', border: `1px solid ${blockchainInfo?.configured ? 'var(--status-success-border)' : 'var(--status-warning-border)'}`, fontWeight: 600 }}>
          {blockchainInfo?.configured ? 'EVM RPC ONLINE' : 'OFF-CHAIN DB VERIFIED'}
        </span>
      </div>

      {actionMessage && (
        <div style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', color: 'var(--status-success)', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
          {actionMessage}
        </div>
      )}

      {/* Batch Selector */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select Batch Code:</span>
        <select
          value={selectedBatchId}
          onChange={(e) => handleBatchChange(e.target.value)}
          className="form-control"
          style={{ fontWeight: 600, color: 'var(--honey-brown)', flex: '1 1 260px' }}
        >
          {batches.map((b) => (
            <option key={b.id} value={b.batchId}>
              {b.batchId} ({b.status})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState message="Fetching cryptographic supply chain ledger..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatchesAndConfig} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No Traceability Events Found"
          description={`No supply chain events have been logged for batch ${selectedBatchId} yet.`}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((evt, idx) => {
            const isTxHash = evt.blockchainTransactionHash && evt.blockchainTransactionHash.startsWith('0x');
            return (
              <div
                key={evt.id || idx}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--honey-amber-light)',
                  color: 'var(--honey-brown)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={18} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                        Stage: <span style={{ color: 'var(--honey-brown)' }}>{evt.eventType}</span>
                      </h3>
                      {getStatusBadge(evt)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                      <Clock size={13} />
                      <span>{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* SHA-256 Canonical Data Hash */}
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'monospace',
                    fontSize: '0.775rem',
                    color: 'var(--text-secondary)',
                    wordBreak: 'break-all',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', marginBottom: '0.15rem', fontSize: '0.725rem' }}>
                      <Hash size={12} /> Data Hash (SHA-256):
                    </div>
                    {evt.eventDataHash || 'Not recorded'}
                  </div>

                  {/* EVM Transaction Hash */}
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isTxHash ? 'var(--status-success-bg)' : 'var(--bg-primary)',
                    border: `1px solid ${isTxHash ? 'var(--status-success-border)' : 'var(--border-color)'}`,
                    fontSize: '0.775rem',
                    color: isTxHash ? 'var(--status-success)' : 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', wordBreak: 'break-all' }}>
                      <Layers size={14} />
                      <span>
                        <strong>EVM Transaction Hash:</strong> {isTxHash ? evt.blockchainTransactionHash : 'Off-Chain Record (Not anchored)'}
                      </span>
                    </div>
                    {(!evt.blockchainStatus || evt.blockchainStatus !== 'BLOCKCHAIN_ANCHORED') && (
                      <button
                        onClick={() => handleAnchorEvent(evt.id)}
                        disabled={anchoringId === evt.id}
                        className="btn-primary"
                        style={{
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.725rem',
                          gap: '0.3rem'
                        }}
                      >
                        {anchoringId === evt.id ? 'Anchoring...' : 'Anchor On-Chain'}
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
