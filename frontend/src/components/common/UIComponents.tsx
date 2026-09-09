import React from 'react';
import { LucideIcon, X, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { UserRole } from '../../types';

// Page Header
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
    <div>
      <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
        <span className="gradient-text">{title}</span>
      </h1>
      {subtitle && <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.95rem' }}>{subtitle}</p>}
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

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, color = 'var(--honey-gold)' }) => (
  <div className="glass-panel metric-card" style={{ flex: '1 1 220px', minWidth: '220px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
      <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: `${color}15`, color }}>
        <Icon size={20} />
      </div>
    </div>
    <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
    {subtext && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{subtext}</div>}
  </div>
);

// Status Badge
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let badgeStyle = { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', border: 'rgba(255,255,255,0.2)' };
  const s = status.toUpperCase();

  if (['ACTIVE', 'OPTIMAL', 'NORMAL', 'PASS', 'VERIFIED', 'COMPLETED', 'QUALITY_VERIFIED', 'PACKAGED'].includes(s)) {
    badgeStyle = { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
  } else if (['WARNING', 'HARVESTED', 'QUALITY_TESTING', 'PROCESSING'].includes(s)) {
    badgeStyle = { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
  } else if (['CRITICAL', 'ALERT', 'FAIL', 'RECALLED', 'OFFLINE', 'SUSPECTED', 'ADULTERATED'].includes(s)) {
    badgeStyle = { bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.3)' };
  } else if (['MAINTENANCE', 'CREATED', 'PENDING', 'TESTING'].includes(s)) {
    badgeStyle = { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' };
  }

  return (
    <span style={{
      padding: '0.25rem 0.65rem',
      borderRadius: '9999px',
      fontSize: '0.725rem',
      fontWeight: 600,
      background: badgeStyle.bg,
      color: badgeStyle.color,
      border: `1px solid ${badgeStyle.border}`,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem'
    }}>
      {status}
    </span>
  );
};

// Role Badge
export const RoleBadge: React.FC<{ role: UserRole | string }> = ({ role }) => {
  let color = '#f59e0b';
  if (role === 'ADMIN') color = '#8b5cf6';
  if (role === 'BEEKEEPER') color = '#10b981';
  if (role === 'QUALITY_INSPECTOR') color = '#06b6d4';

  return (
    <span style={{
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.725rem',
      fontWeight: 700,
      background: `${color}20`,
      color: color,
      border: `1px solid ${color}40`,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {role}
    </span>
  );
};

// Loading State
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading HoneyChain data...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
    <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--honey-gold)', animation: 'spin 1.2s linear infinite' }} />
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{message}</span>
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
  <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
    <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--honey-gold)' }}>
      <Icon size={36} />
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
    {description && <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: 0, fontSize: '0.9rem' }}>{description}</p>}
    {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
  </div>
);

// Error State
export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.08)', borderRadius: 'var(--radius-lg)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f43f5e', marginBottom: '0.5rem' }}>
      <AlertTriangle size={24} />
      <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem' }}>Unable to load data</h4>
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{message}</p>
    {onRetry && (
      <button className="btn-secondary" onClick={onRetry} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
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
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
