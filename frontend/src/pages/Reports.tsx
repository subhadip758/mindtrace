import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileText, CheckCircle2, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';

export const Reports: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const r = await api.getWeeklyReport();
        setReport(r);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 font-mono text-sm">Compiling weekly psychological self-reflection report...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          Weekly Psychology & Behavioral Report
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated multi-metric longitudinal analysis grounded in your self-reported logs.
        </p>
      </div>

      {!report?.sufficient_data ? (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-slate-200 font-bold text-base">Insufficient Data for Weekly Report</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{report?.message}</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Positive Patterns & Friction */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Observed Positive Patterns
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4">
                {report.sections.positive_patterns.map((p: string, idx: number) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Possible Friction Areas
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4">
                {report.sections.possible_friction.map((p: string, idx: number) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Behavioral Averages */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              14-Day Averages Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Average Mood</span>
                <span className="text-lg font-bold text-indigo-400">{report.sections.behavioral_trends.avg_mood}/10</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Average Sleep</span>
                <span className="text-lg font-bold text-violet-400">{report.sections.behavioral_trends.avg_sleep_hours} hrs</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Average Focus</span>
                <span className="text-lg font-bold text-emerald-400">{report.sections.behavioral_trends.avg_focus_score}/10</span>
              </div>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400">
            <strong>Scientific Integrity Statement:</strong> {report.sections.scientific_limitation}
          </div>

        </div>
      )}
    </div>
  );
};
