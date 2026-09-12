import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RoleBadge } from '../common/UIComponents';
import { User, LogOut, Menu, Sun, Moon } from 'lucide-react';

interface TopBarProps {
  onMenuToggle?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Operations Overview',
  '/hives': 'Smart Hives Fleet',
  '/sensor-history': 'Sensor Analytics',
  '/alerts': 'AI Pattern Alerts',
  '/batches': 'Honey Batch Lineage',
  '/quality': 'Laboratory Testing',
  '/processing': 'Extraction & Filtration Logs',
  '/packages': 'Consumer Packages',
  '/traceability': 'Supply Chain Audit',
  '/gateways': 'IoT Fleet Management',
  '/farms': 'Apiary Farms',
  '/users': 'System User Accounts',
};

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Resolve current page title from path
  const currentTitle = PAGE_TITLES[location.pathname] || 'HoneyChain Platform';

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Left: Mobile Menu Toggle & Current Page Title */}
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
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Right: Operational Status, Theme Toggle, User Profile, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--status-success-bg)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--status-success-border)' }}>
          <span className="pulsing-dot" />
          <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', fontWeight: 600 }}>
            System Online
          </span>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span className="hide-mobile">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.3rem 0.65rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)'
        }}>
          <User size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user || 'beekeeper'}
          </span>
          <RoleBadge role={role || 'BEEKEEPER'} />
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
        >
          <LogOut size={14} />
          <span className="hide-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
};
