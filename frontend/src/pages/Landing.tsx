import React from 'react';
import { ThreeBrainCanvas } from '../components/ThreeBrainCanvas';
import { LineChart, FlaskConical, Shield, Sparkles, ArrowRight, Database, Brain, Activity, Compass, Layers, CheckCircle2 } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* 3D Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="text-left space-y-6">
              
              {/* Official MindTrace Logo */}
              <div className="inline-block mb-2">
                <img
                  src="/logo.png"
                  alt="MindTrace Logo"
                  className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/40 text-indigo-300 text-xs font-semibold font-mono tracking-wide">
                <Activity className="w-4 h-4 text-indigo-400" />
                CLINICAL PSYCHOMETRIC & EMA BEHAVIORAL PLATFORM
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 leading-tight">
                Empirical Self-Reflection Powered by <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400">Longitudinal Data</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Discover statistically validated co-variations between everyday behaviors and psychological constructs—using Ecological Momentary Assessment (EMA) and N-of-1 experimental designs.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={onStart}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#psychological-framework"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel text-slate-300 hover:text-white font-semibold text-base transition hover:bg-slate-800/80 text-center"
                >
                  Psychometric Framework
                </a>
              </div>

              <div className="pt-4 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real Data Only
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Synthetic Scores
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> N-of-1 Protocol
                </span>
              </div>

            </div>

            {/* Right 3D Interactive Canvas */}
            <div className="relative glass-panel rounded-3xl p-4 border border-indigo-500/20 shadow-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
              <div className="absolute top-4 left-4 z-20 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-indigo-300 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                3D NEURAL COGNITIVE MATRIX
              </div>
              
              <ThreeBrainCanvas />
              
              <div className="absolute bottom-4 right-4 z-20 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
                Interactive Synaptic Mesh (Hover to Tilt)
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Psychological Terminology & Framework Section */}
      <section id="psychological-framework" className="py-20 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-100 mb-3">Professional Psychological Science</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Built upon empirical methodologies used by clinical behavioral researchers, psychometrists, and cognitive neuroscientists.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Ecological Momentary Assessment (EMA)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Replaces retrospective questionnaire recall bias with real-time micro-sampling in natural environments, preserving ecological construct validity.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 hover:border-violet-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-violet-950 border border-violet-800 flex items-center justify-center text-violet-400 mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Russell's Affect Circumplex Model</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deconstructs mood into orthogonal 2D dimensional axes: Affective Valence (-5 to +5) and Psychophysiological Arousal (1 to 10).
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-6">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">N-of-1 Single-Subject Protocols</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rigorous A-B-A Reversal experimental designs with controlled baseline phases, evaluating individual treatment effect size (Cohen's d).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cognitive Biases & Features Showcase */}
      <section className="py-20 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">
                EXPLAINABLE AI & DIAGNOSTIC TRANSPARENCY
              </span>
              <h2 className="text-3xl font-bold text-slate-100">Heuristic & Cognitive Bias Detection</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                MindTrace analyzes journal reflections to flag cognitive distortions (such as catastrophizing, dichotomous thinking, and confirmation bias) without making false psychiatric diagnoses.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Allostatic Load Index</span>
                  <span className="text-indigo-400 font-bold">Calculated</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Circadian Rhythm Alignment</span>
                  <span className="text-emerald-400 font-bold">Monitored</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Construct Discriminant Validity</span>
                  <span className="text-violet-400 font-bold">Verified</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-200 text-sm">Psychometric Analysis Output Sample</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-slate-300">
                  <span className="text-slate-500 block mb-1">Identified Cognitive Distortion:</span>
                  <span className="text-rose-400 font-bold">Dichotomous (All-or-Nothing) Thinking</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-slate-300">
                  <span className="text-slate-500 block mb-1">Spearman Rank Correlation:</span>
                  <span className="text-indigo-400 font-bold">Sleep Duration ↔ Focus (ρ = +0.64, p &lt; 0.01)</span>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Note: Observational co-variation does not prove direct causation.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-slate-100 mb-4">Start Discovering Your Personal Behavioral Patterns</h2>
          <p className="text-slate-400 text-sm mb-8">No synthetic data. No fake AI conclusions. 100% empirical data.</p>
          <button
            onClick={onStart}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition hover:scale-105"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

    </div>
  );
};
