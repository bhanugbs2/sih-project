import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Cpu, Thermometer, Droplets, Scale, Activity, Plus } from 'lucide-react';

export const HivesPage: React.FC = () => {
  const hivesList = [
    { code: 'HIVE-HIM-001', location: 'Apiary #1 - Ridge East', temp: '34.2 °C', humidity: '58%', weight: '42.5 kg', battery: '98%', status: 'OPTIMAL' },
    { code: 'HIVE-HIM-002', location: 'Apiary #1 - Ridge West', temp: '35.1 °C', humidity: '55%', weight: '46.0 kg', battery: '94%', status: 'OPTIMAL' },
    { code: 'HIVE-HIM-003', location: 'Apiary #2 - Valley South', temp: '36.8 °C', humidity: '64%', weight: '38.2 kg', battery: '82%', status: 'WARNING' },
  ];

  return (
    <MainLayout title="Smart Hive Monitoring (IoT)" subtitle="ESP32 Telemetry, Temperature, Humidity, acoustic frequency & Weight Sensors">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Telemetry Sensor Nodes</h3>
        <button className="btn-primary">
          <Plus size={16} /> Register ESP32 Node
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {hivesList.map((hive) => (
          <div key={hive.code} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{hive.code}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hive.location}</div>
              </div>
              <span className={`badge ${hive.status === 'OPTIMAL' ? 'badge-success' : 'badge-warning'}`}>
                {hive.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Thermometer size={12} /> Temp
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{hive.temp}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Droplets size={12} /> Humidity
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{hive.humidity}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Scale size={12} /> Weight
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{hive.weight}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Battery: {hive.battery}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Activity size={12} style={{ color: 'var(--accent-emerald)' }} /> Live Ping 4s ago
              </span>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};
