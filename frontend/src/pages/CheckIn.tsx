import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DailyCheckIn } from '../types';
import { Calendar, Save, CheckCircle2, Sliders, Plus, Trash2, Compass, Activity, Brain } from 'lucide-react';

interface CheckInProps {
  onSaved: () => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ onSaved }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [logDate, setLogDate] = useState(todayStr);
  const [mood, setMood] = useState<number>(7);
  const [energy, setEnergy] = useState<number>(6);
  const [focus, setFocus] = useState<number>(7);
  const [productivity, setProductivity] = useState<number>(6);

  // Advanced Psychometric Constructs
  const [affectiveValence, setAffectiveValence] = useState<number>(1.5); // -5 to +5
  const [affectiveArousal, setAffectiveArousal] = useState<number>(6.0); // 1 to 10
  const [allostaticLoad, setAllostaticLoad] = useState<number>(4.0); // 1 to 10
  const [executiveFunction, setExecutiveFunction] = useState<number>(7.5); // 1 to 10

  const [sleepDuration, setSleepDuration] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(7);
  const [screenTime, setScreenTime] = useState<number>(4.0);
  const [studyWorkDuration, setStudyWorkDuration] = useState<number>(6.0);
  const [exerciseDuration, setExerciseDuration] = useState<number>(30);
  const [socialDuration, setSocialDuration] = useState<number>(45);

  const [customHabits, setCustomHabits] = useState<Record<string, number>>({
    meditation_mins: 15,
    caffeine_cups: 2
  });
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitVal, setNewHabitVal] = useState<number>(10);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      try {
        const existing = await api.getTodayCheckIn(logDate);
        if (existing) {
          if (existing.mood) setMood(existing.mood);
          if (existing.energy) setEnergy(existing.energy);
          if (existing.focus) setFocus(existing.focus);
          if (existing.productivity) setProductivity(existing.productivity);
          if (existing.sleep_duration !== undefined) setSleepDuration(existing.sleep_duration);
          if (existing.sleep_quality) setSleepQuality(existing.sleep_quality);
          if (existing.screen_time !== undefined) setScreenTime(existing.screen_time);
          if (existing.study_work_duration !== undefined) setStudyWorkDuration(existing.study_work_duration);
          if (existing.exercise_duration !== undefined) setExerciseDuration(existing.exercise_duration);
          if (existing.social_duration !== undefined) setSocialDuration(existing.social_duration);
          if (existing.custom_habits) setCustomHabits(existing.custom_habits);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadExisting();
  }, [logDate]);

  const handleAddCustomHabit = () => {
    if (!newHabitName.trim()) return;
    const cleanKey = newHabitName.trim().toLowerCase().replace(/\s+/g, '_');
    setCustomHabits(prev => ({ ...prev, [cleanKey]: newHabitVal }));
    setNewHabitName('');
  };

  const handleRemoveCustomHabit = (key: string) => {
    setCustomHabits(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload: DailyCheckIn = {
        log_date: logDate,
        mood,
        energy,
        focus,
        productivity,
        sleep_duration: sleepDuration,
        sleep_quality: sleepQuality,
        screen_time: screenTime,
        study_work_duration: studyWorkDuration,
        exercise_duration: exerciseDuration,
        social_duration: socialDuration,
        custom_habits: customHabits
      };

      await api.submitCheckIn(payload);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onSaved();
      }, 1000);
    } catch (e) {
      console.error('Checkin save error', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="MindTrace Logo" className="h-9 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Ecological Momentary Assessment (EMA) Check-In
              </h1>
              <p className="text-xs text-slate-400">Micro-sample real observations with data provenance.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none font-mono"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Circumplex Affect Model */}
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              1. Affective Circumplex Model (Russell, 1980)
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              
              {/* Affective Valence */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-300">Affective Valence (-5 Unpleasant to +5 Pleasant)</span>
                  <span className="font-mono text-base text-sky-400 font-bold">{affectiveValence > 0 ? `+${affectiveValence}` : affectiveValence}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={affectiveValence}
                  onChange={(e) => setAffectiveValence(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-sky-500"
                />
              </div>

              {/* Affective Arousal */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-300">Psychophysiological Arousal (1 Low to 10 High)</span>
                  <span className="font-mono text-base text-violet-400 font-bold">{affectiveArousal}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={affectiveArousal}
                  onChange={(e) => setAffectiveArousal(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer accent-violet-500"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Core Subjective Wellbeing Ratings */}
          <div className="space-y-6 pt-4 border-t border-slate-800/60">
            <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              2. Subjective Wellbeing Constructs (1-10)
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: 'Reported Mood', val: mood, set: setMood, color: 'accent-indigo-500' },
                { label: 'Subjective Energy', val: energy, set: setEnergy, color: 'accent-sky-500' },
                { label: 'Attentional Focus', val: focus, set: setFocus, color: 'accent-emerald-500' },
                { label: 'Work Productivity', val: productivity, set: setProductivity, color: 'accent-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono text-base text-indigo-400 font-bold">{item.val}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={item.val}
                    onChange={(e) => item.set(parseFloat(e.target.value))}
                    className={`w-full h-2 bg-slate-800 rounded-lg cursor-pointer ${item.color}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Durations & Behavioral Inputs */}
          <div className="space-y-6 pt-4 border-t border-slate-800/60">
            <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              3. Objective Habit Durations
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Sleep Duration</span>
                  <span className="font-mono text-indigo-400 font-bold">{sleepDuration} hrs</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-200 font-mono"
                />
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Screen Time</span>
                  <span className="font-mono text-indigo-400 font-bold">{screenTime} hrs</span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={screenTime}
                  onChange={(e) => setScreenTime(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-200 font-mono"
                />
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Study / Work Hours</span>
                  <span className="font-mono text-indigo-400 font-bold">{studyWorkDuration} hrs</span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={studyWorkDuration}
                  onChange={(e) => setStudyWorkDuration(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-200 font-mono"
                />
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Physical Exercise</span>
                  <span className="font-mono text-indigo-400 font-bold">{exerciseDuration} mins</span>
                </div>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="1440"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Custom Habit Trackers */}
          <div className="space-y-4 pt-4 border-t border-slate-800/60">
            <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">4. Custom Habit Metrics</h2>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(customHabits).map(([k, val]) => (
                <div key={k} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block capitalize">{k.replace('_', ' ')}</span>
                    <span className="text-sm font-mono text-indigo-400 font-bold">{val}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomHabit(k)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <input
                type="text"
                placeholder="New habit (e.g. caffeine_cups)"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none flex-1"
              />
              <input
                type="number"
                value={newHabitVal}
                onChange={(e) => setNewHabitVal(parseFloat(e.target.value) || 0)}
                className="bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded-lg border border-slate-800 w-20 font-mono"
              />
              <button
                type="button"
                onClick={handleAddCustomHabit}
                className="px-3 py-2 bg-indigo-950 text-indigo-300 border border-indigo-800/50 rounded-lg text-xs font-semibold hover:bg-indigo-900 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Habit
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-4 rounded-xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Saved & Verified Provenance Record!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> {saving ? 'Recording Data...' : 'Save EMA Record & Provenance'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
