import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, RoleBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllUsers, createUser, toggleUserEnabled } from '../services/api';
import { User, UserRole } from '../types';
import { Users, Plus, ShieldCheck, ToggleLeft, ToggleRight, UserCheck } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('BEEKEEPER');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setFormError('Username, Email, and Password are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await createUser({
        username: username.trim(),
        email: email.trim(),
        password,
        role
      });
      setIsModalOpen(false);
      setUsername('');
      setEmail('');
      setPassword('');
      loadUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEnabled = async (userObj: User) => {
    try {
      const updated = await toggleUserEnabled(userObj.id, !userObj.enabled);
      setUsers((prev) => prev.map((u) => (u.id === userObj.id ? updated : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="User Account Management"
        subtitle="System user accounts, role definitions, and access activation status"
        actions={
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Create User Account
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Loading user directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description="No user accounts registered in the database."
        />
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Username</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Account Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{u.username}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <RoleBadge role={u.role} />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={u.enabled ? 'badge badge-success' : 'badge badge-warning'}>
                      {u.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleToggleEnabled(u)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      {u.enabled ? <ToggleRight size={18} style={{ color: '#10b981' }} /> : <ToggleLeft size={18} style={{ color: '#f43f5e' }} />}
                      <span>{u.enabled ? 'Disable' : 'Enable'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create System User Account">
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Username</label>
            <input
              type="text"
              placeholder="e.g. beekeeper_sharma"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. sharma@honeychain.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Initial Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Assigned System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#121824', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
            >
              <option value="BEEKEEPER">BEEKEEPER (Apiary Operations)</option>
              <option value="QUALITY_INSPECTOR">QUALITY_INSPECTOR (Lab Testing)</option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
