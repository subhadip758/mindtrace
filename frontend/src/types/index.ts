export interface UserProfile {
  id: string;
  user_id: string;
  nickname?: string;
  age_range?: string;
  primary_goals: string[];
  sleep_schedule?: string;
  work_schedule?: string;
  custom_metrics_schema: string[];
  onboarding_completed: boolean;
}

export interface DailyCheckIn {
  id?: string;
  log_date: string;
  mood?: number;
  energy?: number;
  focus?: number;
  productivity?: number;
  sleep_duration?: number;
  sleep_quality?: number;
  screen_time?: number;
  study_work_duration?: number;
  exercise_duration?: number;
  social_duration?: number;
  custom_habits?: Record<string, number>;
  created_at?: string;
}

export interface JournalAnalysis {
  themes: string[];
  emotional_signals: string[];
  behavioral_signals: string[];
  confidence: number;
  summary: string;
  safety_flag: boolean;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood_tags: string[];
  activity_tags: string[];
  created_at: string;
  analysis?: JournalAnalysis;
}

export interface PatternPair {
  metric_a: string;
  metric_b: string;
  coefficient: number;
  sample_size: number;
  p_value?: number;
  confidence_interval: number[];
  date_range: string;
  is_statistically_significant: boolean;
  limitation_notice: string;
}

export interface FingerprintResponse {
  total_observations: number;
  data_readiness_pct: number;
  sufficient_data: boolean;
  patterns: PatternPair[];
  message: string;
}

export interface Experiment {
  id: string;
  user_id: string;
  title: string;
  hypothesis: string;
  target_metric: string;
  status: 'PLANNED' | 'BASELINE' | 'INTERVENTION' | 'ANALYSIS' | 'COMPLETED';
  created_at: string;
}

export interface ExperimentResult {
  sufficient_data: boolean;
  baseline_mean?: number;
  baseline_std?: number;
  baseline_n?: number;
  intervention_mean?: number;
  intervention_std?: number;
  intervention_n?: number;
  pct_change?: number;
  p_value?: number;
  explanation?: string;
  limitation_notice?: string;
  message?: string;
}

export interface SimulatorResponse {
  target_metric: string;
  predicted_value: number;
  baseline_value: number;
  predicted_change_pct: number;
  sample_size_used: number;
  model_type: string;
  r2_score: number;
  sufficient_data: boolean;
  message: string;
}

export interface DataSourceItem {
  provider_id: string;
  provider_name: string;
  connection_status: 'CONNECTED' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'REAUTH_REQUIRED' | 'DISCONNECTED';
  last_sync?: string;
  permissions: string[];
  error_message?: string;
}

export interface SystemHealth {
  database: string;
  analytics: string;
  ai_provider: string;
  status: string;
}
