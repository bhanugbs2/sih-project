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
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { role, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
    { label: 'Hives', path: '/hives', icon: Boxes, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
    { label: 'Sensor History', path: '/hives/HIVE-HIM-001', icon: Activity, roles: ['ADMIN', 'BEEKEEPER'] },
    { label: 'AI Alerts', path: '/alerts', icon: AlertOctagon, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
    { label: 'Honey Batches', path: '/batches', icon: PackageCheck, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
    { label: 'Quality Testing', path: '/quality', icon: FlaskConical, roles: ['ADMIN', 'QUALITY_INSPECTOR'] },
    { label: 'Processing Logs', path: '/processing', icon: Filter, roles: ['ADMIN', 'BEEKEEPER'] },
    { label: 'Consumer Packages', path: '/packages', icon: Package, roles: ['ADMIN', 'BEEKEEPER'] },
    { label: 'Supply Chain Audit', path: '/traceability', icon: FileCheck2, roles: ['ADMIN', 'BEEKEEPER', 'QUALITY_INSPECTOR'] },
  ];

  const adminItems = [
    { label: 'Apiary Farms', path: '/farms', icon: Building2, roles: ['ADMIN', 'BEEKEEPER'] },
    { label: 'User Accounts', path: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  const allowedNav = navigationItems.filter(item => !role || item.roles.includes(role));
  const allowedAdminNav = adminItems.filter(item => !role || item.roles.includes(role));

  const width = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <aside style={{
      width: width,
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      background: 'rgba(12, 16, 26, 0.95)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflowX: 'hidden'
    }}>
      {/* Sidebar Header */}
      <div style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 1.25rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
          }}>
            🍯
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Honey<span className="gradient-text">Chain</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--honey-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Smart Beekeeping
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem',
            cursor: 'pointer',
            display: collapsed ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', padding: collapsed ? '0 0 0.5rem 0' : '0.5rem 0.75rem', textAlign: collapsed ? 'center' : 'left' }}>
          {collapsed ? '•' : 'Main Menu'}
        </div>

        {allowedNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: collapsed ? '0.75rem 0' : '0.7rem 0.85rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#000' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'none'
            })}
          >
            <item.icon size={19} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {allowedAdminNav.length > 0 && (
          <>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', padding: collapsed ? '1rem 0 0.5rem 0' : '1.25rem 0.75rem 0.5rem 0.75rem', textAlign: collapsed ? 'center' : 'left' }}>
              {collapsed ? '•' : 'Administration'}
            </div>
            {allowedAdminNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: collapsed ? '0.75rem 0' : '0.7rem 0.85rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                })}
              >
                <item.icon size={19} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <NavLink
            to="/verify/HC-PKG-2026-001"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: collapsed ? '0.75rem 0' : '0.7rem 0.85rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-emerald)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none'
            }}
          >
            <ShieldCheck size={19} />
            {!collapsed && <span>Public Verify</span>}
          </NavLink>
        </div>
      </div>

      {/* Sidebar Footer Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.1)',
            color: 'var(--accent-rose)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
