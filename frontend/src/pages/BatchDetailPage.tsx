import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, StatusBadge, LoadingState, ErrorState } from '../components/common/UIComponents';
import { getBatchById, getQualityTestsByBatchId, getProcessingRecordsByBatchId, getBatchTraceability, recallBatch, markBatchReadyForPackaging } from '../services/api';
import { HoneyBatch, QualityTest, ProcessingRecord, TraceabilityEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, ShieldAlert, FlaskConical, Filter, FileCheck2, Cpu, AlertTriangle, PackageCheck } from 'lucide-react';

export const BatchDetailPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [batch, setBatch] = useState<HoneyBatch | null>(null);
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);
  const [processingRecords, setProcessingRecords] = useState<ProcessingRecord[]>([]);
  const [traceabilityEvents, setTraceabilityEvents] = useState<TraceabilityEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recalling, setRecalling] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = async () => {
    if (!batchId) return;
    setLoading(true);
    setError(null);
    try {
      const [batchData, qualityData, processingData, traceabilityData] = await Promise.all([
        getBatchById(batchId),
        getQualityTestsByBatchId(batchId).catch(() => []),
        getProcessingRecordsByBatchId(batchId).catch(() => []),
        getBatchTraceability(batchId).catch(() => [])
      ]);

      setBatch(batchData);
      setQualityTests(qualityData);
      setProcessingRecords(processingData);
      setTraceabilityEvents(traceabilityData);
    } catch (err: any) {
      setError(err.message || 'Failed to load batch details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [batchId]);

  const handleRecall = async () => {
    if (!batchId || !window.confirm(`Are you sure you want to trigger emergency RECALL for batch ${batchId}?`)) return;
    setRecalling(true);
    try {
      const updated = await recallBatch(batchId);
      setBatch(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to trigger batch recall.');
    } finally {
      setRecalling(false);
    }
  };

  const handleMarkReadyForPackaging = async () => {
    if (!batchId) return;
    setUpdatingStatus(true);
    try {
      const updated = await markBatchReadyForPackaging(batchId);
      setBatch(updated);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update batch status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <LoadingState message={`Fetching lifecycle details for ${batchId}...`} />;
  }

  if (error || !batch) {
    return <ErrorState message={error || 'Batch not found'} onRetry={loadData} />;
  }

  const timelineStages = [
    { key: 'HARVESTED', label: '1. HARVESTED' },
    { key: 'QUALITY_TESTED', label: '2. QUALITY TESTED' },
    { key: 'AI_SCREENED', label: '3. AI SCREENED' },
    { key: 'PROCESSING', label: '4. PROCESSING' },
    { key: 'PROCESSED', label: '5. PROCESSED' },
    { key: 'READY_FOR_PACKAGING', label: '6. READY FOR PACKAGING' }
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'HARVESTED': return 0;
      case 'QUALITY_TESTING':
      case 'QUALITY_TESTED':
      case 'QUALITY_VERIFIED': return 1;
      case 'PROCESSING': return 3;
      case 'PROCESSED': return 4;
      case 'READY_FOR_PACKAGING':
      case 'PACKAGED':
      case 'COMPLETED': return 5;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(batch.status);
  const latestQualityTest = qualityTests.length > 0 ? qualityTests[0] : null;

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/batches')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Honey Batches
        </button>
      </div>

      <PageHeader
        title={`Batch: ${batch.batchId}`}
        subtitle={`Source Hive: ${batch.hiveId} ${batch.farmName ? `• ${batch.farmName}` : ''} • Harvested on ${batch.harvestDate}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StatusBadge status={batch.status} />

            {batch.status === 'PROCESSED' && (role === 'ADMIN' || role === 'BEEKEEPER') && (
              <button
                className="btn-primary"
                onClick={handleMarkReadyForPackaging}
                disabled={updatingStatus}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              >
                <PackageCheck size={16} /> {updatingStatus ? 'Updating...' : 'Mark Ready For Packaging'}
              </button>
            )}

            {role === 'ADMIN' && batch.status !== 'RECALLED' && (
              <button
                className="btn-secondary"
                onClick={handleRecall}
                disabled={recalling}
                style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.1)' }}
              >
                <ShieldAlert size={16} /> {recalling ? 'Recalling...' : 'Emergency Recall'}
              </button>
            )}
          </div>
        }
      />

      {/* Batch Overview Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Harvest Quantity</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{batch.quantity} {batch.unit}</div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Source: {batch.quantitySource || 'Manual Harvest Quantity'}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Quality Gate Status</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: batch.status === 'REQUIRES_REVIEW' ? '#f43f5e' : 'var(--honey-gold)' }}>
            {latestQualityTest ? latestQualityTest.result : 'PENDING TEST'}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {latestQualityTest ? `Tested on ${new Date(latestQualityTest.timestamp).toLocaleDateString()}` : 'Awaiting Lab Testing'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>AI Screening Classification</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {latestQualityTest?.aiScreeningClass || 'PENDING'}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Phase 6 Rule-Based Decision Support</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Batch Status</div>
          <div style={{ marginTop: '0.25rem' }}>
            <StatusBadge status={batch.status} />
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {batch.status === 'REQUIRES_REVIEW' ? 'Blocked from processing' : 'Off-Chain Traceability Active'}
          </div>
        </div>
      </div>

      {/* Visual Supply Chain Lifecycle Progress Bar */}
      <div className="glass-panel" style={{ padding: '1.75rem 1.5rem', marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '1.5rem', fontWeight: 700 }}>
          Phase 8 Supply Chain Lifecycle & Blockchain Proof Sequence
        </h4>

        {batch.status === 'RECALLED' ? (
          <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontWeight: 600, textAlign: 'center' }}>
            🚨 BATCH EMERGENCY RECALLED — CONSUMER DISTRIBUTION SUSPENDED
          </div>
        ) : batch.status === 'REQUIRES_REVIEW' ? (
          <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> QUALITY REVIEW REQUIRED — BATCH BLOCKED FROM NORMAL PROCESSING
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: '18px', left: '5%', right: '5%', height: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 1 }} />
            <div style={{
              position: 'absolute',
              top: '18px',
              left: '5%',
              width: `${(currentStageIdx / (timelineStages.length - 1)) * 90}%`,
              height: '3px',
              background: 'var(--honey-gold)',
              zIndex: 2,
              transition: 'width 0.5s ease'
            }} />

            {timelineStages.map((stage, idx) => {
              const isCompleted = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, gap: '0.5rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--honey-gold)' : isCompleted ? '#10b981' : '#121824',
                    border: `2px solid ${isCurrent ? '#fbbf24' : isCompleted ? '#10b981' : 'var(--border-color)'}`,
                    color: isCurrent ? '#000' : isCompleted ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--honey-gold)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Phase 8 Blockchain Proof Banner */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Immutable Blockchain Ledger Status
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {traceabilityEvents.some(e => e.blockchainTransactionHash)
                ? 'Batch milestones are anchored on EVM smart contract.'
                : 'Blockchain anchoring is not configured for this development environment.'}
            </div>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/traceability')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            View Full Traceability Audit
          </button>
        </div>
      </div>

      {/* Grid of Dual Cards: Quality Test vs AI Screening */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Card 1: Laboratory Quality Test */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
              <FlaskConical size={20} /> Laboratory / Manual Quality Test
            </h3>
            {(role === 'ADMIN' || role === 'QUALITY_INSPECTOR') && (
              <button className="btn-secondary" onClick={() => navigate('/quality')} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Record Test Result
              </button>
            )}
          </div>

          {qualityTests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
              No laboratory quality tests recorded for this batch yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {qualityTests.map((qt) => (
                <div key={qt.id} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <StatusBadge status={qt.result} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Tested: {new Date(qt.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                    <div>Moisture: <strong>{qt.moisture != null ? `${qt.moisture}%` : 'N/A'}</strong></div>
                    <div>pH Level: <strong>{qt.ph != null ? qt.ph : 'N/A'}</strong></div>
                    <div>Color: <strong>{qt.color || 'Amber'}</strong></div>
                  </div>
                  {qt.notes && <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.4rem' }}>"{qt.notes}"</div>}
                  {qt.verifiedBy && <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Tested By: {qt.verifiedBy}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: AI-Assisted Screening */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
            <Cpu size={20} /> AI-Assisted Screening (Phase 6 Engine)
          </h3>

          {latestQualityTest ? (
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Screening Classification</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {latestQualityTest.aiScreeningClass || 'PURE'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Purity Index Score</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {latestQualityTest.aiPurityScore != null ? `${latestQualityTest.aiPurityScore}%` : '100%'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 'var(--radius-sm)', color: '#38bdf8', fontSize: '0.825rem', lineHeight: '1.4' }}>
                <strong>Scientific Decision Support Recommendation:</strong><br />
                "{latestQualityTest.aiRecommendation || 'Measured parameters are within the configured screening thresholds. Further laboratory validation is recommended for definitive authenticity assessment.'}"
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
              AI screening runs automatically when a lab quality test is recorded.
            </p>
          )}
        </div>
      </div>

      {/* Grid of Sub-records: Processing Logs & Traceability Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Processing Records Section */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
              <Filter size={20} /> Processing & Operations History
            </h3>
            {(role === 'ADMIN' || role === 'BEEKEEPER') && (
              <button className="btn-secondary" onClick={() => navigate('/processing')} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Record Processing
              </button>
            )}
          </div>

          {processingRecords.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
              No processing operations logged for this batch yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {processingRecords.map((pr) => (
                <div key={pr.id} style={{ padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                      ⚙️ {pr.operation || pr.processType}
                    </span>
                    {pr.processingTemperature != null && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--honey-gold)', fontWeight: 600 }}>
                        {pr.processingTemperature}°C ({pr.tempSource || 'Manual Processing Temperature'})
                      </span>
                    )}
                  </div>
                  {pr.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.4rem 0' }}>{pr.description}</p>}
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Operator: {pr.operator || pr.verifiedBy || 'Processing Manager'}</span>
                    <span>{new Date(pr.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cryptographic Traceability Audit Log */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--honey-gold)' }}>
            <FileCheck2 size={20} /> Off-Chain Traceability Audit Timeline
          </h3>

          {traceabilityEvents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
              No traceability events recorded for this batch yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {traceabilityEvents.map((evt) => (
                <div key={evt.id} style={{ padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.875rem' }}>{evt.eventType}</span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                    Data Hash: {evt.eventDataHash}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
