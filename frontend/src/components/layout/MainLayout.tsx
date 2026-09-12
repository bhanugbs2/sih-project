import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      
      <div
        className="main-content-area"
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0
        }}
      >
        <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
