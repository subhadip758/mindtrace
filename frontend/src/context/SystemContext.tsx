import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemHealth } from '../types';
import { api } from '../services/api';

interface SystemContextType {
  systemHealth: SystemHealth | null;
  online: boolean;
  refreshHealth: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [online, setOnline] = useState<boolean>(true);

  const refreshHealth = async () => {
    try {
      const h = await api.getSystemHealth();
      setSystemHealth(h);
      setOnline(true);
    } catch {
      setOnline(false);
      setSystemHealth(null);
    }
  };

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SystemContext.Provider value={{ systemHealth, online, refreshHealth }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};
