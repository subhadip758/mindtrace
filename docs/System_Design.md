# MindTrace System Design Document

## 1. Sequence Diagram: Data Logging & Analytics Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant PWA as React Frontend
    participant API as FastAPI Backend
    participant DB as Database (PostgreSQL/SQLite)
    participant Engine as Analytics Engine
    participant AI as AI Provider

    User->>PWA: Submits Daily Check-In (Mood, Sleep, Focus, Screen Time)
    PWA->>API: POST /api/v1/daily-checkin/
    API->>API: Validate ranges & create Data Provenance
    API->>DB: Store DailyLog & DataProvenance
    DB-->>API: Confirm stored
    API-->>PWA: Return saved log record

    User->>PWA: Views Behavioral Fingerprint
    PWA->>API: GET /api/v1/patterns/fingerprint
    API->>DB: Fetch user logs
    API->>Engine: Calculate Spearman ρ & Sample Size (N)
    alt N < 14
        Engine-->>API: Return "Insufficient Data"
    else N >= 14
        Engine-->>API: Return Correlation Matrix & Evidence
    end
    API-->>PWA: Render Behavioral Graph & Matrix
```

---

## 2. Background Workers & Synchronization
- Health Connect & Wearable OAuth APIs run periodic sync jobs updating `sync_jobs` table.
- Provenance engine tags incoming wearable records with `source_type="health_connect"`.
