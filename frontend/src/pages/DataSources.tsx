import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DataSourceItem } from '../types';
import { Database, RefreshCw, CheckCircle2, XCircle, Smartphone, Heart, Activity, Watch } from 'lucide-react';

export const DataSources: React.FC = () => {
  const [sources, setSources] = useState<DataSourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    try {
      const data = await api.getDataSources();
      setSources(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleConnect = async (provId: string) => {
    try {
      await api.connectSource(provId);
      await loadSources();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async (provId: string) => {
    setSyncingId(provId);
    try {
      await api.syncSource(provId);
      await loadSources();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (provId: string) => {
    try {
      await api.disconnectSource(provId);
      await loadSources();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (provId: string) => {
    switch (provId) {
      case 'health_connect': return <Smartphone className="w-6 h-6 text-emerald-400" />;
      case 'apple_health': return <Heart className="w-6 h-6 text-rose-400" />;
      case 'google_fit': return <Activity className="w-6 h-6 text-sky-400" />;
      default: return <Watch className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-400" />
          Connected Data Integrations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized external data synchronization architecture with complete data provenance tracking.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sources.map((s) => {
          const isConnected = s.connection_status === 'CONNECTED' || s.connection_status === 'SYNCED';
          return (
            <div key={s.provider_id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    {getIcon(s.provider_id)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{s.provider_name}</h3>
                    <span className={`text-[10px] font-mono font-semibold ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                      ● {s.connection_status}
                    </span>
                  </div>
                </div>
              </div>

              {s.last_sync && (
                <div className="text-[11px] font-mono text-slate-400">
                  Last Sync: {new Date(s.last_sync).toLocaleString()}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleSync(s.provider_id)}
                      disabled={syncingId === s.provider_id}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingId === s.provider_id ? 'animate-spin' : ''}`} />
                      Sync Now
                    </button>
                    <button
                      onClick={() => handleDisconnect(s.provider_id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold transition"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(s.provider_id)}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                  >
                    Authorize Integration
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
