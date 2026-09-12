import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, MetricCard, LoadingState, ErrorState, StatusBadge } from '../components/common/UIComponents';
import { getAllFarms, getAllHives, getAllBatches, getAllAIAlerts, getUnreadAlertCount, getAllPackages, acknowledgeAlert } from '../services/api';
import { Farm, Hive, HoneyBatch, AIAlert, Package as PackageType } from '../types';
import { Boxes, PackageCheck, AlertOctagon, Activity, ShieldCheck, RefreshCw, CheckCircle2, ShieldAlert, Package } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [hives, setHives] = useState<Hive[]>([]);
  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadDashboardData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const [farmsData, hivesData, batchesData, alertsData, countData, packagesData] = await Promise.all([
        getAllFarms().catch(() => []),
        getAllHives().catch(() => []),
        getAllBatches().catch(() => []),
        getAllAIAlerts().catch(() => []),
        getUnreadAlertCount().catch(() => 0),
        getAllPackages().catch(() => []),
      ]);

      setFarms(farmsData);
      setHives(hivesData);
      setBatches(batchesData);
      setAlerts(alertsData);
      setUnreadCount(countData);
      setPackages(packagesData);
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

    timerRef.current = setInterval(() => {
      loadDashboardData(true);
    }, 15000);

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

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your beekeeping telemetry and honey traceability operations"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={13} />
              <span>Updated {secondsAgo}s ago</span>
            </div>
            <button className="btn-primary" onClick={() => navigate('/hives')}>
              <Boxes size={16} /> Manage Hives
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Loading dashboard operational summary..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadDashboardData(false)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary Metric Blocks */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <MetricCard
              title="Active Hives"
              value={`${activeHivesCount} / ${hives.length}`}
              subtext="Monitored Smart Hives"
              icon={Boxes}
              color="var(--status-success)"
            />
            <MetricCard
              title="Honey Batches"
              value={batches.length}
              subtext="Total Batches Recorded"
              icon={PackageCheck}
              color="var(--honey-amber)"
            />
            <MetricCard
              title="Consumer Packages"
              value={packages.length}
              subtext="Serialized Retail Packages"
              icon={Package}
              color="var(--status-info)"
            />
            <MetricCard
              title="Open AI Alerts"
              value={unreadCount}
              subtext={unreadCount > 0 ? 'Requires Beekeeper Inspection' : 'All Alerts Handled'}
              icon={AlertOctagon}
              color={unreadCount > 0 ? 'var(--status-danger)' : 'var(--status-success)'}
            />
          </div>

          {/* Lifecycle Traceability Overview Timeline */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Honey Traceability Lifecycle Overview
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { stage: '1. Harvest', desc: 'Apiary Extraction', status: 'COMPLETED' },
                { stage: '2. Quality Test', desc: 'Laboratory Screening', status: 'COMPLETED' },
                { stage: '3. AI Screening', desc: 'Pattern Analysis', status: 'COMPLETED' },
                { stage: '4. Processing', desc: 'Filtration & Settling', status: 'COMPLETED' },
                { stage: '5. Packaging', desc: 'Serial QR Generation', status: 'COMPLETED' },
                { stage: '6. Blockchain', desc: 'On-Chain Ledger Anchor', status: 'VERIFIED' }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.stage}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '120px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--honey-brown)' }}>{step.stage}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                  </div>
                  {idx < arr.length - 1 && (
                    <div style={{ height: '1px', flex: 1, minWidth: '20px', background: 'var(--border-color)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Recent Alerts List */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Recent AI Pattern Screening Alerts ({unreadCount} Open)
                </h3>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Environmental anomaly detections & early warnings</span>
              </div>
              <button className="btn-secondary" onClick={() => navigate('/alerts')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                View All Alerts ({alerts.length})
              </button>
            </div>

            {alerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                No active anomaly alerts. All apiary hives operating within standard parameters.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <ShieldAlert size={16} style={{ color: alert.status === 'CRITICAL' ? 'var(--status-danger)' : 'var(--status-warning)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          Hive: {alert.hiveId} &mdash; <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{alert.message}</span>
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Recorded: {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge status={alert.status} />
                      {alert.isAcknowledged ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={12} /> Acknowledged
                        </span>
                      ) : (
                        <button
                          className="btn-secondary"
                          onClick={(e) => handleAcknowledge(alert.id, e)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
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

          {/* Recent Honey Batches Table */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Honey Batches Log
                </h3>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Latest harvest and production batches</span>
              </div>
              <button className="btn-secondary" onClick={() => navigate('/batches')} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                View All Batches ({batches.length})
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch Code</th>
                    <th>Hive Source</th>
                    <th>Harvest Date</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.slice(0, 5).map((batch) => (
                    <tr key={batch.id} onClick={() => navigate(`/batches/${batch.batchId}`)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 600, color: 'var(--honey-brown)' }}>{batch.batchId}</td>
                      <td>{batch.hiveName || batch.hiveId || 'Hive Source'}</td>
                      <td>{batch.harvestDate}</td>
                      <td>{batch.quantity} {batch.unit}</td>
                      <td><StatusBadge status={batch.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
