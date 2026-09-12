import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Search, CheckCircle2, AlertTriangle, MapPin, Flower2, 
  Award, CheckCircle, Database, Layers, FileText
} from 'lucide-react';
import { verifyPackage } from '../services/api';
import { VerificationResult } from '../types';
import { StatusBadge } from '../components/common/UIComponents';

export const VerifyPage: React.FC = () => {
  const { packageId: routePackageId } = useParams<{ packageId?: string }>();
  const navigate = useNavigate();
  
  const [searchInput, setSearchInput] = useState(routePackageId || '');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedId, setSearchedId] = useState<string>('');

  const fetchVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setSearchedId(idToVerify.trim());
    try {
      const data = await verifyPackage(idToVerify.trim());
      setResult(data);
    } catch (err: any) {
      setResult(null);
      setError(err.response?.data?.message || err.message || `No verification record found for package ID "${idToVerify.trim()}".`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routePackageId) {
      setSearchInput(routePackageId);
      fetchVerification(routePackageId);
    }
  }, [routePackageId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${encodeURIComponent(searchInput.trim())}`);
      fetchVerification(searchInput.trim());
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '2rem 1rem'
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        
        {/* Top Navbar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--honey-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}
            >
              🍯
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)' }}>
                HoneyChain
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Customer Verification Portal
              </div>
            </div>
          </div>

          <Link to="/login" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            Operator Sign In
          </Link>
        </div>

        {/* Hero & Search Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            Honey Digital Passport
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            Scan or enter a package serial ID to inspect verified farm-to-table lineage and blockchain ledger proofs.
          </p>
        </div>

        {/* Search Input Card */}
        <form onSubmit={handleSearchSubmit} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Package ID (e.g., HC-PKG-2026-001)"
              className="form-control"
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                fontSize: '0.925rem'
              }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
            <ShieldCheck size={16} /> {loading ? 'Verifying...' : 'Verify Record'}
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Retrieving traceability lineage from HoneyChain backend...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--status-danger-border)', backgroundColor: 'var(--status-danger-bg)' }}>
            <AlertTriangle size={36} style={{ color: 'var(--status-danger)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--status-danger)' }}>Verification Record Not Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto 1rem' }}>
              {error}
            </p>
          </div>
        )}

        {/* Verification Results */}
        {!loading && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Traceability Verified Header Banner */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'var(--status-success-border)', background: 'var(--status-success-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                    <CheckCircle2 size={14} /> TRACEABILITY RECORD VERIFIED
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                    Honey Digital Passport #{result.package?.packageId || searchedId}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    Linked Honey Batch: <strong style={{ color: 'var(--honey-brown)' }}>{result.batch?.batchId || result.package?.batchId || 'N/A'}</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'right', background: 'var(--bg-secondary)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    BLOCKCHAIN VERIFICATION
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: result.blockchainVerificationStatus === 'VERIFIED' ? 'var(--status-success)' : 'var(--honey-brown)', marginTop: '0.15rem' }}>
                    {result.blockchainVerificationStatus === 'VERIFIED'
                      ? '✓ ANCHORED ON-CHAIN'
                      : result.blockchainVerificationStatus === 'PARTIALLY_VERIFIED'
                      ? 'PARTIALLY VERIFIED'
                      : 'OFF-CHAIN VERIFIED'}
                  </div>
                </div>
              </div>
            </div>

            {/* Traceability Disclaimer */}
            <div className="glass-panel" style={{ padding: '0.85rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong>Traceability & Authenticity Notice:</strong> Blockchain verifies the integrity of recorded supply chain events and chain-of-custody lineage. Chemical purity verification requires laboratory testing.
              </div>
            </div>

            {/* Origin & Harvest Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.15rem' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} style={{ color: 'var(--honey-amber)' }} /> Apiary & Farm Origin
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                  {result.farm?.name || 'Himalayan Organic Apiary'}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Location: {result.farm?.location || 'Himachal Pradesh, India'}
                </div>
                {result.hive && (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
                    Source Hive: <strong style={{ color: 'var(--text-primary)' }}>{result.hive.name || result.hive.hiveId}</strong>
                  </div>
                )}
              </div>

              <div className="glass-panel" style={{ padding: '1.15rem' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Flower2 size={15} style={{ color: 'var(--honey-amber)' }} /> Harvest Lineage
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                  Batch Code: {result.batch?.batchId || 'N/A'}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Harvest Date: {result.batch?.harvestDate ? new Date(result.batch.harvestDate).toLocaleDateString() : 'Recorded Harvest'}
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
                  Batch Quantity: {result.batch?.quantity || 'N/A'} {result.batch?.unit || 'kg'}
                </div>
              </div>
            </div>

            {/* Laboratory Quality Results */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={18} style={{ color: 'var(--honey-amber)' }} /> Laboratory Quality Analysis
              </h3>
              {result.qualityTests && result.qualityTests.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  {result.qualityTests.map((q) => (
                    <div key={q.id} style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)' }}>RESULT</span>
                        <StatusBadge status={q.result} />
                      </div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        <div>Moisture: <strong>{q.moisture != null ? `${q.moisture}%` : 'Not recorded'}</strong></div>
                        <div>pH Level: <strong>{q.ph != null ? q.ph : 'Not recorded'}</strong></div>
                        <div>Color Grade: <strong>{q.color || 'Amber Gold'}</strong></div>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        Certified by: {q.verifiedBy || 'Lab Inspector'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No laboratory quality test records filed for this batch.
                </div>
              )}
            </div>

            {/* Processing Lineage */}
            {result.processingRecords && result.processingRecords.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={18} style={{ color: 'var(--status-info)' }} /> Processing Lineage Log
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.processingRecords.map((pr) => (
                    <div key={pr.id} style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                          {pr.processType || pr.operation}
                        </span>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{pr.description || 'Standard honey processing operation'}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        <div>{pr.timestamp ? new Date(pr.timestamp).toLocaleDateString() : 'N/A'}</div>
                        <div>Operator: {pr.operator || pr.verifiedBy || 'Processing Manager'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cryptographic Supply Chain Ledger */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={18} style={{ color: 'var(--blockchain-purple)' }} /> Cryptographic Supply Chain Ledger
              </h3>
              {result.traceabilityEvents && result.traceabilityEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {result.traceabilityEvents.map((evt, idx) => {
                    const isTxHash = evt.blockchainTransactionHash && evt.blockchainTransactionHash.startsWith('0x');
                    return (
                      <div key={evt.id || idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isTxHash ? 'var(--status-success-bg)' : 'var(--bg-primary)', border: isTxHash ? '1px solid var(--status-success)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isTxHash ? 'var(--status-success)' : 'var(--text-muted)' }}>
                            <CheckCircle size={14} />
                          </div>
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--honey-brown)' }}>{evt.eventType}</span>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Not recorded'}</span>
                          </div>
                          <div style={{ fontSize: '0.725rem', fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            Data Hash (SHA-256): {evt.eventDataHash || 'Not recorded'}
                          </div>
                          {isTxHash && (
                            <div style={{ fontSize: '0.725rem', fontFamily: 'monospace', color: 'var(--status-success)', marginTop: '0.25rem' }}>
                              EVM Transaction Hash: {evt.blockchainTransactionHash}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No traceability events recorded on ledger.
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.75rem 0' }}>
              HoneyChain Digital Supply Chain Ledger &bull; Immutable Traceability Integrity
            </div>

          </div>
        )}

        {/* Initial Prompt state if no search performed yet */}
        {!loading && !result && !error && (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <FileText size={40} style={{ color: 'var(--honey-amber)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>Scan or Search to Verify</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto' }}>
              Enter a Honey Package ID above or scan the QR code printed on your retail package to verify complete farm-to-table lineage.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
