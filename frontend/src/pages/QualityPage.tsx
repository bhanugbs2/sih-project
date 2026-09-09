import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader, StatusBadge, LoadingState, EmptyState, ErrorState, Modal } from '../components/common/UIComponents';
import { getAllBatches, getQualityTestsByBatchId, addQualityTest, evaluateHoneyQuality } from '../services/api';
import { HoneyBatch, QualityTest, QualityTestResult, QualityEvaluationResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { FlaskConical, Plus, ShieldCheck, Cpu, Sparkles, AlertCircle } from 'lucide-react';

export const QualityPage: React.FC = () => {
  const { user, role } = useAuth();

  const [batches, setBatches] = useState<HoneyBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moisture, setMoisture] = useState<number>(16.5);
  const [ph, setPh] = useState<number>(3.85);
  const [color, setColor] = useState('Amber Gold');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<QualityTestResult>('PASS');
  const [verifiedBy, setVerifiedBy] = useState(user ? `Analyst ${user}` : 'Lab Analyst S. Verma');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // AI Evaluation State
  const [aiEvalMoisture, setAiEvalMoisture] = useState<number>(16.5);
  const [aiEvalPh, setAiEvalPh] = useState<number>(3.85);
  const [aiEvalColor, setAiEvalColor] = useState('Amber Gold');
  const [aiEvalResult, setAiEvalResult] = useState<QualityEvaluationResponse | null>(null);
  const [aiEvaluating, setAiEvaluating] = useState(false);

  const loadBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const batchesData = await getAllBatches();
      setBatches(batchesData);
      if (batchesData.length > 0) {
        const firstBatchId = batchesData[0].batchId;
        setSelectedBatchId(firstBatchId);
        const tests = await getQualityTestsByBatchId(firstBatchId).catch(() => []);
        setQualityTests(tests);
        runAiEvaluation(firstBatchId, 16.5, 3.85, 'Amber Gold');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quality test records.');
    } finally {
      setLoading(false);
    }
  };

  const runAiEvaluation = async (bId: string, m: number, p: number, c: string) => {
    setAiEvaluating(true);
    try {
      const res = await evaluateHoneyQuality({
        batchId: bId,
        moisture: m,
        ph: p,
        color: c
      });
      setAiEvalResult(res);
    } catch (err) {
      console.error('AI evaluation failed:', err);
    } finally {
      setAiEvaluating(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleBatchChange = async (batchId: string) => {
    setSelectedBatchId(batchId);
    setLoading(true);
    try {
      const tests = await getQualityTestsByBatchId(batchId).catch(() => []);
      setQualityTests(tests);
      if (tests.length > 0 && tests[0].moisture != null && tests[0].ph != null) {
        setAiEvalMoisture(tests[0].moisture);
        setAiEvalPh(tests[0].ph);
        if (tests[0].color) setAiEvalColor(tests[0].color);
        runAiEvaluation(batchId, tests[0].moisture, tests[0].ph, tests[0].color || 'Amber Gold');
      } else {
        runAiEvaluation(batchId, aiEvalMoisture, aiEvalPh, aiEvalColor);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQualityTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setFormError('Please select a honey batch.');
      return;
    }
    if (moisture < 0 || moisture > 100) {
      setFormError('Moisture content cannot be negative.');
      return;
    }
    if (ph < 0 || ph > 14) {
      setFormError('pH level cannot be negative.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await addQualityTest(selectedBatchId, {
        moisture,
        ph,
        color,
        notes: notes.trim() || undefined,
        result,
        verifiedBy
      });
      setIsModalOpen(false);
      setNotes('');
      handleBatchChange(selectedBatchId);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to record quality test result.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Quality Control & Lab Testing"
        subtitle="Laboratory moisture, pH, purity screening, and quality result gates"
        actions={
          (role === 'ADMIN' || role === 'QUALITY_INSPECTOR') ? (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Record Quality Test
            </button>
          ) : undefined
        }
      />

      {/* Batch Selection Dropdown */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Batch:</span>
        <select
          value={selectedBatchId}
          onChange={(e) => handleBatchChange(e.target.value)}
          style={{
            padding: '0.65rem 1.25rem',
            background: '#121824',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--honey-gold)',
            fontWeight: 700,
            fontSize: '0.95rem',
            outline: 'none',
            cursor: 'pointer',
            flex: '1 1 280px'
          }}
        >
          {batches.map((b) => (
            <option key={b.id} value={b.batchId}>
              {b.batchId} (Hive: {b.hiveId} • {b.status})
            </option>
          ))}
        </select>
      </div>

      {/* AI Honey Purity & Adulteration Intelligence Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.75rem', borderLeft: '4px solid var(--honey-gold)', background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.95), rgba(30, 41, 59, 0.8))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Cpu size={22} style={{ color: 'var(--honey-gold)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              AI-Assisted Quality Screening (Phase 6 Decision Support)
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.15)', padding: '0.25rem 0.65rem', borderRadius: '1rem', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} /> Decision Support Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Controls Form */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
              Sample Parameter Simulation
            </div>
            
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>Moisture Content</span>
                <strong style={{ color: 'var(--honey-gold)' }}>{aiEvalMoisture}%</strong>
              </label>
              <input
                type="range"
                min="10.0"
                max="25.0"
                step="0.1"
                value={aiEvalMoisture}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAiEvalMoisture(val);
                  runAiEvaluation(selectedBatchId, val, aiEvalPh, aiEvalColor);
                }}
                style={{ width: '100%', accentColor: 'var(--honey-gold)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IHC Standard Maximum: 20.0%</span>
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>pH Level</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{aiEvalPh}</strong>
              </label>
              <input
                type="range"
                min="2.5"
                max="5.5"
                step="0.05"
                value={aiEvalPh}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAiEvalPh(val);
                  runAiEvaluation(selectedBatchId, val, val, aiEvalColor);
                }}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Standard Purity Range: 3.4 - 4.5</span>
            </div>

            <button
              className="btn-secondary"
              onClick={() => runAiEvaluation(selectedBatchId, aiEvalMoisture, aiEvalPh, aiEvalColor)}
              disabled={aiEvaluating}
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
            >
              {aiEvaluating ? 'Evaluating...' : 'Re-Run AI Quality Diagnostic'}
            </button>
          </div>

          {/* AI Result Cards */}
          {aiEvalResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 180px', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Purity Index</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: aiEvalResult.purityScore >= 90 ? '#10b981' : aiEvalResult.purityScore >= 70 ? '#f59e0b' : '#f43f5e' }}>
                    {aiEvalResult.purityScore}%
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${aiEvalResult.purityScore}%`, background: aiEvalResult.purityScore >= 90 ? '#10b981' : aiEvalResult.purityScore >= 70 ? '#f59e0b' : '#f43f5e', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <div style={{ flex: '1 1 180px', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adulteration Risk Class</div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      background: aiEvalResult.adulterationClass === 'PURE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: aiEvalResult.adulterationClass === 'PURE' ? '#10b981' : '#f43f5e',
                      border: `1px solid ${aiEvalResult.adulterationClass === 'PURE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                    }}>
                      {aiEvalResult.adulterationClass}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Scientific Decision Support Recommendation
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--honey-gold)', flexShrink: 0, marginTop: '2px' }} />
                  <span>"{aiEvalResult.recommendation}"</span>
                </div>
                {aiEvalResult.riskFactors && aiEvalResult.riskFactors.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: '#f43f5e' }}>
                    <strong>Risk Factors:</strong> {aiEvalResult.riskFactors.join(' | ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching lab inspection records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBatches} />
      ) : qualityTests.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No Quality Test Recorded"
          description={`No lab inspection test results have been logged for batch ${selectedBatchId} yet.`}
          action={
            (role === 'ADMIN' || role === 'QUALITY_INSPECTOR') ? (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                Record First Quality Test
              </button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {qualityTests.map((test) => (
            <div key={test.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={test.result} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(test.timestamp).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Moisture Content</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--honey-gold)' }}>
                    {test.moisture !== null && test.moisture !== undefined ? `${test.moisture}%` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Max Standard: 20%</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>pH Level</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {test.ph !== null && test.ph !== undefined ? test.ph : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Standard: 3.4 - 4.5</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Floral Color:</strong> {test.color || 'Amber Gold'}
              </div>

              {test.notes && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{test.notes}"
                </div>
              )}

              {test.verifiedBy && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  Certified by: <strong style={{ color: 'var(--text-primary)' }}>{test.verifiedBy}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Quality Test Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Record Quality Test for ${selectedBatchId}`}>
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleAddQualityTest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Moisture Content (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={moisture}
                onChange={(e) => setMoisture(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>pH Level</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="14"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Honey Color Grade</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Amber Gold, Light Floral Amber"
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Inspection Result</label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as QualityTestResult)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: '#121824', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
            >
              <option value="PASS">PASS (Certified Pure)</option>
              <option value="FAIL">FAIL (Quality Parameter Anomaly)</option>
              <option value="REQUIRES_REVIEW">REQUIRES_REVIEW (Blocked From Processing)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Inspection Notes & Lab Findings</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record lab findings, certificate reference numbers, or observation notes..."
              rows={3}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Inspector / Analyst Name</label>
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit Test Result'}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
