import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, MapPin, Flower2, Calendar, Award, ExternalLink, Hexagon } from 'lucide-react';
import { verifyHoneyQR } from '../services/api';
import { VerificationResult } from '../services/types';

export const VerifyPage: React.FC = () => {
  const [qrInput, setQrInput] = useState('HC-QR-2026-88912');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verifyHoneyQR(qrInput);
    setResult(res);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem',
        backgroundImage: 'radial-gradient(circle at 50% 20%, var(--honey-glow) 0%, transparent 60%)',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              marginBottom: '1rem',
              boxShadow: '0 0 20px var(--honey-glow)',
            }}
          >
            <Hexagon size={28} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Honey<span className="gradient-text">Chain</span> Consumer Verification
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enter your Honey Jar QR Code Identifier to verify 100% pure origin and blockchain audit trail
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleVerify} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="e.g. HC-QR-2026-88912"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>
          <button type="submit" className="btn-primary">
            <ShieldCheck size={18} /> Verify Honey Batch
          </button>
        </form>

        {/* Result Card */}
        {result && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                  <CheckCircle2 size={14} /> 100% AUTHENTIC & PURE
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.5rem' }}>{result.batchCode}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI PURITY SCORE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }} className="gradient-text-emerald">
                  {result.purityScore}%
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} style={{ color: 'var(--honey-gold)' }} /> Apiary Location
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>{result.apiaryLocation}</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Flower2 size={14} style={{ color: 'var(--honey-bright)' }} /> Floral Source
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>{result.floralSource}</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} /> Harvest Date
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>{result.harvestDate}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-violet)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BLOCKCHAIN PROOF OF ORIGIN
                </div>
                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Tx: {result.blockchainTxHash.substring(0, 30)}...
                </div>
              </div>
              <a href={result.blockchainExplorerUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                Explorer <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
