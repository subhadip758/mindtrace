# 🧠 MindTrace — Real-Data AI Behavioral Intelligence Platform

> **“Don’t let AI tell you who you are. Let it help you discover your patterns.”**

MindTrace is a production-quality, real-data AI behavioral intelligence platform that allows users to discover statistical associations between everyday lifestyle habits (sleep, screen time, exercise, study) and subjective wellbeing (mood, energy, focus, productivity), conduct real N-of-1 behavioral experiments, analyze journal reflections with explainable AI, and retain 100% control over personal data privacy.

---

## 🌟 Key Features

1. **Strict Real-Data Guarantee**: Database starts empty. No synthetic statistics or fake scores. If data is insufficient, it explicitly communicates *"Not enough real data yet"*.
2. **Behavioral Fingerprint & Personal Network Graph**: Computes pairwise Spearman rank correlation matrices (ρ), sample sizes ($N$), p-values, 95% confidence intervals, and interactive SVG relationship graphs.
3. **Behavioral Experiment Lab (N-of-1)**: Compare Baseline vs Intervention phases with mean ± std dev, percentage changes, and t-tests.
4. **What-If Personal ML Simulator**: Fitted Ridge Regression model predicting metric shifts based on hypothetical habit changes.
5. **AI Journal Signal Extraction**: Structured JSON extraction of cognitive themes, emotional signals, and behavioral signals without diagnostic claims.
6. **Data Provenance**: Every metric log retains source metadata (`manual`, `health_connect`, `apple_health`, `google_fit`).
7. **Privacy & Data Ownership**: Instant JSON export and permanent account deletion (GDPR).

---

## 🚀 Quick Start

### 1. Run Backend Server (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Run Frontend Web App (Vite + React + TS)
```bash
cd frontend
npm install
npm run dev
```
Open application at: [http://localhost:3000](http://localhost:3000)

### 3. Run Backend Test Suite
```bash
cd backend
python -m pytest tests/test_backend.py
```

---

## 📚 Complete Technical Documentation

- [docs/Architecture.md](file:///c:/Users/Subhadip/Downloads/psychology/docs/Architecture.md)
- [docs/MVP_Tech_Doc.md](file:///c:/Users/Subhadip/Downloads/psychology/docs/MVP_Tech_Doc.md)
- [docs/PRD.md](file:///c:/Users/Subhadip/Downloads/psychology/docs/PRD.md)
- [docs/System_Design.md](file:///c:/Users/Subhadip/Downloads/psychology/docs/System_Design.md)
- [docs/API.md](file:///c:/Users/Subhadip/Downloads/psychology/docs/API.md)
- [docs/DATA_MODEL.md](file:///c:/Users/Subhadip/Downloads/psychology/docs/DATA_MODEL.md)
- [docs/SECURITY.md](file:///c:/Users/Subhadip/Downloads/psychology/docs/SECURITY.md)
