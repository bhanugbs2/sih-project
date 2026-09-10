import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { UserRole } from '../types';
import { Eye, EyeOff, Lock, User, AlertCircle, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('beekeeper');
  const [password, setPassword] = useState('Beekeeper@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await loginApi({ username: username.trim(), password });
      login(response);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to connect to HoneyChain backend. Please verify backend service is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.15) 0%, rgba(10, 13, 20, 1) 70%)',
      padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem auto',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)'
          }}>
            🍯
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>
            Honey<span className="gradient-text">Chain</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
            Smart Beekeeping & Blockchain Honey Traceability
          </p>
        </div>

        {/* Login Form Panel */}
        <div className="glass-panel" style={{ padding: '2.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
            System Sign In
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Enter your credentials to access the secure dashboard.
          </p>

          {error && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.925rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.925rem',
                    outline: 'none'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                fontSize: '0.95rem',
                marginTop: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Section */}
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--honey-gold)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              <ShieldAlert size={14} />
              <span>Development Demo Credentials</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleSelectDemoAccount('admin', 'Admin@12345')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: username === 'admin' ? 'rgba(139, 92, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: username === 'admin' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#8b5cf6' }}>ADMIN:</span> admin / Admin@12345
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoAccount('beekeeper', 'Beekeeper@12345')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: username === 'beekeeper' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: username === 'beekeeper' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>BEEKEEPER:</span> beekeeper / Beekeeper@12345
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Apiary Operations</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoAccount('inspector', 'Inspector@12345')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: username === 'inspector' ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  border: username === 'inspector' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#06b6d4' }}>QUALITY INSPECTOR:</span> inspector / Inspector@12345
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lab Inspection</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
