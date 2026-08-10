import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FingerprintResponse } from '../types';
import { BehavioralGraph } from '../components/BehavioralGraph';
import { ReadinessCard } from '../components/ReadinessCard';
import { LineChart, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const Fingerprint: React.FC = () => {
  const [fingerprint, setFingerprint] = useState<FingerprintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const fp = await api.getFingerprint();
        setFingerprint(fp);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExplainTopPattern = async () => {
    if (!fingerprint || !fingerprint.patterns.length) return;
    const top = fingerprint.patterns[0];
    try {
      const res = await api.explainEvidence({
        metric_a: top.metric_a,
        metric_b: top.metric_b,
        coefficient: top.coefficient,
        sample_size: top.sample_size,
        date_range: top.date_range
      });
      setAiExplanation(res.explanation);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 font-mono text-sm">Computing statistical fingerprint...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LineChart className="w-6 h-6 text-indigo-400" />
            Your Behavioral Fingerprint
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pairwise Spearman rank correlation matrices (ρ) from your verified longitudinal dataset.
          </p>
        </div>
      </div>

      {/* Graph & Readiness */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BehavioralGraph
            patterns={fingerprint?.patterns || []}
            sufficientData={fingerprint?.sufficient_data || false}
          />
        </div>
        <div>
          <ReadinessCard
            totalObservations={fingerprint?.total_observations || 0}
            dataReadinessPct={fingerprint?.data_readiness_pct || 0}
            sufficientData={fingerprint?.sufficient_data || false}
          />
        </div>
      </div>

      {/* Correlation Matrix Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-200">Statistically Valid Personal Associations</h2>
          {fingerprint?.sufficient_data && fingerprint.patterns.length > 0 && (
            <button
              onClick={handleExplainTopPattern}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate AI Explanation of Strongest Pattern
            </button>
          )}
        </div>

        {aiExplanation && (
          <div className="bg-slate-900/90 p-4 rounded-xl border border-indigo-500/40 text-xs text-slate-200 leading-relaxed">
            <strong className="text-indigo-400 block mb-1 font-mono uppercase">AI Evidence Grounded Explanation:</strong>
            {aiExplanation}
          </div>
        )}

        {!fingerprint?.sufficient_data ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-slate-200 font-bold text-sm">Not enough data to identify a reliable personal pattern</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              MindTrace requires at least 14 paired daily observations before computing statistical coefficients. Keep tracking daily check-ins to unlock your fingerprint.
            </p>
          </div>
        ) : fingerprint.patterns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl">
            No distinct non-zero variance metric correlations found yet across logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Metric Pair</th>
                  <th className="py-3 px-4">Spearman ρ</th>
                  <th className="py-3 px-4">Sample Size (N)</th>
                  <th className="py-3 px-4">95% CI</th>
                  <th className="py-3 px-4">Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {fingerprint.patterns.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {p.metric_a.toUpperCase()} ↔ {p.metric_b.toUpperCase()}
                    </td>
                    <td className={`py-3.5 px-4 font-bold text-sm ${p.coefficient >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {p.coefficient > 0 ? `+${p.coefficient}` : p.coefficient}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{p.sample_size} observations</td>
                    <td className="py-3.5 px-4 text-slate-400">[{p.confidence_interval.join(', ')}]</td>
                    <td className="py-3.5 px-4">
                      {p.is_statistically_significant ? (
                        <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 text-[10px]">
                          p &lt; 0.05
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">p ≥ 0.05</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
