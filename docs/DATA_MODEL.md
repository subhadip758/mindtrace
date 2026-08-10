# MindTrace Database Data Model Reference

All primary keys use 36-character UUID string identifiers.

---

## Database Tables

### 1. `users`
- `id` (VARCHAR(36), PK)
- `email` (VARCHAR(255), UNIQUE, INDEX)
- `hashed_password` (VARCHAR(255))
- `is_active` (BOOLEAN)
- `created_at` (DATETIME)

### 2. `profiles`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> users.id, UNIQUE)
- `nickname` (VARCHAR(100))
- `age_range` (VARCHAR(50))
- `primary_goals` (JSON)
- `sleep_schedule` (VARCHAR(100))
- `work_schedule` (VARCHAR(100))
- `custom_metrics_schema` (JSON)
- `onboarding_completed` (BOOLEAN)

### 3. `daily_logs`
- `id` (VARCHAR(36), PK)
- `user_id` (VARCHAR(36), FK -> users.id, INDEX)
- `log_date` (VARCHAR(10), INDEX) - YYYY-MM-DD
- `mood` (FLOAT, 1-10)
- `energy` (FLOAT, 1-10)
- `focus` (FLOAT, 1-10)
- `productivity` (FLOAT, 1-10)
- `sleep_duration` (FLOAT, hours)
- `sleep_quality` (FLOAT, 1-10)
- `screen_time` (FLOAT, hours)
- `study_work_duration` (FLOAT, hours)
- `exercise_duration` (FLOAT, mins)
- `social_duration` (FLOAT, mins)
- `custom_habits` (JSON)

### 4. `journal_entries` & `journal_analysis`
- `content` (TEXT)
- `mood_tags`, `activity_tags` (JSON)
- `analysis`: `themes`, `emotional_signals`, `behavioral_signals`, `confidence`, `summary`, `safety_flag`.

### 5. `experiments`, `experiment_observations`, `experiment_results`
- Baseline vs Intervention comparison statistics (`baseline_mean`, `intervention_mean`, `pct_change`, `p_value`).

### 6. `data_provenance`
- `daily_log_id` (FK -> daily_logs.id)
- `metric_name` (VARCHAR(100))
- `value` (FLOAT)
- `source_type` ("manual", "health_connect", "wearable")
- `source_provider` ("MindTrace App", "Android Health Connect")
- `external_record_id`, `sync_timestamp`

### 7. `data_sources`, `sync_jobs`, `research_consents`
