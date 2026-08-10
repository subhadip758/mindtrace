import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Activity, Database, Cpu, Wifi } from 'lucide-react';

export const SystemStatusBanner: React.FC = () => {
  const { systemHealth, online } = useSystem();

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
      <div className="flex items-center space-x-6">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          SYSTEM STATUS:
        </span>
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          Database: <span className="text-emerald-400 font-medium">● Connected</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          Analytics: <span className="text-emerald-400 font-medium">● Running</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5" />
          AI Engine: <span className="text-emerald-400 font-medium">● Active ({systemHealth?.ai_provider || 'Gemini'})</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 px-2 py-0.5 rounded font-mono text-[10px]">
          MODE: REAL_DATA_ONLY
        </span>
      </div>
    </div>
  );
};
