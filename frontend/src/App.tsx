import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SystemStatusBanner } from './components/SystemStatusBanner';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { CheckIn } from './pages/CheckIn';
import { Journal } from './pages/Journal';
import { Fingerprint } from './pages/Fingerprint';
import { Experiments } from './pages/Experiments';
import { Simulator } from './pages/Simulator';
import { Reports } from './pages/Reports';
import { DataSources } from './pages/DataSources';
import { Research } from './pages/Research';
import { Privacy } from './pages/Privacy';

export const AppContent: React.FC = () => {
  const { isAuthenticated, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Initializing MindTrace Platform...
      </div>
    );
  }

  // Redirect to onboarding if authenticated but onboarding not done
  if (isAuthenticated && profile && !profile.onboarding_completed && activeTab !== 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <SystemStatusBanner />
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Onboarding onComplete={() => setActiveTab('dashboard')} />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'landing':
        return <Landing onStart={() => setActiveTab(isAuthenticated ? 'dashboard' : 'register')} />;
      case 'login':
        return <Login onSuccess={() => setActiveTab('dashboard')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'register':
        return <Register onSuccess={() => setActiveTab('onboarding')} onSwitchToLogin={() => setActiveTab('login')} />;
      case 'onboarding':
        return <Onboarding onComplete={() => setActiveTab('dashboard')} />;
      case 'dashboard':
        return isAuthenticated ? <Dashboard onNavigate={setActiveTab} /> : <Login onSuccess={() => setActiveTab('dashboard')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'checkin':
        return isAuthenticated ? <CheckIn onSaved={() => setActiveTab('dashboard')} /> : <Login onSuccess={() => setActiveTab('checkin')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'journal':
        return isAuthenticated ? <Journal /> : <Login onSuccess={() => setActiveTab('journal')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'fingerprint':
        return isAuthenticated ? <Fingerprint /> : <Login onSuccess={() => setActiveTab('fingerprint')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'experiments':
        return isAuthenticated ? <Experiments /> : <Login onSuccess={() => setActiveTab('experiments')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'simulator':
        return isAuthenticated ? <Simulator /> : <Login onSuccess={() => setActiveTab('simulator')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'reports':
        return isAuthenticated ? <Reports /> : <Login onSuccess={() => setActiveTab('reports')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'sources':
        return isAuthenticated ? <DataSources /> : <Login onSuccess={() => setActiveTab('sources')} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'research':
        return <Research />;
      case 'privacy':
        return isAuthenticated ? <Privacy /> : <Login onSuccess={() => setActiveTab('privacy')} onSwitchToRegister={() => setActiveTab('register')} />;
      default:
        return <Landing onStart={() => setActiveTab(isAuthenticated ? 'dashboard' : 'register')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <SystemStatusBanner />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1">
        {renderTab()}
      </main>
      <footer className="bg-slate-900/60 border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-mono">
        MindTrace Behavioral Intelligence Platform — Real Data Guaranteed — Association ≠ Causation
      </footer>
    </div>
  );
};
