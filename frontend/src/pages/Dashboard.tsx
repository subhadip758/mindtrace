import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DailyCheckIn, FingerprintResponse, Experiment } from '../types';
import { ReadinessCard } from '../components/ReadinessCard';
import { Calendar, Plus, LineChart, FlaskConical, AlertCircle, ArrowUpRight, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [todayLog, setTodayLog] = useState<DailyCheckIn | null>(null);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [fingerprint, setFingerprint] = useState<FingerprintResponse | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [today, logs, fp, exps] = await Promise.all([
          api.getTodayCheckIn(todayStr),
          api.getCheckIns(14),
          api.getFingerprint(),
          api.getExperiments()
        ]);
        setTodayLog(today);
        setCheckIns(logs.reverse()); // Chronological for chart
        setFingerprint(fp);
        setExperiments(exps);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [todayStr]);

  const activeExp = experiments.find(e => e.status === 'BASELINE' || e.status === 'INTERVENTION');

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-mono text-sm animate-pulse">
        Fetching personal longitudinal dataset...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner & Quick Check-in CTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Personal Behavioral Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical metrics derived exclusively from your verified real data log.
          </p>
        </div>
        <button
          onClick={() => onNavigate('checkin')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          {todayLog ? 'Update Today Check-In' : 'Complete Daily Check-In'}
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today & Trends (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Log Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Today's Recorded Habits ({todayStr})
              </h2>
              {todayLog ? (
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  ✓ Recorded
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-semibold bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/40">
                  Pending Check-In
                </span>
              )}
            </div>

            {todayLog ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Mood', val: todayLog.mood, max: 10, unit: '/10', color: 'text-indigo-400' },
                  { label: 'Energy', val: todayLog.energy, max: 10, unit: '/10', color: 'text-sky-400' },
                  { label: 'Focus', val: todayLog.focus, max: 10, unit: '/10', color: 'text-emerald-400' },
                  { label: 'Productivity', val: todayLog.productivity, max: 10, unit: '/10', color: 'text-amber-400' },
                  { label: 'Sleep', val: todayLog.sleep_duration, max: 24, unit: ' hrs', color: 'text-violet-400' },
                  { label: 'Screen Time', val: todayLog.screen_time, max: 24, unit: ' hrs', color: 'text-rose-400' },
                ].map((m, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block">{m.label}</span>
                    <span className={`text-xl font-bold font-mono ${m.color}`}>
                      {m.val !== undefined && m.val !== null ? `${m.val}${m.unit}` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                <p className="text-xs text-slate-400 mb-3">Your behavioral timeline starts here. Complete today's check-in.</p>
                <button
                  onClick={() => onNavigate('checkin')}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  Record Check-In Now
                </button>
              </div>
            )}
          </div>

          {/* Longitudinal Trend Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-indigo-400" />
              Recent 14-Day Trajectory
            </h2>

            {checkIns.length > 1 ? (
              <div className="h-[260px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={checkIns}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="log_date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotonic" dataKey="mood" stroke="#818cf8" strokeWidth={2} name="Mood (1-10)" />
                    <Line type="monotonic" dataKey="focus" stroke="#34d399" strokeWidth={2} name="Focus (1-10)" />
                    <Line type="monotonic" dataKey="sleep_duration" stroke="#c084fc" strokeWidth={2} name="Sleep (hrs)" />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                Log at least 2 days to view trajectory graphs.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Readiness & Active Experiments (1 col) */}
        <div className="space-y-8">
          
          {/* Data Readiness Meter */}
          <ReadinessCard
            totalObservations={fingerprint?.total_observations || 0}
            dataReadinessPct={fingerprint?.data_readiness_pct || 0}
            sufficientData={fingerprint?.sufficient_data || false}
          />

          {/* Active Experiment Widget */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-violet-400" />
                Active Experiment
              </h3>
              <button onClick={() => onNavigate('experiments')} className="text-xs text-indigo-400 hover:underline">
                View All
              </button>
            </div>

            {activeExp ? (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-indigo-300 uppercase font-mono">{activeExp.status} PHASE</div>
                <h4 className="font-semibold text-slate-200 text-sm">{activeExp.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{activeExp.hypothesis}</p>
                <button
                  onClick={() => onNavigate('experiments')}
                  className="w-full mt-2 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold border border-indigo-800/40"
                >
                  Log Experiment Observation
                </button>
              </div>
            ) : (
              <div className="p-5 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 mb-3">No active N-of-1 experiment running.</p>
                <button
                  onClick={() => onNavigate('experiments')}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold"
                >
                  Launch Experiment
                </button>
              </div>
            )}
          </div>

          {/* Scientific Disclaimer Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Scientific Transparency Policy
            </div>
            <p className="leading-relaxed">
              MindTrace calculates mathematical correlation coefficients from your personal data. It never claims causation or provides psychological medical diagnoses.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
