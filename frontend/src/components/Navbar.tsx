import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, FlaskConical, LayoutDashboard, Calendar, BookOpen, LineChart, Sparkles, FileText, Database, Share2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { isAuthenticated, profile, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checkin', label: 'Check-In', icon: Calendar },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'fingerprint', label: 'Fingerprint', icon: LineChart },
    { id: 'experiments', label: 'Experiment Lab', icon: FlaskConical },
    { id: 'simulator', label: 'What-If ML', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'sources', label: 'Data Sources', icon: Database },
    { id: 'research', label: 'Research', icon: Share2 },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Branding */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('landing')}>
            <div className="h-10 w-auto flex items-center">
              <img
                src="/logo.png"
                alt="MindTrace Logo"
                className="h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(79,70,229,0.5)] group-hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* Nav Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md shadow-indigo-600/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* User Controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-semibold text-slate-200">
                    {profile?.nickname || 'Researcher'}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-mono">
                    ● Real Data Active
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition border border-slate-800"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition hover:scale-105"
                >
                  Start Journey
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
