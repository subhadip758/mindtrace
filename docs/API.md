# MindTrace REST API Reference

All API routes are prefixed with `/api/v1`. Authenticated routes require a standard `Authorization: Bearer <token>` header.

---

## Authentication Endpoints

### `POST /auth/register`
Creates a new user account and empty profile.
- **Request Payload**:
  ```json
  { "email": "user@example.com", "password": "securepassword" }
  ```
- **Response**: JWT Token object (`access_token`, `user_id`, `email`).

### `POST /auth/login`
Authenticates existing credentials.
- **Response**: JWT Token object.

### `GET /auth/me`
Retrieves current user profile information.

### `PUT /auth/onboarding`
Updates user goals, nickname, baseline schedules, and sets `onboarding_completed = true`.

---

## Daily Check-In Endpoints

### `POST /daily-checkin/`
Creates or updates today's behavioral check-in. Validates ranges and records data provenance.
- **Request Payload**:
  ```json
  {
    "log_date": "2026-08-10",
    "mood": 8.0,
    "energy": 7.0,
    "focus": 8.5,
    "productivity": 7.5,
    "sleep_duration": 8.0,
    "sleep_quality": 8.0,
    "screen_time": 3.5,
    "study_work_duration": 6.5,
    "exercise_duration": 45.0,
    "social_duration": 30.0,
    "custom_habits": { "meditation": 15 }
  }
  ```

### `GET /daily-checkin/`
Retrieves list of past check-in records (`limit` parameter up to 365).

---

## Behavioral Fingerprint & Analytics Endpoints

### `GET /patterns/fingerprint`
Computes pairwise Spearman correlations, p-values, 95% confidence intervals, and data readiness metrics.

### `POST /patterns/explain`
Passes evidence object to AI provider for natural language explanation.

---

## Behavioral Experiment Lab Endpoints

### `POST /experiments/`
Creates a new N-of-1 experiment with title, hypothesis, and target metric.

### `POST /experiments/{id}/observations`
Logs an observation for BASELINE or INTERVENTION phase.

### `GET /experiments/{id}/results`
Computes statistical baseline vs intervention mean difference, percentage change, and p-values.

---

## What-If Simulator Endpoints

### `POST /simulator/`
Fits Ridge Regression model on user logs to simulate metric changes.

---

## Data Sources & Research Endpoints

### `GET /data-sources/`
Lists status of Health Connect, Apple Health, Google Fit, and Fitbit APIs.

### `GET /research/dashboard`
Returns pseudonymized aggregate statistics across opted-in users.

### `GET /privacy/export`
Exports user's entire dataset as structured JSON.

### `DELETE /privacy/account`
Permanently erases user account and all personal logs.
