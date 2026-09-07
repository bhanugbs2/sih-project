import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Boxes,
  FlaskConical,
  Filter,
  PackageCheck,
  Link2,
  ShieldCheck,
  LogIn,
  Hexagon,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/hives', label: 'Smart Hives (IoT)', icon: Cpu },
    { path: '/batches', label: 'Honey Batches', icon: Boxes },
    { path: '/quality', label: 'Quality & Testing', icon: FlaskConical },
    { path: '/processing', label: 'Processing Logs', icon: Filter },
    { path: '/packages', label: 'Packages & QR', icon: PackageCheck },
    { path: '/blockchain', label: 'Blockchain Ledger', icon: Link2 },
    { path: '/verify', label: 'Public Verification', icon: ShieldCheck },
    { path: '/login', label: 'Account / Login', icon: LogIn },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            boxShadow: '0 0 16px var(--honey-glow)',
          }}
        >
          <Hexagon size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1 }}>
            Honey<span className="gradient-text">Chain</span>
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            SIH26021 • NEXORA
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          Navigation Routes
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'active-nav' : '')}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#000' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                  : 'transparent',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                marginBottom: '0.35rem',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 14px var(--honey-glow)' : 'none',
              })}
            >
              <Icon size={19} />
              <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info Badge */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div className="pulsing-dot" />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>System Active</span>
        </div>
        <div>Phase 0 Monorepo Setup</div>
      </div>
    </aside>
  );
};
