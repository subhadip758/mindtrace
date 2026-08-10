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

async function safeJsonFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  
  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const err = await res.json();
      throw new Error(err.detail || err.message || 'Request failed');
    } else {
      const text = await res.text();
      throw new Error(text.slice(0, 150) || `Server error (${res.status})`);
    }
  }

  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const api = {
  // Auth
  async register(email: string, password: string) {
    return safeJsonFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  async login(email: string, password: string) {
    return safeJsonFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  async getProfile(): Promise<UserProfile> {
    return safeJsonFetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
  },

  async updateOnboarding(data: Partial<UserProfile>): Promise<UserProfile> {
    return safeJsonFetch(`${API_BASE}/auth/onboarding`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  // Daily Checkin
  async submitCheckIn(data: DailyCheckIn): Promise<DailyCheckIn> {
    return safeJsonFetch(`${API_BASE}/daily-checkin/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  async getCheckIns(limit: number = 30): Promise<DailyCheckIn[]> {
    return safeJsonFetch(`${API_BASE}/daily-checkin/?limit=${limit}`, { headers: getAuthHeaders() });
  },

  async getTodayCheckIn(dateStr: string): Promise<DailyCheckIn | null> {
    try {
      return await safeJsonFetch(`${API_BASE}/daily-checkin/today?today_date=${dateStr}`, { headers: getAuthHeaders() });
    } catch {
      return null;
    }
  },

  // Journal
  async createJournal(content: string, moodTags: string[], activityTags: string[]): Promise<JournalEntry> {
    return safeJsonFetch(`${API_BASE}/journal/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, mood_tags: moodTags, activity_tags: activityTags })
    });
  },

  async getJournals(): Promise<JournalEntry[]> {
    return safeJsonFetch(`${API_BASE}/journal/`, { headers: getAuthHeaders() });
  },

  // Behavioral Fingerprint & Evidence
  async getFingerprint(): Promise<FingerprintResponse> {
    return safeJsonFetch(`${API_BASE}/patterns/fingerprint`, { headers: getAuthHeaders() });
  },

  async explainEvidence(evidenceData: any) {
    return safeJsonFetch(`${API_BASE}/patterns/explain`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(evidenceData)
    });
  },

  // Experiments
  async createExperiment(title: string, hypothesis: string, targetMetric: string): Promise<Experiment> {
    return safeJsonFetch(`${API_BASE}/experiments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, hypothesis, target_metric: targetMetric })
    });
  },

  async getExperiments(): Promise<Experiment[]> {
    return safeJsonFetch(`${API_BASE}/experiments/`, { headers: getAuthHeaders() });
  },

  async logExperimentObservation(expId: string, phase: string, dateStr: string, val: number) {
    return safeJsonFetch(`${API_BASE}/experiments/${expId}/observations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ phase, observation_date: dateStr, metric_value: val })
    });
  },

  async getExperimentResults(expId: string): Promise<ExperimentResult> {
    return safeJsonFetch(`${API_BASE}/experiments/${expId}/results`, { headers: getAuthHeaders() });
  },

  // Simulator
  async runSimulation(targetMetric: string, adjustments: Record<string, number>): Promise<SimulatorResponse> {
    return safeJsonFetch(`${API_BASE}/simulator/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ target_metric: targetMetric, feature_adjustments: adjustments })
    });
  },

  // Reports
  async getWeeklyReport() {
    return safeJsonFetch(`${API_BASE}/reports/weekly`, { headers: getAuthHeaders() });
  },

  // Data Sources
  async getDataSources(): Promise<DataSourceItem[]> {
    return safeJsonFetch(`${API_BASE}/data-sources/`, { headers: getAuthHeaders() });
  },

  async connectSource(providerId: string) {
    return safeJsonFetch(`${API_BASE}/data-sources/${providerId}/connect`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  async syncSource(providerId: string) {
    return safeJsonFetch(`${API_BASE}/data-sources/${providerId}/sync`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  async disconnectSource(providerId: string) {
    return safeJsonFetch(`${API_BASE}/data-sources/${providerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Research
  async getResearchConsent() {
    return safeJsonFetch(`${API_BASE}/research/consent`, { headers: getAuthHeaders() });
  },

  async updateResearchConsent(optIn: boolean) {
    return safeJsonFetch(`${API_BASE}/research/consent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ opt_in: optIn })
    });
  },

  async getResearchDashboard() {
    return safeJsonFetch(`${API_BASE}/research/dashboard`, { headers: getAuthHeaders() });
  },

  // Privacy & Export
  async exportData() {
    return safeJsonFetch(`${API_BASE}/privacy/export`, { headers: getAuthHeaders() });
  },

  async deleteAccount() {
    return safeJsonFetch(`${API_BASE}/privacy/account`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Health
  async getSystemHealth(): Promise<SystemHealth> {
    return safeJsonFetch('/health');
  }
};
