import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Link2, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

export const BlockchainPage: React.FC = () => {
  return (
    <MainLayout title="Blockchain Ledger Audit" subtitle="Immutable Batch Anchors, Merkle Root Hashes & Contract State">
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link2 size={20} style={{ color: 'var(--accent-violet)' }} /> Smart Contract State & Anchors
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TX HASH</span>
              <span className="badge badge-purple"><CheckCircle2 size={12} /> CONFIRMED</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--accent-cyan)', margin: '0.4rem 0' }}>
              0x8f2a4e719c8d6e3f5b1a0d9c8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Merkle Root: 0xa1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
