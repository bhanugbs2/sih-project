import React from 'react';
import { PageHeader } from '../components/common/UIComponents';
import { Server, ShieldCheck } from 'lucide-react';

export const BlockchainPage: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Blockchain Infrastructure Audit"
        subtitle="EVM smart contract anchor state, network verification parameters, and data integrity hashes"
      />
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
          <Server size={18} style={{ color: 'var(--blockchain-purple)' }} /> Smart Contract Network Parameters
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>NETWORK ENVIRONMENT</span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                <ShieldCheck size={12} /> LOCAL EVM ONLINE
              </span>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Contract Address: <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>0x5FbDB2315678afecb367f032d93F642f64180aa3</strong>
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              RPC Endpoint: http://127.0.0.1:8545 &bull; Chain ID: 31337
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
