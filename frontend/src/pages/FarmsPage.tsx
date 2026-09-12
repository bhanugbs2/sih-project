import React, { useEffect, useState } from 'react';
import { PageHeader, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllFarms, createFarm } from '../services/api';
import { Farm } from '../types';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, MapPin, User } from 'lucide-react';

export const FarmsPage: React.FC = () => {
  const { role } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmId, setFarmId] = useState('');
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number>(31.1048);
  const [longitude, setLongitude] = useState<number>(77.1734);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadFarms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFarms();
      setFarms(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load apiary farms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId.trim() || !name.trim() || !ownerName.trim()) {
      setFormError('Farm ID, Name, and Owner Name are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await createFarm({
        farmId: farmId.trim(),
        name: name.trim(),
        ownerName: ownerName.trim(),
        location: location.trim() || 'Himachal Pradesh, India',
        latitude,
        longitude
      });
      setIsModalOpen(false);
      setFarmId('');
      setName('');
      setOwnerName('');
      loadFarms();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to register farm.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Apiary Farms Management"
        subtitle="Registered beekeeping apiary locations and manager assignments"
        actions={
          role === 'ADMIN' ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> + Register New Farm
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <LoadingState message="Loading apiary farms..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadFarms} />
      ) : farms.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Apiary Farms Found"
          description="No beekeeping farms have been registered yet."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {farms.map((farm) => (
            <div key={farm.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--honey-brown)' }}>
                  {farm.farmId}
                </span>
                <span className="badge badge-success">OPERATIONAL</span>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                  {farm.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <User size={14} /> Apiary Manager: <strong>{farm.ownerName}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
                  <MapPin size={14} /> {farm.location || 'Himachal Pradesh, India'}
                </div>
              </div>

              {farm.latitude !== undefined && farm.longitude !== undefined && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  Coordinates: {farm.latitude.toFixed(4)}° N, {farm.longitude.toFixed(4)}° E
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Register Farm Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Apiary Farm">
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-danger)', fontSize: '0.825rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateFarm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Farm Code / ID</label>
            <input
              type="text"
              placeholder="e.g. FARM-VAL-04"
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Farm Name</label>
            <input
              type="text"
              placeholder="e.g. Highland Wildflower Apiary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Manager Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Rajesh Sharma"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Location Description</label>
            <input
              type="text"
              placeholder="e.g. Himachal Pradesh, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Latitude</label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="form-control"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Longitude</label>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="form-control"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Register Farm'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
