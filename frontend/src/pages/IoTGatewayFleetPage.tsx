import React, { useState, useEffect } from 'react';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { Cpu, Radio, CheckCircle2, AlertTriangle, XCircle, Clock, Server, Layers, Thermometer, Droplets, Scale, Volume2, MapPin, Plus, RefreshCw } from 'lucide-react';
import { getAllGateways, getFleetSummary, registerGateway } from '../services/api';
import { IoTGatewayDevice, FleetSummaryResponse, CreateGatewayRequest } from '../types';

export const IoTGatewayFleetPage: React.FC = () => {
  const [gateways, setGateways] = useState<IoTGatewayDevice[]>([]);
  const [summary, setSummary] = useState<FleetSummaryResponse>({
    totalGateways: 0,
    onlineGateways: 0,
    offlineGateways: 0,
    degradedGateways: 0,
    maintenanceGateways: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [newGateway, setNewGateway] = useState<CreateGatewayRequest>({
    gatewayId: `GW-PI5-HIM-00${Math.floor(Math.random() * 900) + 100}`,
    name: 'Raspberry Pi 5 Edge IoT Gateway',
    farmId: 'FARM-HIM-001',
    apiaryId: 'APIARY-HIM-A',
    hiveId: 'HIVE-HIM-001',
    hardwareVersion: 'Raspberry Pi 5 Model B (8GB)',
    firmwareVersion: 'v2.4.0-industrial',
    status: 'ONLINE',
    powerStatus: 'MAINS_OPERATIONAL',
    ipAddress: '192.168.0.146'
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gatewaysData, summaryData] = await Promise.all([
        getAllGateways(),
        getFleetSummary()
      ]);
      setGateways(gatewaysData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch gateway fleet data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerGateway(newGateway);
      setIsRegisterOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to register gateway.');
    }
  };

  return (
    <>
      <PageHeader
        title="IoT Gateway Fleet Management"
        subtitle="Raspberry Pi 5 Edge IoT Gateways & ESP32 prototype hardware telemetry nodes"
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchData} className="btn-secondary" style={{ gap: '0.35rem' }}>
              <RefreshCw size={15} /> Refresh Fleet
            </button>
            <button onClick={() => setIsRegisterOpen(true)} className="btn-primary" style={{ gap: '0.35rem' }}>
              <Plus size={15} /> + Register Gateway
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Fetching IoT gateway fleet status..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary Metric Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Fleet Gateways</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {summary.totalGateways}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Online & Transmitting</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-success)', marginTop: '0.35rem' }}>
                {summary.onlineGateways}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Degraded / Warning</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-warning)', marginTop: '0.35rem' }}>
                {summary.degradedGateways}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Offline</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--status-danger)', marginTop: '0.35rem' }}>
                {summary.offlineGateways}
              </div>
            </div>
          </div>

          {/* Fleet Table */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gateway Identity</th>
                    <th>Hardware Category</th>
                    <th>Hardware / Firmware</th>
                    <th>Status</th>
                    <th>Power & Network</th>
                    <th>Last Heartbeat</th>
                  </tr>
                </thead>
                <tbody>
                  {gateways.map((gw) => {
                    const isPi5 = gw.hardwareVersion.includes('Raspberry Pi 5');
                    return (
                      <tr key={gw.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div>{gw.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--honey-brown)', fontFamily: 'monospace' }}>{gw.gatewayId}</div>
                        </td>
                        <td>
                          {isPi5 ? (
                            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Raspberry Pi 5 Edge</span>
                          ) : (
                            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>ESP32 Prototype</span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{gw.hardwareVersion}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FW: {gw.firmwareVersion}</div>
                        </td>
                        <td><StatusBadge status={gw.status} /></td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{gw.powerStatus || 'MAINS_OPERATIONAL'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>IP: {gw.ipAddress || '192.168.0.144'}</div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {gw.lastSeen ? new Date(gw.lastSeen).toLocaleTimeString() : 'Just now'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register Edge IoT Gateway">
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Gateway ID</label>
            <input
              type="text"
              value={newGateway.gatewayId}
              onChange={(e) => setNewGateway({ ...newGateway, gatewayId: e.target.value })}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Gateway Designation Name</label>
            <input
              type="text"
              value={newGateway.name}
              onChange={(e) => setNewGateway({ ...newGateway, name: e.target.value })}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Hardware Platform</label>
              <select
                value={newGateway.hardwareVersion}
                onChange={(e) => setNewGateway({ ...newGateway, hardwareVersion: e.target.value })}
                className="form-control"
                style={{ width: '100%' }}
              >
                <option value="Raspberry Pi 5 Model B (8GB)">Raspberry Pi 5 Edge Gateway</option>
                <option value="ESP32-WROOM-32 (Dual Core)">ESP32 Prototype Node</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Target Hive ID</label>
              <input
                type="text"
                value={newGateway.hiveId}
                onChange={(e) => setNewGateway({ ...newGateway, hiveId: e.target.value })}
                className="form-control"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsRegisterOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Register Gateway</button>
          </div>
        </form>
      </Modal>
    </>
  );
};
