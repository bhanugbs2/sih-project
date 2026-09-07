import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Filter, Thermometer, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ProcessingPage: React.FC = () => {
  return (
    <MainLayout title="Processing & Extraction Logs" subtitle="Filtration Microns, Moisture Reduction & Processing Control">
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Processing Facility Log</h3>
          <span className="badge badge-success"><CheckCircle2 size={13} /> RAW & UNHEATED</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Extraction facility logs record processing temperature limits (Max 40°C) to preserve active enzymes, diastase activity, and beneficial pollen grains.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MAX TEMPERATURE</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--honey-gold)' }}>36.5 °C</div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FILTRATION MESH</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>200 Microns</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
