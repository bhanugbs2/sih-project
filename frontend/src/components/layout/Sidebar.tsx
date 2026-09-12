import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Activity,
  AlertOctagon,
  PackageCheck,
  FlaskConical,
  Filter,
  Package,
  FileCheck2,
  Users,
  Building2,
  Cpu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed: externalCollapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose
}) => {
  const { role } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const mainItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
    { label: 'Hives', path: '/hives', icon: Boxes, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
    { label: 'Sensor History', path: '/sensor-history', icon: Activity, roles: ['ADMIN', 'BEEKEEPER'] },
    { label: 'AI Alerts', path: '/alerts', icon: AlertOctagon, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
  ];

  const traceabilityItems = [
    { label: 'Honey Batches', path: '/batches', icon: PackageCheck, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
    { label: 'Quality Testing', path: '/quality', icon: FlaskConical, roles: ['ADMIN', 'QUALITY_INSPECTOR'] },
    { label: 'Processing Logs', path: '/processing', icon: Filter, roles: ['ADMIN', 'BEEKEEPER'] },
    { label: 'Consumer Packages', path: '/packages', icon: Package, roles: ['ADMIN', 'BEEKEEPER'] },
    { label: 'Supply Chain Audit', path: '/traceability', icon: FileCheck2, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
  ];

  const adminItems = [
    { label: 'IoT Gateway Fleet', path: '/gateways', icon: Cpu, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
    { label: 'Apiary Farms', path: '/farms', icon: Building2, roles: ['ADMIN', 'BEEKEEPER'] },
    { label: 'User Accounts', path: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  const allowedMain = mainItems.filter(item => !role || item.roles.includes(role));
  const allowedTraceability = traceabilityItems.filter(item => !role || item.roles.includes(role));
  const allowedAdmin = adminItems.filter(item => !role || item.roles.includes(role));

  const width = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  const renderNavGroup = (title: string, items: typeof mainItems) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: '1.25rem' }}>
        {!collapsed && (
          <div style={{
            fontSize: '0.675rem',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '0.35rem 0.75rem 0.4rem 0.75rem'
          }}>
            {title}
          </div>
        )}
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.65rem 0' : '0.55rem 0.75rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--honey-brown)' : 'var(--text-secondary)',
              background: isActive ? 'var(--honey-amber-light)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--honey-amber)' : '3px solid transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              marginBottom: '0.15rem'
            })}
          >
            <item.icon size={18} style={{ flexShrink: 0, color: 'inherit' }} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    );
  };

  return (
    <aside
      className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: width,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease',
        overflowX: 'hidden'
      }}
    >
      {/* Sidebar Header */}
      <div style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0 0.5rem' : '0 1rem',
        borderBottom: '1px solid var(--border-color)',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
          <div style={{
            width: '32px',
            height: '32px',
            minWidth: '32px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--honey-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1rem',
            flexShrink: 0
          }}>
            🍯
          </div>
          {!collapsed && (
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                HoneyChain
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Smart Beekeeping
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleCollapse}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.3rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div style={{ flex: 1, padding: '1rem 0.5rem', overflowY: 'auto' }}>
        {renderNavGroup('Main', allowedMain)}
        {renderNavGroup('Honey Traceability', allowedTraceability)}
        {renderNavGroup('Administration', allowedAdmin)}

        {/* Bottom Link: Public Verify */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <NavLink
            to="/verify/HC-PKG-2026-001"
            title={collapsed ? "Public Verify" : undefined}
            className="nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.65rem 0' : '0.55rem 0.75rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--status-success)',
              background: 'var(--status-success-bg)',
              border: '1px solid var(--status-success-border)',
              fontWeight: 600,
              fontSize: '0.825rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Public Verify</span>}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
