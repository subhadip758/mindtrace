import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Download, Trash2, CheckCircle2, Cpu, FileText } from 'lucide-react';

export const Privacy: React.FC = () => {
  const { logout } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState('');

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindtrace_data_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('ARE YOU SURE? This will permanently delete your account and all associated check-ins, journal entries, and experiments from the database.')) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteAccount();
      setDeletedMsg('Account and all personal records permanently deleted.');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-400" />
          Privacy Center & Data Control
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Full data ownership guarantees. View, export, or permanently erase your dataset at any time.
        </p>
      </div>

      {deletedMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-xs text-emerald-300 font-bold">
          {deletedMsg}
        </div>
      )}

      {/* Export & Delete Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Export Data */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-200 text-base">Export My Data</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Download a complete JSON file containing your profile, daily check-in history, journal logs, and experiment results.
          </p>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Generating JSON Package...' : 'Download Complete Data Export'}
          </button>
        </div>

        {/* Delete Account */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-200 text-base">Delete Account & Erasure</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Permanently delete your user record and all associated logs from our database. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Erasing Account...' : 'Permanently Delete Account & Data'}
          </button>
        </div>

      </div>

      {/* AI Processing Disclosure */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          External AI Processing Policy
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          MindTrace sends journal text entries to Google Gemini / OpenAI strictly for structured emotional and cognitive signal extraction. We do not pass full user history datasets to external LLMs. Correlation math is computed locally on the server.
        </p>
      </div>
    </div>
  );
};
