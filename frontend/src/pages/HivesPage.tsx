import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllHives, getAllFarms, createHive } from '../services/api';
import { Hive, Farm } from '../types';
import { useAuth } from '../context/AuthContext';
import { Boxes, Plus, Search, Filter, ArrowRight } from 'lucide-react';

export const HivesPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [hives, setHives] = useState<Hive[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHiveId, setNewHiveId] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [newHiveName, setNewHiveName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadHivesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hivesData, farmsData] = await Promise.all([
        getAllHives(),
        getAllFarms().catch(() => [])
      ]);
      setHives(hivesData);
      setFarms(farmsData);
      if (farmsData.length > 0) setSelectedFarmId(farmsData[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load hives list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHivesData();
  }, []);

  const handleCreateHive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHiveId.trim() || !selectedFarmId || !newHiveName.trim()) {
      setFormError('Hive ID, Farm selection, and Hive Name are required.');
      return;
    }

    setCreating(true);
    setFormError(null);

    try {
      await createHive({
        hiveId: newHiveId.trim(),
        farmId: selectedFarmId,
        name: newHiveName.trim(),
        location: newLocation.trim() || 'Section A',
        status: 'ACTIVE'
      });
      setIsModalOpen(false);
      setNewHiveId('');
      setNewHiveName('');
      setNewLocation('');
      loadHivesData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create new hive.');
    } finally {
      setCreating(false);
    }
  };

  const filteredHives = hives.filter((h) => {
    const matchesSearch =
      h.hiveId.toLowerCase().includes(search.toLowerCase()) ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.location && h.location.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Hives Management"
        subtitle="Operational monitoring and telemetry status across all registered apiary hives"
        actions={
          (role === 'ADMIN' || role === 'BEEKEEPER') ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> + Register New Hive
            </button>
          ) : undefined
        }
      />

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Hive ID, Name, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ cursor: 'pointer' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading hives inventory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadHivesData} />
      ) : filteredHives.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No Hives Found"
          description={search ? 'No hives match your search criteria.' : 'No hives are currently registered in the system.'}
        />
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hive ID</th>
                  <th>Hive Name</th>
                  <th>Apiary Farm</th>
                  <th>Section Location</th>
                  <th>AI Screening</th>
                  <th>Operational Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHives.map((hive) => (
                  <tr key={hive.id} onClick={() => navigate(`/hives/${hive.hiveId}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: 'var(--honey-brown)' }}>{hive.hiveId}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hive.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{hive.farm ? hive.farm.name : 'Himalayan Organic Apiary'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{hive.location || 'Section A'}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: hive.status === 'ACTIVE' ? 'var(--status-success)' : 'var(--status-warning)', fontWeight: 500 }}>
                        {hive.status === 'ACTIVE' ? 'AI Screening: Normal Pattern' : 'AI Screening: Needs Inspection'}
                      </span>
                    </td>
                    <td><StatusBadge status={hive.status} /></td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hives/${hive.hiveId}`);
                        }}
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                      >
                        View Telemetry <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register New Hive Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Hive">
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-danger)', fontSize: '0.825rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateHive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Hive Serial ID</label>
            <input
              type="text"
              placeholder="e.g. HIVE-HIM-004"
              value={newHiveId}
              onChange={(e) => setNewHiveId(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Apiary Farm</label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.farmId})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Hive Designation Name</label>
            <input
              type="text"
              placeholder="e.g. South Ridge Hive #4"
              value={newHiveName}
              onChange={(e) => setNewHiveName(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Section / Location</label>
            <input
              type="text"
              placeholder="e.g. Section C, Row 2"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Saving...' : 'Register Hive'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
