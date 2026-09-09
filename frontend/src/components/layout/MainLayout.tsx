import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main style={{ flex: 1, padding: '2rem 2.25rem', overflowY: 'auto' }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

