import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/UIComponents';
import { User, LogOut, Menu, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { user, role, logout } = useAuth();

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'rgba(12, 16, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuToggle}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
          className="mobile-menu-btn"
        >
          <Menu size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="pulsing-dot" />
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600, letterSpacing: '0.04em' }}>
            SYSTEM ONLINE & OPERATIONAL
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.2)',
            color: 'var(--honey-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={16} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user || 'Authenticated User'}
            </span>
            <div style={{ marginTop: '0.15rem' }}>
              <RoleBadge role={role || 'BEEKEEPER'} />
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="btn-secondary"
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
        >
          <LogOut size={16} />
          <span className="hide-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
};
