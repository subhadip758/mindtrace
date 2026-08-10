import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Share2, Download, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const Research: React.FC = () => {
  const [optIn, setOptIn] = useState(false);
  const [researchData, setResearchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResearch();
  }, []);

  async function loadResearch() {
    setLoading(true);
    try {
      const consent = await api.getResearchConsent();
      setOptIn(consent.opt_in);
      const dash = await api.getResearchDashboard();
      setResearchData(dash);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleConsent = async (val: boolean) => {
    setOptIn(val);
    try {
      await api.updateResearchConsent(val);
      await loadResearch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-indigo-400" />
          Research Mode & Population Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explicit opt-in research participation with strict data minimization, pseudonymization, and aggregate statistical publishing.
        </p>
      </div>

      {/* Opt-in Consent Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Research Consent Status</h3>
              <p className="text-xs text-slate-400">Contribute anonymized behavioral data to open behavioral science.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(e) => handleToggleConsent(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-400 border border-slate-800">
          <strong>Privacy Guarantee:</strong> Names, emails, and raw journal text entries are NEVER shared. Only pseudonymized numerical metrics are aggregated.
        </div>
      </div>

      {/* Aggregate Population Dashboard */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200">Aggregated Population Statistics</h2>
          <a
            href="/api/v1/research/export/csv"
            download
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Export Aggregate CSV
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Opt-In Research Participants</span>
            <span className="text-2xl font-bold text-indigo-400">{researchData?.total_participants || 0}</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Aggregated Anonymized Logs</span>
            <span className="text-2xl font-bold text-emerald-400">{researchData?.total_observations || 0}</span>
          </div>
        </div>

        {researchData?.aggregate_correlations?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Metric Pair</th>
                  <th className="py-2.5 px-3">Aggregate Spearman ρ</th>
                  <th className="py-2.5 px-3">Sample Size (N)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {researchData.aggregate_correlations.map((c: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 uppercase font-semibold">{c.metric_a} ↔ {c.metric_b}</td>
                    <td className="py-2.5 px-3 text-indigo-400 font-bold">{c.spearman_rho}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.sample_size} logs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
            {researchData?.message || 'No aggregate research correlations calculated yet.'}
          </div>
        )}
      </div>
    </div>
  );
};
