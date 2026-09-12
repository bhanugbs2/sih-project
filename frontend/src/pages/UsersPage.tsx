import React, { useEffect, useState } from 'react';
import { PageHeader, RoleBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllUsers, createUser, toggleUserEnabled } from '../services/api';
import { User, UserRole } from '../types';
import { Users, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

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
    <>
      <PageHeader
        title="User Account Management"
        subtitle="System user accounts, role definitions, and authorization control"
        actions={
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> + Create User Account
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Loading user accounts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description="No user accounts registered in the system."
        />
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email Address</th>
                  <th>System Role</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td>
                      <span className={u.enabled ? 'badge badge-success' : 'badge badge-warning'}>
                        {u.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => handleToggleEnabled(u)}
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem', gap: '0.3rem' }}
                      >
                        {u.enabled ? <ToggleRight size={16} style={{ color: 'var(--status-success)' }} /> : <ToggleLeft size={16} style={{ color: 'var(--status-danger)' }} />}
                        <span>{u.enabled ? 'Disable' : 'Enable'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create User Account">
        {formError && (
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--status-danger)', fontSize: '0.825rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Username</label>
            <input
              type="text"
              placeholder="e.g. beekeeper_sharma"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. sharma@honeychain.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Initial Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Assigned System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="form-control"
              style={{ width: '100%' }}
            >
              <option value="BEEKEEPER">BEEKEEPER (Apiary Operations)</option>
              <option value="QUALITY_INSPECTOR">QUALITY_INSPECTOR (Lab Testing)</option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
