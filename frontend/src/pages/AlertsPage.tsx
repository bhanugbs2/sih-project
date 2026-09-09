import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState } from '../components/common/UIComponents';
import { getAllHives, getHiveAlerts, getAllAIAlerts } from '../services/api';
import { AIAlert } from '../types';
import { AlertOctagon, ShieldAlert, ArrowRight, Clock } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlertsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAIAlerts().catch(async () => {
        const hives = await getAllHives();
        if (hives.length > 0) {
          const allAlertsPromises = hives.map((h) => getHiveAlerts(h.hiveId).catch(() => []));
          const results = await Promise.all(allAlertsPromises);
          return results.flat().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        return [];
      });
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI health alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData();
  }, []);

  return (
    <MainLayout>
      <PageHeader
        title="AI Swarm & Health Alerts"
        subtitle="Automated anomaly detection, swarm distress indicators, and environmental risk scores"
      />

      {loading ? (
        <LoadingState message="Analyzing hive AI alerts log..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAlertsData} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          title="No AI Alerts Triggered"
          description="All monitored hives are operating within optimal temperature, humidity, and acoustic stability parameters."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderLeft: `5px solid ${
                  alert.status === 'CRITICAL' ? '#f43f5e' : alert.status === 'WARNING' ? '#f59e0b' : '#10b981'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: alert.status === 'CRITICAL' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: alert.status === 'CRITICAL' ? '#f43f5e' : '#f59e0b'
                  }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Hive: {alert.hiveId}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Risk Score: {alert.riskScore}/100
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={alert.status} />
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/hives/${alert.hiveId}`)}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    View Hive <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500, margin: '0 0 0.75rem 0' }}>
                {alert.message}
              </p>

              {alert.factors && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem'
                }}>
                  <strong style={{ color: 'var(--honey-gold)' }}>Diagnostic Factors:</strong> {alert.factors}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Clock size={14} />
                <span>Triggered: {new Date(alert.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};
