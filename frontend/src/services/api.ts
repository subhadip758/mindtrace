import {
  UserProfile,
  DailyCheckIn,
  JournalEntry,
  JournalAnalysis,
  FingerprintResponse,
  Experiment,
  ExperimentResult,
  SimulatorResponse,
  DataSourceItem,
  SystemHealth
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('mindtrace_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async register(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateOnboarding(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/onboarding`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update onboarding');
    return res.json();
  },

  // Daily Checkin
  async submitCheckIn(data: DailyCheckIn): Promise<DailyCheckIn> {
    const res = await fetch(`${API_BASE}/daily-checkin/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit check-in');
    return res.json();
  },

  async getCheckIns(limit: number = 30): Promise<DailyCheckIn[]> {
    const res = await fetch(`${API_BASE}/daily-checkin/?limit=${limit}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch check-ins');
    return res.json();
  },

  async getTodayCheckIn(dateStr: string): Promise<DailyCheckIn | null> {
    const res = await fetch(`${API_BASE}/daily-checkin/today?today_date=${dateStr}`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return res.json();
  },

  // Journal
  async createJournal(content: string, moodTags: string[], activityTags: string[]): Promise<JournalEntry> {
    const res = await fetch(`${API_BASE}/journal/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, mood_tags: moodTags, activity_tags: activityTags })
    });
    if (!res.ok) throw new Error('Failed to create journal entry');
    return res.json();
  },

  async getJournals(): Promise<JournalEntry[]> {
    const res = await fetch(`${API_BASE}/journal/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch journal entries');
    return res.json();
  },

  // Behavioral Fingerprint & Evidence
  async getFingerprint(): Promise<FingerprintResponse> {
    const res = await fetch(`${API_BASE}/patterns/fingerprint`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch fingerprint');
    return res.json();
  },

  async explainEvidence(evidenceData: any) {
    const res = await fetch(`${API_BASE}/patterns/explain`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(evidenceData)
    });
    if (!res.ok) throw new Error('Failed to explain evidence');
    return res.json();
  },

  // Experiments
  async createExperiment(title: string, hypothesis: string, targetMetric: string): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/experiments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, hypothesis, target_metric: targetMetric })
    });
    if (!res.ok) throw new Error('Failed to create experiment');
    return res.json();
  },

  async getExperiments(): Promise<Experiment[]> {
    const res = await fetch(`${API_BASE}/experiments/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch experiments');
    return res.json();
  },

  async logExperimentObservation(expId: string, phase: string, dateStr: string, val: number) {
    const res = await fetch(`${API_BASE}/experiments/${expId}/observations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ phase, observation_date: dateStr, metric_value: val })
    });
    if (!res.ok) throw new Error('Failed to log experiment observation');
    return res.json();
  },

  async getExperimentResults(expId: string): Promise<ExperimentResult> {
    const res = await fetch(`${API_BASE}/experiments/${expId}/results`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch experiment results');
    return res.json();
  },

  // Simulator
  async runSimulation(targetMetric: string, adjustments: Record<string, number>): Promise<SimulatorResponse> {
    const res = await fetch(`${API_BASE}/simulator/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ target_metric: targetMetric, feature_adjustments: adjustments })
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    return res.json();
  },

  // Reports
  async getWeeklyReport() {
    const res = await fetch(`${API_BASE}/reports/weekly`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch weekly report');
    return res.json();
  },

  // Data Sources
  async getDataSources(): Promise<DataSourceItem[]> {
    const res = await fetch(`${API_BASE}/data-sources/`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch data sources');
    return res.json();
  },

  async connectSource(providerId: string) {
    const res = await fetch(`${API_BASE}/data-sources/${providerId}/connect`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to connect source');
    return res.json();
  },

  async syncSource(providerId: string) {
    const res = await fetch(`${API_BASE}/data-sources/${providerId}/sync`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to sync source');
    return res.json();
  },

  async disconnectSource(providerId: string) {
    const res = await fetch(`${API_BASE}/data-sources/${providerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to disconnect source');
    return res.json();
  },

  // Research
  async getResearchConsent() {
    const res = await fetch(`${API_BASE}/research/consent`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch research consent');
    return res.json();
  },

  async updateResearchConsent(optIn: boolean) {
    const res = await fetch(`${API_BASE}/research/consent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ opt_in: optIn })
    });
    if (!res.ok) throw new Error('Failed to update consent');
    return res.json();
  },

  async getResearchDashboard() {
    const res = await fetch(`${API_BASE}/research/dashboard`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch research dashboard');
    return res.json();
  },

  // Privacy & Export
  async exportData() {
    const res = await fetch(`${API_BASE}/privacy/export`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to export data');
    return res.json();
  },

  async deleteAccount() {
    const res = await fetch(`${API_BASE}/privacy/account`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete account');
    return res.json();
  },

  // Health
  async getSystemHealth(): Promise<SystemHealth> {
    const res = await fetch('/health');
    if (!res.ok) throw new Error('System offline');
    return res.json();
  }
};
