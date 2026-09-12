import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
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
      background: 'var(--bg-primary)',
      padding: '1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            margin: '0 auto 0.85rem auto',
            borderRadius: 'var(--radius-md)',
            background: 'var(--honey-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            color: '#FFFFFF'
          }}>
            🍯
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            HoneyChain
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Smart Beekeeping & Honey Traceability Platform
          </p>
        </div>

        {/* Login Form Panel */}
        <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-secondary)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            System Sign In
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
            Enter your credentials to access your operational workspace.
          </p>

          {error && (
            <div style={{
              padding: '0.75rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--status-danger-bg)',
              border: '1px solid var(--status-danger-border)',
              color: 'var(--status-danger)',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="form-control"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-control"
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                padding: '0.75rem',
                fontSize: '0.9rem',
                marginTop: '0.25rem'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Section */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              <ShieldAlert size={14} />
              <span>Select Demo Account</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleSelectDemoAccount('admin', 'Admin@12345')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: username === 'admin' ? 'var(--honey-amber-light)' : 'var(--bg-primary)',
                  border: username === 'admin' ? '1px solid var(--honey-amber)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--blockchain-purple)' }}>ADMIN:</span> admin / Admin@12345
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Administrator</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoAccount('beekeeper', 'Beekeeper@12345')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: username === 'beekeeper' ? 'var(--honey-amber-light)' : 'var(--bg-primary)',
                  border: username === 'beekeeper' ? '1px solid var(--honey-amber)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>BEEKEEPER:</span> beekeeper / Beekeeper@12345
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
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: username === 'inspector' ? 'var(--honey-amber-light)' : 'var(--bg-primary)',
                  border: username === 'inspector' ? '1px solid var(--honey-amber)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--status-info)' }}>INSPECTOR:</span> inspector / Inspector@12345
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quality Testing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
