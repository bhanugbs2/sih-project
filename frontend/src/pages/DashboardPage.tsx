import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { fetchSystemStatus } from '../services/api';
import { SystemStatus } from '../services/types';
import { Cpu, Boxes, FlaskConical, Link2, ShieldCheck, Activity, Layers, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetchSystemStatus().then(setStatus);
  }, []);

  return (
    <MainLayout title="Beekeeping & Traceability Dashboard" subtitle="Real-time IoT Monitoring, AI Quality Scoring & Blockchain Audit">
      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIVE SMART HIVES</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--honey-gold)' }}>
              <Cpu size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>142 Nodes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            <Activity size={13} /> 99.1% Sensor Uptime
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL HONEY BATCHES</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <Boxes size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>3,480 kg</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Harvested Season 2026
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AI PURITY SCORE</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <FlaskConical size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }} className="gradient-text-emerald">99.4%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Zero Adulteration Detected
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>BLOCKCHAIN ANCHORS</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-violet)' }}>
              <Link2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>1,290 Tx</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
            100% Immutable Verified
          </div>
        </div>
      </div>

      {/* System Status & Architecture Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} style={{ color: 'var(--honey-gold)' }} /> System Architecture Modules (Phase 1)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {status &&
              Object.entries(status.modules).map(([moduleKey, techDesc]) => (
                <div
                  key={moduleKey}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, color: 'var(--honey-gold)' }}>
                    {moduleKey}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.2rem' }}>{techDesc}</div>
                </div>
              ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} /> Consumer Portal
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Every jar produced by HoneyChain features an unforgeable QR code linking directly to on-chain proof of origin.
            </p>
          </div>
          <Link to="/verify" className="btn-primary" style={{ justifyContent: 'center' }}>
            Open Verification Portal <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};
