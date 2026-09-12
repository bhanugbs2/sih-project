import React from 'react';
import { LucideIcon, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { UserRole } from '../../types';

// Page Header
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        {title}
      </h1>
      {subtitle && <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.9rem' }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>{actions}</div>}
  </div>
);

// Metric Card
interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, color = 'var(--honey-amber)' }) => (
  <div className="glass-panel" style={{ flex: '1 1 200px', minWidth: '200px', padding: '1.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 500 }}>{title}</span>
      <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: `${color}15`, color }}>
        <Icon size={18} />
      </div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{value}</div>
    {subtext && <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{subtext}</div>}
  </div>
);

// Status Badge
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let badgeClass = 'badge-info';
  const s = status.toUpperCase();

  if (['ACTIVE', 'OPTIMAL', 'NORMAL', 'PASS', 'VERIFIED', 'COMPLETED', 'QUALITY_VERIFIED', 'PACKAGED'].includes(s)) {
    badgeClass = 'badge-success';
  } else if (['WARNING', 'WATCH', 'HARVESTED', 'QUALITY_TESTING', 'PROCESSING', 'REQUIRES_REVIEW'].includes(s)) {
    badgeClass = 'badge-warning';
  } else if (['CRITICAL', 'ALERT', 'FAIL', 'RECALLED', 'OFFLINE', 'SUSPECTED', 'ADULTERATED'].includes(s)) {
    badgeClass = 'badge-danger';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

// Role Badge
export const RoleBadge: React.FC<{ role: UserRole | string }> = ({ role }) => {
  let bg = 'rgba(217, 144, 0, 0.12)';
  let color = 'var(--honey-amber)';
  let border = 'rgba(217, 144, 0, 0.3)';

  if (role === 'ADMIN') {
    bg = 'var(--blockchain-purple-bg)';
    color = 'var(--blockchain-purple)';
    border = 'rgba(107, 70, 193, 0.3)';
  } else if (role === 'BEEKEEPER') {
    bg = 'var(--status-success-bg)';
    color = 'var(--status-success)';
    border = 'var(--status-success-border)';
  } else if (role === 'QUALITY_INSPECTOR') {
    bg = 'var(--status-info-bg)';
    color = 'var(--status-info)';
    border = 'var(--status-info-border)';
  }

  return (
    <span style={{
      padding: '0.15rem 0.5rem',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: bg,
      color: color,
      border: `1px solid ${border}`,
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }}>
      {role}
    </span>
  );
};

// Loading State
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading system data...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 2rem', gap: '0.85rem' }}>
    <RefreshCw className="animate-spin" size={28} style={{ color: 'var(--honey-amber)', animation: 'spin 1.2s linear infinite' }} />
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Empty State
export const EmptyState: React.FC<{ icon?: LucideIcon; title: string; description?: string; action?: React.ReactNode }> = ({
  icon: Icon = AlertTriangle,
  title,
  description,
  action
}) => (
  <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
    <div style={{ padding: '0.85rem', borderRadius: '50%', background: 'var(--honey-amber-light)', color: 'var(--honey-amber)' }}>
      <Icon size={32} />
    </div>
    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
    {description && <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: 0, fontSize: '0.875rem' }}>{description}</p>}
    {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
  </div>
);

// Error State
export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--status-danger-border)', background: 'var(--status-danger-bg)', borderRadius: 'var(--radius-lg)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--status-danger)', marginBottom: '0.4rem' }}>
      <AlertTriangle size={20} />
      <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>Unable to load data</h4>
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.85rem 0' }}>{message}</p>
    {onRetry && (
      <button className="btn-secondary" onClick={onRetry} style={{ fontSize: '0.825rem', padding: '0.35rem 0.85rem' }}>
        <RefreshCw size={14} /> Retry Request
      </button>
    )}
  </div>
);

// Modal Dialog
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
