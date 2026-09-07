import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { FlaskConical, TestTube, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export const QualityPage: React.FC = () => {
  return (
    <MainLayout title="Lab & Quality Testing Portal" subtitle="AI Purity Analysis, HMF Values, Diastase Activity & Adulteration Checks">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--honey-gold)' }}>BATCH: HC-BATCH-2026-VALLEY-09</span>
            <span className="badge badge-success"><CheckCircle2 size={13} /> PURE HONEY</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            AI Quality Index Score: <span className="gradient-text-emerald">99.4 / 100</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Moisture Content (Max 18%)</span>
              <span style={{ fontWeight: 700 }}>16.2%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>pH Level (3.4 - 6.1)</span>
              <span style={{ fontWeight: 700 }}>3.85</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HMF Value (Max 40 mg/kg)</span>
              <span style={{ fontWeight: 700 }}>11.4 mg/kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Diastase Number (Min 8)</span>
              <span style={{ fontWeight: 700 }}>14.2 Schade Units</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TestTube size={18} style={{ color: 'var(--accent-cyan)' }} /> Laboratory Certificate
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Automated spectral analysis and C3/C4 sugar adulteration verification complete. Results cryptographic signature ready for on-chain anchoring.
            </p>
          </div>
          <button className="btn-secondary" style={{ justifyContent: 'center' }}>
            <FileText size={16} /> Export Quality Certificate PDF
          </button>
        </div>
      </div>
    </MainLayout>
  );
};
