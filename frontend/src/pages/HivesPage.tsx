import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllHives, getAllFarms, createHive } from '../services/api';
import { Hive, Farm, HiveStatus } from '../types';
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
    <MainLayout>
      <PageHeader
        title="Smart Hive Management"
        subtitle="Real-time IoT hive telemetry monitoring & operational status"
        actions={
          (role === 'ADMIN' || role === 'BEEKEEPER') ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Register New Hive
            </button>
          ) : undefined
        }
      />

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search hive ID, name, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.75rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL" style={{ background: '#121824' }}>All Statuses</option>
            <option value="ACTIVE" style={{ background: '#121824' }}>ACTIVE</option>
            <option value="MAINTENANCE" style={{ background: '#121824' }}>MAINTENANCE</option>
            <option value="INACTIVE" style={{ background: '#121824' }}>INACTIVE</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading hives telemetry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadHivesData} />
      ) : filteredHives.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No Hives Found"
          description={search ? 'No hives match your search criteria.' : 'No hives are currently registered in the system.'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredHives.map((hive) => (
            <div
              key={hive.id}
              className="glass-panel"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => navigate(`/hives/${hive.hiveId}`)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--honey-gold)' }}>
                    {hive.hiveId}
                  </span>
                  <StatusBadge status={hive.status} />
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                  {hive.name}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  📍 {hive.farm ? hive.farm.name : hive.location || 'Location Not Specified'}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  View Live Telemetry Charts
                </span>
                <ArrowRight size={16} style={{ color: 'var(--honey-gold)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register New Hive Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Hive">
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateHive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Hive Code / ID</label>
            <input
              type="text"
              placeholder="e.g. HIVE-HIM-004"
              value={newHiveId}
              onChange={(e) => setNewHiveId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Select Apiary Farm</label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#121824', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.farmId})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Hive Name</label>
            <input
              type="text"
              placeholder="e.g. South Ridge Hive #4"
              value={newHiveName}
              onChange={(e) => setNewHiveName(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Location / Section</label>
            <input
              type="text"
              placeholder="e.g. Section C, Row 2"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Saving...' : 'Create Hive'}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
