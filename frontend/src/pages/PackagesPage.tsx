import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { PackageCheck, QrCode, ShieldCheck } from 'lucide-react';

export const PackagesPage: React.FC = () => {
  return (
    <MainLayout title="Packaging & QR Serialization" subtitle="Jar Serialization, QR Generation & Distribution Tracking">
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <QrCode size={20} style={{ color: 'var(--honey-gold)' }} /> QR Code Serialization Service
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Every jar unit receives a unique serialized cryptographic identifier linked to the batch Merkle root on-chain.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800 }}>
            <QrCode size={48} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--honey-gold)' }}>HC-QR-2026-88912</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Batch: HC-BATCH-2026-VALLEY-09</div>
            <span className="badge badge-success" style={{ marginTop: '0.35rem' }}><ShieldCheck size={12} /> VERIFIED SERIAL</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
