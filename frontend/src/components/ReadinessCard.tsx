import React from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReadinessCardProps {
  totalObservations: number;
  dataReadinessPct: number;
  sufficientData: boolean;
}

export const ReadinessCard: React.FC<ReadinessCardProps> = ({
  totalObservations,
  dataReadinessPct,
  sufficientData
}) => {
  const minRequired = 14;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-200">DATA READINESS</h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            sufficientData
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
              : 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
          }`}
        >
          {sufficientData ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {sufficientData ? 'Analytics Ready' : 'Building Baseline'}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Daily observations threshold</span>
            <span className="font-mono text-slate-300">{totalObservations} / {minRequired} days</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                sufficientData ? 'bg-indigo-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (totalObservations / minRequired) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block mb-0.5">Overall Readiness</span>
            <span className="text-lg font-bold font-mono text-indigo-400">{dataReadinessPct}%</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block mb-0.5">Statistical Validity</span>
            <span className="text-sm font-semibold text-slate-300">
              {sufficientData ? 'High Confidence' : `${minRequired - totalObservations} days left`}
            </span>
          </div>
        </div>

        {!sufficientData && (
          <p className="text-xs text-amber-400/90 leading-relaxed bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/30">
            MindTrace strictly avoids synthetic data. Complete daily check-ins to unlock statistical correlation matrices.
          </p>
        )}
      </div>
    </div>
  );
};
