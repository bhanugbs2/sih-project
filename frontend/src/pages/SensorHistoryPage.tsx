import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, LoadingState, ErrorState, MetricCard } from '../components/common/UIComponents';
import { getAllHives, getHiveSensorHistory } from '../services/api';
import { Hive, SensorReading } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Thermometer,
  Droplets,
  Scale,
  Activity,
  Wind,
  Vibrate,
  RefreshCw,
  Download,
  Filter,
  Layers,
  Clock,
} from 'lucide-react';
import { parseTimestampMs } from '../utils/timeUtils';

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit: string;
  color?: string;
}

const CustomChartTooltip: React.FC<CustomChartTooltipProps> = ({ active, payload, label, unit, color }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const value = payload[0].value;
    if (value === null || value === undefined) return null;
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-primary)',
        fontSize: '0.8rem',
        boxShadow: 'var(--shadow-panel)'
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem', marginBottom: '0.2rem', fontWeight: 600 }}>
          {dataPoint?.fullTimestamp || label}
        </div>
        <div style={{ color: color || 'var(--honey-amber)', fontWeight: 700, fontSize: '0.9rem' }}>
          {value} {unit}
        </div>
      </div>
    );
  }
  return null;
};

interface SensorChartCardProps {
  title: string;
  icon: React.ComponentType<any>;
  dataKey: string;
  unit: string;
  color: string;
  latestValueDisplay: string;
  badgeText?: string;
  chartData: any[];
}

