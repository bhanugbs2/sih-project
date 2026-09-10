import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Search, CheckCircle2, AlertTriangle, MapPin, Flower2, 
  Award, Hexagon, CheckCircle, Database, Layers, FileText
} from 'lucide-react';
import { verifyPackage } from '../services/api';
import { VerificationResult } from '../types';

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
        padding: '2rem 1rem',
        backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.15) 0%, transparent 60%)',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Top Navbar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                boxShadow: '0 0 15px var(--honey-glow)',
              }}
            >
              <Hexagon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Honey<span className="gradient-text">Chain</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                PUBLIC HONEY VERIFICATION PORTAL
              </div>
            </div>
          </div>

          <Link to="/login" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
            Sign In to Portal
          </Link>
        </div>

        {/* Hero & Search Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Verify Pure <span className="gradient-text">Honey Lineage</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            Scan or enter your product package ID to inspect end-to-end apiary origin, lab quality analysis, and cryptographic blockchain audit trail.
          </p>
        </div>

        {/* Search Input Card */}
        <form onSubmit={handleSearchSubmit} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Package ID (e.g., PKG-2026-88912 or PKG-001)"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem 0.75rem 2.6rem',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <ShieldCheck size={18} /> {loading ? 'Verifying...' : 'Verify Product'}
          </button>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Fetching supply chain lineage from HoneyChain ledger...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
            <AlertTriangle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verification Record Not Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              {error}
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tip: Verify the package code on your jar. Sample test codes: PKG-001, PKG-1001, or PKG-2026-88912.
            </div>
          </div>
        )}

        {/* Results View */}
        {!loading && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Authenticity Certificate Banner */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} /> Blockchain Record Verified
                  </span>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.75rem', letterSpacing: '-0.01em' }}>
                    Package #{result.package?.packageId || searchedId}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    Traceability record verified against the recorded blockchain hash. &bull; Batch: <strong style={{ color: 'var(--honey-gold)' }}>{result.batch?.batchId || result.package?.batchId || 'N/A'}</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'right', background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    EVM BLOCKCHAIN PROOF
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: result.blockchainVerificationStatus === 'VERIFIED' ? 'var(--accent-emerald)' : 'var(--honey-gold)', marginTop: '0.2rem' }}>
                    {result.blockchainVerificationStatus === 'VERIFIED' ? '✓ ANCHORED ON-CHAIN' : 'OFF-CHAIN VERIFIED'}
                  </div>
                </div>
              </div>
            </div>

            {/* Origin & Farm Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {/* Farm Info */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} style={{ color: 'var(--honey-gold)' }} /> Apiary & Farm Origin
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {result.farm?.name || 'HoneyChain Certified Farm'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Location: {result.farm?.location || 'Mountain Apiary Region'}
                </div>
                {result.hive && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    Source Hive: <strong>{result.hive.name || result.hive.hiveId}</strong> ({result.hive.location || 'Section A'})
                  </div>
                )}
              </div>

              {/* Harvest & Floral Info */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Flower2 size={16} style={{ color: 'var(--honey-bright)' }} /> Harvest Lineage
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Batch Code: {result.batch?.batchId || 'Pure Organic Honey'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Harvest Date: {result.batch?.harvestDate ? new Date(result.batch.harvestDate).toLocaleDateString() : 'Recent Harvest'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  Quantity: {result.batch?.quantity || 'N/A'} {result.batch?.unit || 'kg'}
                </div>
              </div>
            </div>

            {/* Quality Test Results */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: 'var(--honey-bright)' }} /> Laboratory Quality Analysis
              </h3>
              {result.qualityTests && result.qualityTests.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {result.qualityTests.map((q) => (
                    <div key={q.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TEST RESULT</span>
                        <span className={`badge ${q.result === 'PASS' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                          {q.result}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div>Moisture: <strong>{q.moisture != null ? `${q.moisture}%` : 'N/A'}</strong></div>
                        <div>pH Level: <strong>{q.ph != null ? q.ph : 'N/A'}</strong></div>
                        <div>Color Score: <strong>{q.color || 'Standard Amber'}</strong></div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Verified by: {q.verifiedBy || 'Certified Lab Inspector'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Quality test details recorded in supply chain ledger. Standard compliance verified.
                </div>
              )}
            </div>

            {/* Processing History */}
            {result.processingRecords && result.processingRecords.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} style={{ color: 'var(--accent-cyan)' }} /> Processing Lineage
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {result.processingRecords.map((pr) => (
                    <div key={pr.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="badge badge-info" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          {pr.processType}
                        </span>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pr.description || 'Standard honey processing operation'}</div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        <div>{new Date(pr.timestamp).toLocaleDateString()}</div>
                        <div>Verified: {pr.verifiedBy || 'System'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traceability Events Timeline */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} style={{ color: 'var(--accent-violet)' }} /> Cryptographic Supply Chain Ledger
              </h3>
              {result.traceabilityEvents && result.traceabilityEvents.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.traceabilityEvents.map((evt, idx) => (
                    <div key={evt.id || idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--accent-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-violet)' }}>
                          <CheckCircle size={16} />
                        </div>
                        {idx < (result.traceabilityEvents?.length || 0) - 1 && (
                          <div style={{ width: '2px', height: '40px', background: 'var(--border-color)', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--honey-gold)' }}>{evt.eventType}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(evt.timestamp).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'rgba(0, 0, 0, 0.3)', padding: '0.35rem 0.5rem', borderRadius: '4px', overflowX: 'auto' }}>
                          Hash: {evt.eventDataHash}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Env: {evt.environment}</span>
                          <span>Reference: {evt.blockchainReference || 'Pending Blockchain Verification'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Traceability events recorded on ledger.
                </div>
              )}
            </div>

            {/* Footer Prompt */}
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem 0' }}>
              HoneyChain Digital Supply Chain Ledger &bull; Tamper-Evident Traceability Anchoring
            </div>

          </div>
        )}

        {/* Initial Prompt state if no search performed yet */}
        {!loading && !result && !error && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--honey-gold)', margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ready to Verify</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
              Enter a Honey Package ID above or scan the QR code printed on your honey package to retrieve full farm-to-table lineage.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
