import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Experiment, ExperimentResult } from '../types';
import { FlaskConical, Plus, Play, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';

export const Experiments: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExp, setSelectedExp] = useState<Experiment | null>(null);
  const [expResult, setExpResult] = useState<ExperimentResult | null>(null);

  // Form states
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [targetMetric, setTargetMetric] = useState('focus');

  // Observation form states
  const [phase, setPhase] = useState<'BASELINE' | 'INTERVENTION'>('BASELINE');
  const [obsValue, setObsValue] = useState<number>(7.0);

  useEffect(() => {
    loadExperiments();
  }, []);

  async function loadExperiments() {
    try {
      const data = await api.getExperiments();
      setExperiments(data);
      if (data.length > 0 && !selectedExp) {
        setSelectedExp(data[0]);
        loadResults(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadResults(expId: string) {
    try {
      const res = await api.getExperimentResults(expId);
      setExpResult(res);
    } catch (e) {
      console.error(e);
    }
  }

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createExperiment(title, hypothesis, targetMetric);
      setTitle('');
      setHypothesis('');
      setShowCreate(false);
      await loadExperiments();
      setSelectedExp(created);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExp) return;
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      await api.logExperimentObservation(selectedExp.id, phase, dateStr, obsValue);
      await loadResults(selectedExp.id);
      await loadExperiments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-violet-400" />
            Behavioral Experiment Lab (N-of-1)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test personal hypotheses scientifically by comparing controlled baseline vs intervention phases.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Experiment
        </button>
      </div>

      {/* Modal: Create Experiment */}
      {showCreate && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl max-w-xl mx-auto">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Design N-of-1 Behavioral Experiment</h3>
          <form onSubmit={handleCreateExperiment} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Experiment Title</label>
              <input
                type="text"
                required
                placeholder="e.g., No Social Media 1 Hour Before Studying"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hypothesis</label>
              <textarea
                rows={3}
                required
                placeholder="e.g., Reducing evening screen time will increase my morning focus score."
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Metric to Measure</label>
              <select
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="focus">Focus Score (1-10)</option>
                <option value="mood">Mood Rating (1-10)</option>
                <option value="productivity">Productivity (1-10)</option>
                <option value="sleep_quality">Sleep Quality (1-10)</option>
                <option value="sleep_duration">Sleep Duration (hrs)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-600/30"
              >
                Launch Experiment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Layout: List & Detail */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Experiment List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">Your Experiments</h3>
          {experiments.length === 0 ? (
            <div className="glass-panel p-6 text-center text-xs text-slate-400 rounded-2xl border border-slate-800">
              No experiments created yet.
            </div>
          ) : (
            experiments.map((exp) => (
              <div
                key={exp.id}
                onClick={() => {
                  setSelectedExp(exp);
                  loadResults(exp.id);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedExp?.id === exp.id
                    ? 'bg-violet-950/70 border-violet-500/80 shadow-lg'
                    : 'glass-panel border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono font-bold text-violet-400 uppercase">{exp.status}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(exp.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-200 text-sm mb-1">{exp.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{exp.target_metric.toUpperCase()}</p>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Selected Experiment Detail & Analysis */}
        <div className="md:col-span-2 space-y-6">
          {selectedExp ? (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
              
              <div>
                <span className="text-xs font-mono font-bold text-violet-400 uppercase bg-violet-950/80 px-2.5 py-1 rounded border border-violet-800/40">
                  Target Metric: {selectedExp.target_metric.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold text-slate-100 mt-2">{selectedExp.title}</h2>
                <p className="text-xs text-slate-300 italic mt-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  Hypothesis: "{selectedExp.hypothesis}"
                </p>
              </div>

              {/* Add Observation Form */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase font-mono">Record Experiment Observation</h4>
                <form onSubmit={handleLogObservation} className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-400">Phase:</label>
                    <select
                      value={phase}
                      onChange={(e: any) => setPhase(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                    >
                      <option value="BASELINE">BASELINE (Control)</option>
                      <option value="INTERVENTION">INTERVENTION (Active)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-400">Value:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={obsValue}
                      onChange={(e) => setObsValue(parseFloat(e.target.value) || 0)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono w-20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition"
                  >
                    Log Entry
                  </button>
                </form>
              </div>

              {/* Statistical Results Card */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  Statistical Comparison Analysis
                </h3>

                {expResult?.sufficient_data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Baseline Mean</span>
                        <span className="text-base font-bold font-mono text-slate-200">
                          {expResult.baseline_mean} ± {expResult.baseline_std}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">N = {expResult.baseline_n}</span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Intervention Mean</span>
                        <span className="text-base font-bold font-mono text-indigo-400">
                          {expResult.intervention_mean} ± {expResult.intervention_std}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">N = {expResult.intervention_n}</span>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-0.5">Observed Change</span>
                        <span className={`text-base font-bold font-mono ${(expResult.pct_change || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(expResult.pct_change || 0) > 0 ? `+${expResult.pct_change}%` : `${expResult.pct_change}%`}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">p = {expResult.p_value ?? 'N/A'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                      {expResult.explanation}
                    </p>

                    <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs text-amber-300">
                      <strong>Scientific Limitation Notice:</strong> {expResult.limitation_notice}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-1">
                    <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">{expResult?.message || 'Log paired observations for both BASELINE and INTERVENTION phases.'}</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-xs text-slate-400 rounded-3xl border border-slate-800">
              Select or launch an experiment to view statistical comparative analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
