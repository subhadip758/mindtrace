import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { refreshProfile } = useAuth();
  const [nickname, setNickname] = useState('');
  const [ageRange, setAgeRange] = useState('25-34');
  const [primaryGoals, setPrimaryGoals] = useState<string[]>(['focus', 'sleep']);
  const [sleepSchedule, setSleepSchedule] = useState('11:00 PM - 7:00 AM');
  const [workSchedule, setWorkSchedule] = useState('9:00 AM - 5:00 PM');
  const [loading, setLoading] = useState(false);

  const goalOptions = [
    { id: 'focus', label: 'Optimize Focus & Concentration' },
    { id: 'productivity', label: 'Improve Study/Work Output' },
    { id: 'sleep', label: 'Analyze Sleep Quality Impact' },
    { id: 'mood', label: 'Understand Mood Fluctuations' },
    { id: 'habits', label: 'Build & Experiment with Habits' }
  ];

  const toggleGoal = (id: string) => {
    setPrimaryGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateOnboarding({
        nickname: nickname || 'Self-Reflector',
        age_range: ageRange,
        primary_goals: primaryGoals,
        sleep_schedule: sleepSchedule,
        work_schedule: workSchedule
      });
      await refreshProfile();
      onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">MindTrace Onboarding</h2>
            <p className="text-xs text-slate-400">Set your personal behavioral tracking baseline</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Age Range</label>
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="18-24">18–24</option>
              <option value="25-34">25–34</option>
              <option value="35-44">35–44</option>
              <option value="45-54">45–54</option>
              <option value="55+">55+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Primary Investigation Goals</label>
            <div className="space-y-2">
              {goalOptions.map(g => (
                <div
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer flex items-center justify-between transition ${
                    primaryGoals.includes(g.id)
                      ? 'bg-indigo-950/70 border-indigo-500/80 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{g.label}</span>
                  {primaryGoals.includes(g.id) && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Consent Disclosure */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-400 flex gap-3 items-start">
            <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-1">Privacy & Scientific Transparency:</strong>
              Your logs belong 100% to you. MindTrace never claims to diagnose mental health conditions and never exposes raw journal entries to third parties.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Setting up Profile...' : 'Complete Setup & Open Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
