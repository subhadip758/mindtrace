import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { JournalEntry } from '../types';
import { BookOpen, Sparkles, Tag, AlertTriangle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export const Journal: React.FC = () => {
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState('Reflective');
  const [activityTag, setActivityTag] = useState('Study / Work');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJournals();
  }, []);

  async function loadJournals() {
    try {
      const data = await api.getJournals();
      setEntries(data);
    } catch (e) {
      console.error('Failed to load journals', e);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.createJournal(content, [moodTag], [activityTag]);
      setContent('');
      await loadJournals();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Writer Panel */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <img src="/logo.png" alt="MindTrace Logo" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-bold text-slate-100">Journal & Cognitive Bias Diagnostics</h1>
            <p className="text-xs text-slate-400">Ecological Momentary Reflection with cognitive load & distortion detection.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your personal reflections here... (e.g., 'I felt completely stressed about the exam and thought everything was ruined, but studying with friends helped.')"
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition leading-relaxed resize-none font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400">Mood:</span>
                <input
                  type="text"
                  value={moodTag}
                  onChange={(e) => setMoodTag(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none w-24"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Tag className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-slate-400">Activity:</span>
                <input
                  type="text"
                  value={activityTag}
                  onChange={(e) => setActivityTag(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none w-28"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              {submitting ? 'Analyzing Psychometrics...' : 'Save & Analyze Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Entry History & Structured AI Analysis */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-200">Psychometric Reflection History</h2>

        {entries.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-xs text-slate-400">
            No journal entries recorded yet. Write your first reflection above.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/60 font-mono">
                <span>{new Date(entry.created_at).toLocaleString()}</span>
                <div className="flex gap-2">
                  {entry.mood_tags?.map((t, idx) => (
                    <span key={idx} className="bg-indigo-950/70 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/40 text-[11px]">
                      #{t}
                    </span>
                  ))}
                  {entry.activity_tags?.map((t, idx) => (
                    <span key={idx} className="bg-violet-950/70 text-violet-300 px-2 py-0.5 rounded border border-violet-800/40 text-[11px]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{entry.content}</p>

              {/* AI Psychometric Analysis Display */}
              {entry.analysis && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-400 flex items-center gap-1.5 font-mono uppercase">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      Psychometric Construct Analysis
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Cognitive Load: <strong className="text-amber-400">{entry.analysis.cognitive_load_index || 5.0}/10</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic">{entry.analysis.summary}</p>

                  <div className="grid sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-1 text-[10px] font-mono uppercase">Cognitive Themes</span>
                      <div className="flex flex-wrap gap-1">
                        {entry.analysis.themes.map((t, i) => (
                          <span key={i} className="text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded text-[11px] font-medium">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-1 text-[10px] font-mono uppercase">Affect Signals</span>
                      <div className="flex flex-wrap gap-1">
                        {entry.analysis.emotional_signals.map((s, i) => (
                          <span key={i} className="text-sky-300 bg-sky-950/50 px-1.5 py-0.5 rounded text-[11px] font-medium">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-1 text-[10px] font-mono uppercase">Behavior Signals</span>
                      <div className="flex flex-wrap gap-1">
                        {entry.analysis.behavioral_signals.map((b, i) => (
                          <span key={i} className="text-emerald-300 bg-emerald-950/50 px-1.5 py-0.5 rounded text-[11px] font-medium">{b}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-1 text-[10px] font-mono uppercase">Cognitive Biases</span>
                      <div className="flex flex-wrap gap-1">
                        {entry.analysis.cognitive_biases && entry.analysis.cognitive_biases.length > 0 ? (
                          entry.analysis.cognitive_biases.map((cb, i) => (
                            <span key={i} className="text-rose-300 bg-rose-950/50 px-1.5 py-0.5 rounded text-[11px] font-medium">{cb}</span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">None Detected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
