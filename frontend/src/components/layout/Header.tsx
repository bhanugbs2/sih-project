import React from 'react';
import { Bell, ShieldCheck, Database, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'rgba(18, 24, 36, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Title / Breadcrumbs */}
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subtitle}</p>
        )}
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search Batch, Hive, or QR..."
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.85rem 0.45rem 2.2rem',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              width: '240px',
            }}
          />
        </div>

        {/* Status Badges */}
        <div className="badge badge-warning">
          <Database size={13} />
          PostgreSQL JPA
        </div>

        <div className="badge badge-purple">
          <ShieldCheck size={13} />
          Blockchain Ready
        </div>

        {/* Notifications Icon */}
        <button
          className="btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          title="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};
