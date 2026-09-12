import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState } from '../components/common/UIComponents';
import { getAllHives, getHiveAlerts, getAllAIAlerts, markAlertRead, acknowledgeAlert } from '../services/api';
import { AIAlert } from '../types';
import { AlertOctagon, ShieldAlert, ArrowRight, Clock, RefreshCw, CheckCircle2, Eye } from 'lucide-react';

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
    <>
      <PageHeader
        title="AI-Assisted Pattern Screening & Early Warning"
        subtitle="Automated environmental anomaly detection and beekeeper inspection alerts"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={13} />
              <span>Updated {secondsAgo}s ago</span>
            </div>
            <button className="btn-secondary" onClick={() => loadAlertsData(false)} style={{ fontSize: '0.8rem', gap: '0.35rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'ALL' ? 'var(--honey-amber)' : 'var(--bg-secondary)',
            color: filter === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)'
          }}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'UNREAD' ? 'var(--status-danger)' : 'var(--bg-secondary)',
            color: filter === 'UNREAD' ? '#FFFFFF' : 'var(--text-secondary)'
          }}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('CRITICAL')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'CRITICAL' ? 'var(--status-danger)' : 'var(--bg-secondary)',
            color: filter === 'CRITICAL' ? '#FFFFFF' : 'var(--text-secondary)'
          }}
        >
          Critical
        </button>
        <button
          onClick={() => setFilter('ACKNOWLEDGED')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'ACKNOWLEDGED' ? 'var(--status-success)' : 'var(--bg-secondary)',
            color: filter === 'ACKNOWLEDGED' ? '#FFFFFF' : 'var(--text-secondary)'
          }}
        >
          Acknowledged
        </button>
      </div>

      {loading ? (
        <LoadingState message="Fetching AI pattern screening alerts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadAlertsData(false)} />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          title={filter === 'ALL' ? 'No Active Alerts' : `No ${filter.toLowerCase()} alerts found`}
          description="All apiary hives are operating within standard environmental screening parameters."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderLeft: `4px solid ${
                  alert.status === 'CRITICAL' ? 'var(--status-danger)' : alert.status === 'WARNING' ? 'var(--status-warning)' : 'var(--status-success)'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <ShieldAlert size={18} style={{ color: alert.status === 'CRITICAL' ? 'var(--status-danger)' : 'var(--status-warning)' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                        Hive: {alert.hiveId}
                      </h3>
                      {!alert.isRead && (
                        <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--status-danger)', color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>
                          UNREAD
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      AI-Assisted Screening Pattern Analysis
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusBadge status={alert.status} />

                  {!alert.isRead && (
                    <button
                      className="btn-secondary"
                      onClick={() => handleMarkRead(alert.id)}
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} /> Mark Read
                    </button>
                  )}

                  {alert.isAcknowledged ? (
                    <span style={{ fontSize: '0.775rem', color: 'var(--status-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Acknowledged
                    </span>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => handleAcknowledge(alert.id)}
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <CheckCircle2 size={13} /> Acknowledge
                    </button>
                  )}

                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/hives/${alert.hiveId}`)}
                    style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                  >
                    View Hive <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>
                {alert.message}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <Clock size={13} />
                <span>Detected At: {new Date(alert.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
