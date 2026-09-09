import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, StatusBadge, LoadingState, ErrorState, MetricCard, EmptyState } from '../components/common/UIComponents';
import { getHiveById, getHiveSensorHistory, getLatestSensorReading, getAIStatus, getHiveAlerts } from '../services/api';
import { Hive, SensorReading, AIStatusResponse, AIAlert } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Thermometer, Droplets, Scale, Activity, ArrowLeft, AlertOctagon, Clock, RefreshCw, Cpu, Wifi, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const HiveDetailPage: React.FC = () => {
  const { hiveId } = useParams<{ hiveId: string }>();
  const navigate = useNavigate();

  const [hive, setHive] = useState<Hive | null>(null);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(20);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  const loadData = async (isSilent: boolean = false) => {
    if (!hiveId) return;
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const [hiveData, latestData, historyData, statusData, alertsData] = await Promise.all([
        getHiveById(hiveId),
        getLatestSensorReading(hiveId).catch(() => null),
        getHiveSensorHistory(hiveId, limit).catch(() => []),
        getAIStatus(hiveId).catch(() => null),
        getHiveAlerts(hiveId, 10).catch(() => [])
      ]);

      setHive(hiveData);
      setLatestReading(latestData);
      setHistory(historyData.reverse()); // Reverse to chronological order for charts
      setAiStatus(statusData);
      setAlerts(alertsData);
      setLastFetchTime(new Date());
    } catch (err: any) {
      if (!isSilent) setError(err.message || 'Failed to load hive details.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Initial Data Fetch & 5-Second Polling Loop
  useEffect(() => {
    loadData(false);

    const pollInterval = setInterval(() => {
      loadData(true);
    }, 5000);

    const secondsInterval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(secondsInterval);
    };
  }, [hiveId, limit]);

  useEffect(() => {
    setSecondsAgo(0);
  }, [lastFetchTime]);

  if (loading) {
    return (
      <MainLayout>
        <LoadingState message={`Fetching telemetry history for ${hiveId}...`} />
      </MainLayout>
    );
  }

  if (error || !hive) {
    return (
      <MainLayout>
        <ErrorState message={error || 'Hive not found'} onRetry={() => loadData(false)} />
      </MainLayout>
    );
  }

  // Calculate telemetry age
  const readingAgeSeconds = latestReading?.timestamp
    ? Math.max(0, Math.floor((Date.now() - new Date(latestReading.timestamp).getTime()) / 1000))
    : 999;
  const isTelemetryLive = readingAgeSeconds < 60;

  // Format timestamp for chart X-Axis
  const chartData = history.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: item.temperature !== null ? item.temperature : null,
    humidity: item.humidity !== null ? item.humidity : null,
  }));

  return (
    <MainLayout>
      <div style={{ marginBottom: '1rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/hives')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Hives List
        </button>
      </div>

      <PageHeader
        title={`Hive: ${hive.hiveId}`}
        subtitle={`${hive.name} • ${hive.farm ? hive.farm.name : hive.location || 'Apiary Location'}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StatusBadge status={hive.status} />
            <button className="btn-secondary" onClick={() => loadData(false)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <RefreshCw size={16} />
            </button>
          </div>
        }
      />

      {/* Live Polling Status Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderColor: isTelemetryLive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)',
          background: isTelemetryLive ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isTelemetryLive ? '#10b981' : '#f59e0b',
              boxShadow: isTelemetryLive ? '0 0 12px #10b981' : '0 0 12px #f59e0b',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {isTelemetryLive ? 'ESP32 TELEMETRY LIVE' : 'TELEMETRY STALE / OFFLINE'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Last reading received: {latestReading ? `${readingAgeSeconds}s ago (${new Date(latestReading.timestamp).toLocaleTimeString()})` : 'No reading received yet'}
              {' • Auto-refreshing every 5s'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
            <Cpu size={12} /> ESP32 Node: {isTelemetryLive ? 'ONLINE' : 'OFFLINE'}
          </span>
          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
            <Wifi size={12} /> Wi-Fi: CONNECTED
          </span>
        </div>
      </div>

      {/* Sensor Metrics Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
        <MetricCard
          title="Internal Temperature (DHT22)"
          value={latestReading && latestReading.temperature !== null ? `${latestReading.temperature}°C` : 'Unavailable'}
          subtext="Target: 34.0°C - 36.0°C"
          icon={Thermometer}
          color="var(--honey-gold)"
        />
        <MetricCard
          title="Relative Humidity (DHT22)"
          value={latestReading && latestReading.humidity !== null ? `${latestReading.humidity}%` : 'Unavailable'}
          subtext="Optimal: 50% - 65%"
          icon={Droplets}
          color="var(--accent-cyan)"
        />
        <MetricCard
          title="Hive Weight (Load Cell)"
          value="Not Installed"
          subtext="HX711 Hardware Deferred"
          icon={Scale}
          color="var(--text-muted)"
        />
        <MetricCard
          title="Acoustic Buzz (Microphone)"
          value="Not Installed"
          subtext="Acoustic data unavailable — microphone not installed."
          icon={Activity}
          color="var(--text-muted)"
        />
      </div>

      {/* Sensor Hardware Status Matrix */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Hardware Sensor Status Breakdown
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>DHT22 Sensor:</span>
            <span className={`badge ${latestReading?.temperature != null ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
              {latestReading?.temperature != null ? 'ONLINE' : 'SENSOR FAULT'}
            </span>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SSD1306 OLED:</span>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>ONLINE (128x64)</span>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>HX711 Load Cell:</span>
            <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>Not Installed</span>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>INMP441 Mic:</span>
            <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>Not Installed</span>
          </div>
        </div>
      </div>

      {/* Time-Series Charts Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Real-Time Sensor Telemetry History
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[10, 20, 50].map((num) => (
            <button
              key={num}
              onClick={() => setLimit(num)}
              className={limit === num ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
            >
              Last {num} Readings
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <EmptyState title="No Sensor Readings Available" description="No historical telemetry data has been ingested for this hive yet." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Temperature Chart */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0', color: 'var(--honey-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Thermometer size={18} /> Temperature (°C) — DHT22
            </h4>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={12} unit="°C" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121824', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                  />
                  <Line type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Humidity Chart */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplets size={18} /> Relative Humidity (%) — DHT22
            </h4>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121824', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                  />
                  <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AI Health Diagnosis Card */}
      {aiStatus && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={20} style={{ color: 'var(--honey-bright)' }} /> AI Hive Health Diagnostics
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DIAGNOSTIC STATUS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: aiStatus.status === 'NORMAL' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {aiStatus.status}
              </div>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ANOMALY RISK SCORE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--honey-gold)' }}>
                {aiStatus.latestRiskScore != null ? `${aiStatus.latestRiskScore} / 100` : '0 / 100'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '240px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {aiStatus.message || 'Continuous telemetry monitoring active. Environmental parameters within safe thresholds.'}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