const SensorChartCard: React.FC<SensorChartCardProps> = ({
  title,
  icon: Icon,
  dataKey,
  unit,
  color,
  latestValueDisplay,
  badgeText,
  chartData
}) => {
  const validPoints = useMemo(() => {
    return chartData.filter(d => typeof d[dataKey] === 'number' && !isNaN(d[dataKey]));
  }, [chartData, dataKey]);

  const yDomain = useMemo(() => {
    if (validPoints.length === 0) return ['auto', 'auto'];
    const values = validPoints.map(d => Number(d[dataKey]));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const delta = maxVal - minVal;
    if (delta === 0) {
      const pad = Math.abs(minVal * 0.1) || 1;
      return [Number((minVal - pad).toFixed(2)), Number((maxVal + pad).toFixed(2))];
    }
    const pad = delta * 0.15;
    return [Number((minVal - pad).toFixed(2)), Number((maxVal + pad).toFixed(2))];
  }, [validPoints, dataKey]);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon size={18} style={{ color }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
        </div>
        <span className="badge badge-info" style={{ fontSize: '0.725rem' }}>
          Latest: {latestValueDisplay} {badgeText ? `(${badgeText})` : ''}
        </span>
      </div>

      {validPoints.length === 0 ? (
        <div style={{
          padding: '2rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          Not available (Optional / Hardware uninstalled)
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis domain={yDomain} stroke="var(--text-secondary)" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(val) => `${val} ${unit}`} />
                <Tooltip content={<CustomChartTooltip unit={unit} color={color} />} />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  name={title}
                  stroke={color}
                  strokeWidth={2}
                  connectNulls={true}
                  dot={{ r: 4, strokeWidth: 1.5, stroke: 'var(--bg-secondary)', fill: color }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {validPoints.length === 1 && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.45rem 0.75rem',
              background: 'var(--status-warning-bg)',
              border: '1px solid var(--status-warning-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--status-warning)',
              fontSize: '0.8rem'
            }}>
              ℹ️ Only one reading is available. A trend requires additional readings.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const SensorHistoryPage: React.FC = () => {
  const { hiveId: routeHiveId } = useParams<{ hiveId?: string }>();
  const navigate = useNavigate();

  const [hives, setHives] = useState<Hive[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState<string>(routeHiveId || 'HIVE-HIM-001');
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const [visibleCharts, setVisibleCharts] = useState<{ [key: string]: boolean }>({
    temp: true,
    humidity: true,
    weight: true,
    co2: false,
    acoustic: false,
    vibrationMag: false
  });

  useEffect(() => {
    const fetchHives = async () => {
      try {
        const list = await getAllHives();
        setHives(list);
        if (list.length > 0 && !routeHiveId) {
          setSelectedHiveId(list[0].hiveId);
        }
      } catch (err) {
        console.error('Failed to load hives list:', err);
      }
    };
    fetchHives();
  }, [routeHiveId]);

  const loadSensorData = async (isSilent: boolean = false) => {
    if (!selectedHiveId) return;
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      let limitCount = 50;
      if (timeRange === '1h') limitCount = 20;
      else if (timeRange === '6h') limitCount = 50;
      else if (timeRange === '24h') limitCount = 100;
      else if (timeRange === '7d') limitCount = 200;
      else if (timeRange === '30d') limitCount = 500;

      const data = await getHiveSensorHistory(selectedHiveId, limitCount);
      const sorted = [...data].sort((a, b) => {
        const tA = parseTimestampMs(a.timestamp) ?? 0;
        const tB = parseTimestampMs(b.timestamp) ?? 0;
        return tA - tB;
      });
      setHistory(sorted);
    } catch (err: any) {
      if (!isSilent) setError(err.message || 'Failed to fetch sensor telemetry history.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadSensorData(false);
  }, [selectedHiveId, timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadSensorData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedHiveId, timeRange]);

  const chartData = useMemo(() => {
    return history.map((item) => {
      const tsMs = parseTimestampMs(item.timestamp);
      const d = tsMs ? new Date(tsMs) : null;
      const timeStr = d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const fullTimeStr = d ? `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : '';

      const temp = item.internalTemperatureC ?? item.temperature ?? null;
      const hum = item.internalHumidityRh ?? item.humidity ?? null;
      const weight = item.weightKg ?? item.weight ?? null;
      const co2 = item.co2Ppm ?? null;
      const acoustic = item.acousticLevel ?? item.soundLevel ?? null;
      const vibMag = item.vibrationMagnitude ?? null;

      return {
        time: timeStr,
        fullTimestamp: fullTimeStr,
        timestamp: item.timestamp,
        temperature: temp !== null && temp !== undefined && !isNaN(Number(temp)) ? Number(Number(temp).toFixed(2)) : null,
        humidity: hum !== null && hum !== undefined && !isNaN(Number(hum)) ? Number(Number(hum).toFixed(2)) : null,
        weight: weight !== null && weight !== undefined && !isNaN(Number(weight)) ? Number(Number(weight).toFixed(2)) : null,
        co2Ppm: co2 !== null && co2 !== undefined && !isNaN(Number(co2)) ? Number(Number(co2).toFixed(1)) : null,
        acousticLevel: acoustic !== null && acoustic !== undefined && !isNaN(Number(acoustic)) ? Number(Number(acoustic).toFixed(1)) : null,
        vibrationMagnitude: vibMag !== null && vibMag !== undefined && !isNaN(Number(vibMag)) ? Number(Number(vibMag).toFixed(4)) : null,
        qualityFlags: item.qualityFlags || 'QUAL_OK'
      };
    });
  }, [history]);

  const latest = history.length > 0 ? history[history.length - 1] : null;

  const formatLatestVal = (val: number | null | undefined, decimals: number, unitStr: string) => {
    if (val === null || val === undefined || isNaN(Number(val))) return 'Not available';
    return `${Number(val).toFixed(decimals)} ${unitStr}`.trim();
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Hive ID', 'Temp (C)', 'Humidity (%)', 'Weight (kg)', 'CO2 (ppm)', 'Acoustic (dB)', 'Vibration Mag (g)'];
    const rows = history.map(item => [
      item.timestamp,
      item.hiveId,
      item.internalTemperatureC ?? item.temperature ?? '',
      item.internalHumidityRh ?? item.humidity ?? '',
      item.weightKg ?? item.weight ?? '',
      item.co2Ppm ?? '',
      item.acousticLevel ?? item.soundLevel ?? '',
      item.vibrationMagnitude ?? ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `HoneyChain_Sensors_${selectedHiveId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleChart = (chartKey: string) => {
    setVisibleCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }));
  };

  return (
    <div>
      <PageHeader
        title="Sensor Telemetry History"
        subtitle="Historical environmental and hive condition data analytics"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={selectedHiveId}
              onChange={(e) => {
                setSelectedHiveId(e.target.value);
                navigate(`/sensor-history/${e.target.value}`);
              }}
              className="form-control"
              style={{ fontWeight: 600 }}
            >
              {hives.map(h => (
                <option key={h.hiveId} value={h.hiveId}>
                  {h.hiveId} — {h.name}
                </option>
              ))}
            </select>

            <button className="btn-secondary" onClick={exportCSV} style={{ gap: '0.35rem' }}>
              <Download size={15} /> Export CSV
            </button>

            <button className="btn-secondary" onClick={() => loadSensorData(false)}>
              <RefreshCw size={15} />
            </button>
          </div>
        }
      />

      {/* Control Bar: Time Range, Auto-Refresh & Sensor Toggles */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: 'var(--honey-amber)' }} />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Time Window:</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {(['1h', '6h', '24h', '7d', '30d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    background: timeRange === range ? 'var(--honey-amber)' : 'var(--bg-secondary)',
                    color: timeRange === range ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (10s)
          </label>
        </div>

        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={14} /> Visible Charts:
          </div>
          {[
            { key: 'temp', label: 'Temperature', color: 'var(--honey-amber)' },
            { key: 'humidity', label: 'Humidity', color: 'var(--status-info)' },
            { key: 'weight', label: 'Weight', color: 'var(--status-success)' },
            { key: 'co2', label: 'CO2 (Optional)', color: 'var(--blockchain-purple)' },
            { key: 'acoustic', label: 'Acoustics (Optional)', color: '#EC4899' },
            { key: 'vibrationMag', label: 'Vibration (Optional)', color: 'var(--status-danger)' }
          ].map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={visibleCharts[item.key]}
                onChange={() => toggleChart(item.key)}
              />
              <span style={{ color: visibleCharts[item.key] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sensor Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <MetricCard
          title="Temperature"
          value={latest ? formatLatestVal(latest.internalTemperatureC ?? latest.temperature, 1, '°C') : 'Not available'}
          subtext="DHT22 / SHT4x"
          icon={Thermometer}
          color="var(--honey-amber)"
        />
        <MetricCard
          title="Humidity"
          value={latest ? formatLatestVal(latest.internalHumidityRh ?? latest.humidity, 1, '%') : 'Not available'}
          subtext="DHT22 / SHT4x"
          icon={Droplets}
          color="var(--status-info)"
        />
        <MetricCard
          title="Hive Weight"
          value={latest ? formatLatestVal(latest.weightKg ?? latest.weight, 2, 'kg') : 'Not available'}
          subtext="HX711 Load Cell"
          icon={Scale}
          color="var(--status-success)"
        />
        <MetricCard
          title="CO2 Concentration"
          value={latest ? formatLatestVal(latest.co2Ppm, 0, 'ppm') : 'Not available'}
          subtext="Optional Sensor"
          icon={Wind}
          color="var(--blockchain-purple)"
        />
      </div>

      {loading ? (
        <LoadingState message={`Loading telemetry data for ${selectedHiveId}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadSensorData(false)} />
      ) : chartData.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No telemetry readings available for {selectedHiveId} in the selected time window.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {visibleCharts.temp && (
            <SensorChartCard
              title="Internal Temperature (°C)"
              icon={Thermometer}
              dataKey="temperature"
              unit="°C"
              color="var(--honey-amber)"
              latestValueDisplay={latest ? formatLatestVal(latest.internalTemperatureC ?? latest.temperature, 1, '°C') : 'Not available'}
              badgeText="Target Range: 34-36°C"
              chartData={chartData}
            />
          )}

          {visibleCharts.humidity && (
            <SensorChartCard
              title="Internal Relative Humidity (%)"
              icon={Droplets}
              dataKey="humidity"
              unit="%"
              color="var(--status-info)"
              latestValueDisplay={latest ? formatLatestVal(latest.internalHumidityRh ?? latest.humidity, 1, '%') : 'Not available'}
              badgeText="Optimal: 50-65%"
              chartData={chartData}
            />
          )}

          {visibleCharts.weight && (
            <SensorChartCard
              title="Hive Weight (kg)"
              icon={Scale}
              dataKey="weight"
              unit="kg"
              color="var(--status-success)"
              latestValueDisplay={latest ? formatLatestVal(latest.weightKg ?? latest.weight, 2, 'kg') : 'Not available'}
              badgeText="Resolution: 0.01 kg"
              chartData={chartData}
            />
          )}

          {visibleCharts.co2 && (
            <SensorChartCard
              title="CO2 Concentration (ppm)"
              icon={Wind}
              dataKey="co2Ppm"
              unit="ppm"
              color="var(--blockchain-purple)"
              latestValueDisplay={latest ? formatLatestVal(latest.co2Ppm, 0, 'ppm') : 'Not available'}
              chartData={chartData}
            />
          )}

          {visibleCharts.acoustic && (
            <SensorChartCard
              title="Acoustic Activity (dB)"
              icon={Activity}
              dataKey="acousticLevel"
              unit="dB"
              color="#EC4899"
              latestValueDisplay={latest ? formatLatestVal(latest.acousticLevel ?? latest.soundLevel, 1, 'dB') : 'Not available'}
              chartData={chartData}
            />
          )}

          {visibleCharts.vibrationMag && (
            <SensorChartCard
              title="3-Axis Vibration Magnitude (g)"
              icon={Vibrate}
              dataKey="vibrationMagnitude"
              unit="g"
              color="var(--status-danger)"
              latestValueDisplay={latest ? formatLatestVal(latest.vibrationMagnitude, 4, 'g') : 'Not available'}
              chartData={chartData}
            />
          )}

          {/* Raw Telemetry Data Table */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={16} style={{ color: 'var(--honey-amber)' }} />
                Telemetry Stream Log ({chartData.length} readings)
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Temp (°C)</th>
                    <th>Humidity (%)</th>
                    <th>Weight (kg)</th>
                    <th>Quality Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.time}</td>
                      <td style={{ color: 'var(--honey-amber)', fontWeight: 600 }}>{row.temperature !== null ? `${row.temperature}°C` : 'Not available'}</td>
                      <td style={{ color: 'var(--status-info)', fontWeight: 600 }}>{row.humidity !== null ? `${row.humidity}%` : 'Not available'}</td>
                      <td style={{ color: 'var(--status-success)', fontWeight: 600 }}>{row.weight !== null ? `${row.weight} kg` : 'Not available'}</td>
                      <td>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          {row.qualityFlags}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
