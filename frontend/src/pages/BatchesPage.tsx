import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Boxes, Plus, Calendar, Flower2, Scale } from 'lucide-react';

export const BatchesPage: React.FC = () => {
  const batches = [
    { code: 'HC-BATCH-2026-VALLEY-09', floral: 'Wild Himalayan Acacia', date: '2026-08-28', weight: '450 kg', hive: 'HIVE-HIM-001', status: 'VERIFIED' },
    { code: 'HC-BATCH-2026-VALLEY-10', floral: 'Multiflora Blossom', date: '2026-09-02', weight: '320 kg', hive: 'HIVE-HIM-002', status: 'PROCESSING' },
    { code: 'HC-BATCH-2026-RIDGE-01', floral: 'Mustard Floral Specimen', date: '2026-09-05', weight: '510 kg', hive: 'HIVE-HIM-003', status: 'HARVESTED' },
  ];

  return (
    <MainLayout title="Honey Batch Management" subtitle="Harvest Tracking, Floral Origin Mapping & Batch Lifecycle">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Harvest Batches</h3>
        <button className="btn-primary">
          <Plus size={16} /> Record New Harvest Batch
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem' }}>BATCH CODE</th>
              <th style={{ padding: '1rem' }}>FLORAL SOURCE</th>
              <th style={{ padding: '1rem' }}>HARVEST DATE</th>
              <th style={{ padding: '1rem' }}>WEIGHT</th>
              <th style={{ padding: '1rem' }}>ORIGIN HIVE</th>
              <th style={{ padding: '1rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.code} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--honey-gold)' }}>{b.code}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Flower2 size={15} style={{ color: 'var(--honey-bright)' }} /> {b.floral}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>{b.date}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{b.weight}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{b.hive}</td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-success">{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};
