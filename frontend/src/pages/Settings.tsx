import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sliders, User, Shield, Key } from 'lucide-react';

export const Settings: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-indigo-400" />
          Account & Preference Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage user preferences and custom habit tracking definitions.</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Profile Information</h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Nickname</span>
            <span className="text-slate-200 font-bold">{profile?.nickname || 'N/A'}</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Age Range</span>
            <span className="text-slate-200 font-bold">{profile?.age_range || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
