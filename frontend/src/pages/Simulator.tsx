import React, { useState } from 'react';
import { api } from '../services/api';
import { SimulatorResponse } from '../types';
import { Sparkles, Sliders, AlertCircle, ArrowUpRight } from 'lucide-react';

export const Simulator: React.FC = () => {
  const [targetMetric, setTargetMetric] = useState('focus');
  const [sleepAdj, setSleepAdj] = useState<number>(8.0);
  const [screenAdj, setScreenAdj] = useState<number>(2.5);
  const [exerciseAdj, setExerciseAdj] = useState<number>(45);

  const [result, setResult] = useState<SimulatorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.runSimulation(targetMetric, {
        sleep_duration: sleepAdj,
        screen_time: screenAdj,
        exercise_duration: exerciseAdj
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          What-If Personal ML Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Predict metric responses based strictly on machine learning models trained on your historical dataset.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Input Controls */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Hypothetical Habit Adjustments
          </h2>

          <form onSubmit={handleSimulate} className="space-y-5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Metric to Predict</label>
              <select
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono"
              >
                <option value="focus">Focus Score (1-10)</option>
                <option value="mood">Mood Rating (1-10)</option>
                <option value="productivity">Productivity (1-10)</option>
                <option value="energy">Energy Score (1-10)</option>
              </select>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Hypothetical Sleep</span>
                <span className="font-mono text-indigo-400">{sleepAdj} hrs</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleepAdj}
                onChange={(e) => setSleepAdj(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Hypothetical Screen Time</span>
                <span className="font-mono text-indigo-400">{screenAdj} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={screenAdj}
                onChange={(e) => setScreenAdj(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-rose-500"
              />
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Hypothetical Exercise</span>
                <span className="font-mono text-indigo-400">{exerciseAdj} mins</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={exerciseAdj}
                onChange={(e) => setExerciseAdj(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Training Model & Simulating...' : 'Run Simulation Model'}
            </button>
          </form>
        </div>

        {/* Prediction Results Display */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-slate-200">Simulation Model Results</h2>

          {result ? (
            result.sufficient_data ? (
              <div className="space-y-4">
                <div className="p-6 bg-slate-900 rounded-2xl border border-indigo-500/40 text-center space-y-2">
                  <span className="text-xs text-slate-400 font-mono uppercase">Predicted {result.target_metric.toUpperCase()}</span>
                  <div className="text-4xl font-extrabold font-mono text-indigo-400">{result.predicted_value}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    Baseline Average: <span className="text-slate-200">{result.baseline_value}</span> ({result.predicted_change_pct > 0 ? `+${result.predicted_change_pct}%` : `${result.predicted_change_pct}%`})
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ML Model:</span>
                    <span className="text-slate-200">{result.model_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Training Samples:</span>
                    <span className="text-slate-200">{result.sample_size_used} logs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">R² Score:</span>
                    <span className="text-indigo-300 font-bold">{result.r2_score}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  {result.message}
                </p>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-slate-200 font-bold text-sm">Simulation Unavailable</h3>
                <p className="text-xs text-slate-400">{result.message}</p>
              </div>
            )
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
              Adjust sliders and run simulation to predict expected metric shifts.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
