import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState } from '../components/common/UIComponents';
import { getAllHives, getHiveAlerts, getAllAIAlerts, markAlertRead, acknowledgeAlert } from '../services/api';
import { AIAlert } from '../types';
import { AlertOctagon, ShieldAlert, ArrowRight, Clock, RefreshCw, CheckCircle2, Eye, Filter, Cpu } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL' | 'ACKNOWLEDGED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadAlertsData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
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
      setSecondsAgo(0);
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || 'Failed to fetch AI health alerts.');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData(false);

    timerRef.current = setInterval(() => {
      loadAlertsData(true);
    }, 15000);

    secondsTimerRef.current = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (secondsTimerRef.current) clearInterval(secondsTimerRef.current);
    };
  }, []);

  const handleMarkRead = async (alertId: string) => {
    try {
      const updated = await markAlertRead(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const updated = await acknowledgeAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'UNREAD') return !alert.isRead;
    if (filter === 'CRITICAL') return alert.status === 'CRITICAL';
    if (filter === 'ACKNOWLEDGED') return alert.isAcknowledged;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <MainLayout>
      <PageHeader
        title="AI Swarm & Health Alerts"
        subtitle="Automated anomaly detection, telemetry drift indicators, and environmental risk scores"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={13} className="pulsing-icon" />
              <span>Auto-refreshing (Updated {secondsAgo}s ago)</span>
            </div>
            <button className="btn-secondary" onClick={() => loadAlertsData(false)} style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={14} /> Refresh Now
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setFilter('ALL')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filter === 'ALL' ? 'var(--honey-gold)' : 'transparent',
              color: filter === 'ALL' ? '#000' : 'var(--text-secondary)'
            }}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filter === 'UNREAD' ? 'var(--accent-rose)' : 'transparent',
              color: filter === 'UNREAD' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('CRITICAL')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filter === 'CRITICAL' ? '#f43f5e' : 'transparent',
              color: filter === 'CRITICAL' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter('ACKNOWLEDGED')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filter === 'ACKNOWLEDGED' ? 'var(--accent-emerald)' : 'transparent',
              color: filter === 'ACKNOWLEDGED' ? '#000' : 'var(--text-secondary)'
            }}
          >
            Acknowledged
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Analyzing hive AI alerts log..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadAlertsData(false)} />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          title={filter === 'ALL' ? 'No AI Alerts Triggered' : `No ${filter.toLowerCase()} alerts found`}
          description="All monitored hives are operating within optimal environmental thresholds and screening guidelines."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderLeft: `5px solid ${
                  alert.status === 'CRITICAL' ? '#f43f5e' : alert.status === 'WARNING' ? '#f59e0b' : '#10b981'
                }`,
                opacity: alert.isRead ? 0.85 : 1.0
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        Hive: {alert.hiveId}
                      </h3>
                      {!alert.isRead && (
                        <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--accent-rose)', color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>
                          NEW / UNREAD
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Type: {alert.alertType || 'TELEMETRY_ANOMALY'} | Risk Score: {alert.riskScore}/100
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={alert.status} />

                  {!alert.isRead && (
                    <button
                      className="btn-secondary"
                      onClick={() => handleMarkRead(alert.id)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      title="Mark as Read"
                    >
                      <Eye size={14} /> Mark Read
                    </button>
                  )}

                  {alert.isAcknowledged ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                      <CheckCircle2 size={15} /> Acknowledged by {alert.acknowledgedBy || 'Beekeeper'}
                    </span>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => handleAcknowledge(alert.id)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <CheckCircle2 size={14} /> Acknowledge
                    </button>
                  )}

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
                  <strong style={{ color: 'var(--honey-gold)' }}>Screening Factors:</strong> {alert.factors}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} />
                  <span>Triggered: {new Date(alert.timestamp).toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {alert.modelVersion && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Cpu size={12} /> Model: {alert.modelVersion}
                    </span>
                  )}
                  {alert.isAcknowledged && alert.acknowledgedAt && (
                    <span>Ack Time: {new Date(alert.acknowledgedAt).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};
