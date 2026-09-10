import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, MetricCard, LoadingState, ErrorState, StatusBadge } from '../components/common/UIComponents';
import { getAllFarms, getAllHives, getAllBatches, getAllAIAlerts, getUnreadAlertCount, getSystemStatus, markAlertRead, acknowledgeAlert } from '../services/api';
import { Farm, Hive, HoneyBatch, AIAlert, SystemStatus as SystemStatusType } from '../types';
import { Building2, Boxes, PackageCheck, AlertOctagon, Activity, ShieldCheck, ArrowUpRight, Cpu, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [systemStatus, setSystemStatus] = useState<SystemStatusType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadDashboardData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const [farmsData, hivesData, batchesData, alertsData, countData, statusData] = await Promise.all([
        getAllFarms().catch(() => []),
        getAllHives().catch(() => []),
        getAllBatches().catch(() => []),
        getAllAIAlerts().catch(() => []),
        getUnreadAlertCount().catch(() => 0),
        getSystemStatus().catch(() => null),
      ]);

      setFarms(farmsData);
      setHives(hivesData);
      setBatches(batchesData);
      setAlerts(alertsData);
      setUnreadCount(countData);
      setSystemStatus(statusData);
      setSecondsAgo(0);
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || 'Failed to load dashboard statistics.');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(false);

    // Auto-refresh polling loop every 15 seconds
    timerRef.current = setInterval(() => {
      loadDashboardData(true);
    }, 15000);

    // Second tick for "Updated X seconds ago"
    secondsTimerRef.current = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (secondsTimerRef.current) clearInterval(secondsTimerRef.current);
    };
  }, []);

  const handleAcknowledge = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await acknowledgeAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const activeHivesCount = hives.filter((h) => h.status === 'ACTIVE').length;
  const packagedBatchesCount = batches.filter((b) => b.status === 'PACKAGED' || b.status === 'COMPLETED').length;

  return (
    <MainLayout>
      <PageHeader
        title="HoneyChain Dashboard"
        subtitle="Real-time smart beekeeping telemetry & supply chain traceability overview"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={13} className="pulsing-icon" />
              <span>Auto-refreshing (Updated {secondsAgo}s ago)</span>
            </div>
            <button className="btn-primary" onClick={() => navigate('/hives')}>
              <Boxes size={18} /> View All Hives
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Fetching live backend analytics..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadDashboardData(false)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Summary Metric Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            <MetricCard
              title="Registered Farms"
              value={farms.length}
              subtext="Active Beekeeping Apiaries"
              icon={Building2}
              color="var(--honey-gold)"
            />
            <MetricCard
              title="Total Monitored Hives"
              value={hives.length}
              subtext={`${activeHivesCount} Active Operational`}
              icon={Boxes}
              color="var(--accent-emerald)"
            />
            <MetricCard
              title="Harvested Batches"
              value={batches.length}
              subtext={`${packagedBatchesCount} Packaged Retail`}
              icon={PackageCheck}
              color="var(--accent-cyan)"
            />
            <MetricCard
              title="AI Health Alerts"
              value={alerts.length}
              subtext={unreadCount > 0 ? `${unreadCount} Unread Action Required` : 'All Alerts Handled'}
              icon={AlertOctagon}
              color={unreadCount > 0 ? 'var(--accent-rose)' : 'var(--accent-violet)'}
            />
          </div>

          {/* Quick Action Navigation Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/hives')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--honey-gold)' }}>
                  <Activity size={22} />
                </div>
                <ArrowUpRight size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>IoT Sensor Telemetry</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Monitor live temperature, humidity, acoustics, and hive weight.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/quality')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                  <ShieldCheck size={22} />
                </div>
                <ArrowUpRight size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Quality & Lab Inspection</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Record moisture, pH, HMF values, and lab purity certifications.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/traceability')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                  <Cpu size={22} />
                </div>
                <ArrowUpRight size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Supply Chain Audit</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                View complete cryptographic event logs and blockchain anchor references.
              </p>
            </div>
          </div>

          {/* Recent AI Alerts Overview */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Recent AI Alerts ({unreadCount} Unread)
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated anomaly screening & environmental drift alerts</span>
              </div>
              <button className="btn-secondary" onClick={() => navigate('/alerts')} style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                View All Alerts ({alerts.length})
              </button>
            </div>

            {alerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                No active anomaly alerts. All apiaries operating within standard environmental screening thresholds.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderLeft: `4px solid ${alert.status === 'CRITICAL' ? '#f43f5e' : alert.status === 'WARNING' ? '#f59e0b' : '#10b981'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ShieldAlert size={18} style={{ color: alert.status === 'CRITICAL' ? '#f43f5e' : '#f59e0b' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          Hive: {alert.hiveId} &mdash; <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{alert.message}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Risk: {alert.riskScore}% | Recorded: {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <StatusBadge status={alert.status} />
                      {alert.isAcknowledged ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={13} /> Acknowledged
                        </span>
                      ) : (
                        <button
                          className="btn-secondary"
                          onClick={(e) => handleAcknowledge(alert.id, e)}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Hives Table Overview */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Active Hives Status
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest registered hives telemetry status</span>
              </div>
              <button className="btn-secondary" onClick={() => navigate('/hives')} style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                View All ({hives.length})
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Hive ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Farm Location</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hives.slice(0, 5).map((hive) => (
                    <tr
                      key={hive.id}
                      onClick={() => navigate(`/hives/${hive.hiveId}`)}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--honey-gold)' }}>{hive.hiveId}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{hive.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {hive.farm ? hive.farm.name : hive.location || 'Section A'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <StatusBadge status={hive.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
