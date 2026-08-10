import React, { useState } from 'react';
import { PatternPair } from '../types';
import { Network, Info, X } from 'lucide-react';

interface BehavioralGraphProps {
  patterns: PatternPair[];
  sufficientData: boolean;
}

export const BehavioralGraph: React.FC<BehavioralGraphProps> = ({ patterns, sufficientData }) => {
  const [selectedPattern, setSelectedPattern] = useState<PatternPair | null>(null);

  if (!sufficientData || patterns.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
        <Network className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-300 mb-1">Personal Behavioral Network Graph</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Not enough real observations to build your interactive behavioral network graph yet. Record at least 14 days of data.
        </p>
      </div>
    );
  }

  // Define graph node coordinates in SVG space (400x300 canvas)
  const nodes = [
    { id: 'sleep_duration', label: 'SLEEP', x: 200, y: 50, color: '#818cf8' },
    { id: 'energy', label: 'ENERGY', x: 90, y: 130, color: '#38bdf8' },
    { id: 'focus', label: 'FOCUS', x: 310, y: 130, color: '#34d399' },
    { id: 'mood', label: 'MOOD', x: 120, y: 240, color: '#f472b6' },
    { id: 'productivity', label: 'PRODUCTIVITY', x: 280, y: 240, color: '#fbbf24' },
    { id: 'screen_time', label: 'SCREEN TIME', x: 200, y: 160, color: '#a78bfa' }
  ];

  const getNode = (id: string) => nodes.find(n => n.id === id || n.id.includes(id));

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            Behavioral Fingerprint Graph
          </h3>
          <p className="text-xs text-slate-400">Click any relationship connection line to inspect statistical evidence.</p>
        </div>
      </div>

      <div className="relative w-full h-[320px] bg-slate-950/70 rounded-xl overflow-hidden border border-slate-900 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
            <linearGradient id="gradPos" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="gradNeg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Render Edge Connections */}
          {patterns.map((p, idx) => {
            const nA = getNode(p.metric_a);
            const nB = getNode(p.metric_b);
            if (!nA || !nB) return null;

            const isPos = p.coefficient >= 0;
            const strokeWidth = Math.max(1.5, Math.abs(p.coefficient) * 5);

            return (
              <g key={idx} className="cursor-pointer group" onClick={() => setSelectedPattern(p)}>
                <line
                  x1={nA.x}
                  y1={nA.y}
                  x2={nB.x}
                  y2={nB.y}
                  stroke={isPos ? 'url(#gradPos)' : 'url(#gradNeg)'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={p.is_statistically_significant ? 'none' : '4,4'}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <text
                  x={(nA.x + nB.x) / 2}
                  y={(nA.y + nB.y) / 2 - 4}
                  fill={isPos ? '#34d399' : '#f87171'}
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="font-bold drop-shadow"
                >
                  {p.coefficient > 0 ? `+${p.coefficient}` : p.coefficient}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                r="22"
                fill="#0f172a"
                stroke={node.color}
                strokeWidth="2.5"
                className="drop-shadow-lg"
              />
              <text
                textAnchor="middle"
                dy="3.5"
                fill="#f8fafc"
                fontSize="8"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Modal Detail for Selected Edge */}
      {selectedPattern && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setSelectedPattern(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-indigo-400 mb-3">
              <Info className="w-5 h-5" />
              <h4 className="font-bold text-lg text-slate-100">Statistical Evidence Detail</h4>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400 font-mono uppercase mb-1">Relationship</div>
                <div className="font-bold text-slate-200 text-base">
                  {selectedPattern.metric_a.toUpperCase()} ↔ {selectedPattern.metric_b.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Spearman ρ</span>
                  <span className="text-lg font-mono font-bold text-indigo-400">
                    {selectedPattern.coefficient > 0 ? `+${selectedPattern.coefficient}` : selectedPattern.coefficient}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Sample Size (N)</span>
                  <span className="text-lg font-mono font-bold text-slate-200">{selectedPattern.sample_size} paired logs</span>
                </div>
              </div>

              <div className="text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">P-Value:</span>
                  <span className="font-mono text-slate-200">{selectedPattern.p_value ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">95% Confidence Interval:</span>
                  <span className="font-mono text-slate-200">[{selectedPattern.confidence_interval.join(', ')}]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date Window:</span>
                  <span className="font-mono text-slate-200">{selectedPattern.date_range}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-lg text-xs text-amber-300">
                <strong>Scientific Limitation Notice:</strong> {selectedPattern.limitation_notice}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
