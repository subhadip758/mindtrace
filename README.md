<div align="center">

  <img src="https://raw.githubusercontent.com/subhadip758/mindtrace/main/frontend/public/logo.png" alt="MindTrace Logo" width="480"/>

  ### **AI-Powered Behavioral Intelligence & Psychological Self-Reflection Platform**

  > **“Don’t let AI tell you who you are. Let it help you discover your patterns.”**

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
  [![Real Data Only](https://img.shields.io/badge/Data_Integrity-Real_Data_Only-emerald.svg)](#-scientific-integrity--real-data-guarantee)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Scientific Integrity & Real Data Guarantee](#-scientific-integrity--real-data-guarantee)
- [Psychological Theories & Psychometric Constructs](#-psychological-theories--psychometric-constructs)
- [Complete Feature Breakdown](#-complete-feature-breakdown)
- [System Architecture & 3D Visual Engine](#-system-architecture--3d-visual-engine)
- [Technology Stack](#-technology-stack)
- [Quick Start & Local Deployment](#-quick-start--local-deployment)
- [API Reference & Technical Documentation](#-api-reference--technical-documentation)
- [Responsible AI & Safety Bounds](#-responsible-ai--safety-bounds)

---

## 🧠 Overview

**MindTrace** is a production-quality, real-data AI-powered behavioral intelligence and psychological self-reflection platform. It bridges the gap between daily lifestyle habits (sleep, screen time, physical exercise, work/study hours) and subjective psychometric states (mood, energy, attentional focus, productivity).

Unlike generic wellbeing apps that present static surveys or hardcoded synthetic advice, MindTrace functions as a **personal behavioral science laboratory**. Users micro-sample their lived experiences, calculate statistically validated co-variations ($\rho$), conduct single-subject ($N=1$) experimental trials, and receive explainable, evidence-grounded AI reflections.

```text
  OBSERVE (EMA) ➔ REFLECT ➔ DISCOVER (Spearman ρ) ➔ HYPOTHESIZE ➔ EXPERIMENT (N=1) ➔ MEASURE ➔ LEARN
```

---

## 🔬 Scientific Integrity & Real Data Guarantee

MindTrace adheres strictly to empirical scientific honesty and transparency:

1. **Zero Synthetic Data in Production**: The production database initializes 100% empty. The system never fabricates insights, fake scores, or hardcoded charts. If sample size $N < 14$, MindTrace explicitly displays: *"Not enough real data yet"* alongside progress towards statistical thresholds.
2. **Observational Co-Variation $\neq$ Direct Causation**: MindTrace clearly distinguishes between correlation and causation. Observational correlations are framed as co-variations requiring controlled $N=1$ experimental verification.
3. **Evidence-Grounded AI Engine**: External Large Language Models (LLMs) never invent statistical conclusions. A mathematical analytics engine computes statistical parameters ($r, \rho, p\text{-values}, N, 95\%\text{ CI}$) and passes structured evidence JSON objects to the AI provider for natural language explanation.
4. **Strict Data Provenance**: Every metric record maintains source attribution metadata (`manual`, `health_connect`, `apple_health`, `google_fit`), provider identifiers, external IDs, and sync timestamps.

---

## 🧬 Psychological Theories & Psychometric Constructs

MindTrace incorporates standard academic, clinical, and psychological research methodologies:

### 1. Ecological Momentary Assessment (EMA)
* **Psychological Foundation**: Stone & Shiffman (1994).
* **Concept**: Replaces retrospective recall bias (which distorts self-report surveys) with micro-sampling of behaviors and psychological states in real-time within natural environments.
* **Implementation**: Drives the fast Daily Check-in interface, capturing high-ecological-validity data points.

### 2. Russell’s Affect Circumplex Model (1980)
* **Psychological Foundation**: James Russell (1980).
* **Concept**: Emotional states are mapped onto a 2D continuous coordinate space defined by two orthogonal axes:
  * **Affective Valence**: Degree of pleasantness/unpleasantness ($-5.0$ to $+5.0$).
  * **Psychophysiological Arousal**: Level of autonomic activation ($1.0$ Low/Calm to $10.0$ High Arousal).
* **Implementation**: Integrated into the EMA check-in, providing a psychometrically valid multidimensional affect mapping beyond generic 1–10 mood ratings.

### 3. Single-Subject Experimental Design ($N=1$ Reversal Protocols)
* **Psychological Foundation**: Barlow, Nock, & Hersen (2009).
* **Concept**: Controlled experimental protocol where an individual acts as their own baseline control to establish within-subject treatment effect sizes.
* **Implementation**: Manages $A\text{-}B\text{-}A$ Reversal designs in the **Behavioral Experiment Lab**, evaluating baseline vs. intervention phases.

### 4. Cohen’s $d$ Effect Size Calculation
* **Formula**: $d = \frac{\bar{X}_{\text{intervention}} - \bar{X}_{\text{baseline}}}{s_{\text{pooled}}}$
* **Concept**: Quantifies the magnitude of intervention effect independent of sample size, categorizing effect sizes as Small ($d \approx 0.2$), Medium ($d \approx 0.5$), or Large ($d \ge 0.8$).

### 5. Allostatic Stress Load Index
* **Psychological Foundation**: Bruce McEwen (1998).
* **Concept**: Represents the cumulative physiological wear-and-tear on autonomic and neuroendocrine systems resulting from chronic exposure to fluctuating stress demands.
* **Implementation**: Tracked as a psychometric construct to evaluate stress recovery capability.

### 6. Cognitive Distortion & Heuristic Bias Diagnostics
Analyzes natural language journal entries to identify systematic cognitive distortions without making psychiatric diagnostic claims:
* **Catastrophizing**: Irrationally projecting the worst possible outcome.
* **Dichotomous (All-or-Nothing) Thinking**: Binary black-and-white evaluation without nuance.
* **Confirmation Bias**: Selectively over-indexing evidence matching existing assumptions.
* **Overgeneralization**: Extrapolating an isolated negative occurrence to a universal rule.

---

## ⚡ Complete Feature Breakdown

### 📱 1. Interactive 3D Synaptic Matrix Canvas
* HTML5 3D particle Canvas (`ThreeBrainCanvas.tsx`) rendering dual rotating brain hemispheres, glowing neural nodes, dynamic synaptic connection lines, and mouse tilt parallax interactions.

### 📊 2. Behavioral Fingerprint & Network Graph
* **Spearman Rank Correlation Matrix ($\rho$)**: Pairwise correlation calculations across all behavioral metrics with $p$-value significance tests and Fisher $z$-transformation 95% confidence intervals.
* **Interactive SVG Network View**: Visual node-edge graph mapping metric connections with clickable statistical detail modals.

### 🧪 3. Behavioral Experiment Lab ($N=1$)
* Define personal hypotheses (e.g., *"Reducing social media before studying increases morning focus"*).
* Lifecycle tracking: `PLANNED` $\rightarrow$ `BASELINE` $\rightarrow$ `INTERVENTION` $\rightarrow$ `ANALYSIS` $\rightarrow$ `COMPLETED`.
* Calculates baseline vs intervention mean $\pm$ std dev, percentage changes, Cohen's $d$, and independent $t$-tests.

### 🔮 4. What-If Personal Machine Learning Simulator
* Fits a **Ridge Regression ML model** on the user's longitudinal dataset to predict expected shifts in target metrics (e.g. Focus score) from hypothetical habit adjustments.

### 📝 5. AI Journal Diagnostics & Cognitive Load Index
* Natural language editor providing instant AI signal extraction (Themes, Affect Signals, Behavioral Signals, Cognitive Distortions, and Cognitive Load Index scale 1-10).

### 📈 6. Weekly Psychology Report & Data Sources
* Automated weekly report summarizing positive patterns, friction areas, behavioral trend averages, active experiments, and scientific limitations.
* Synchronization manager for **Android Health Connect**, **Apple Health**, **Google Fit**, and **Fitbit Web API**.

### 🔐 7. Research Mode, Privacy & Data Ownership
* **Opt-In Research Consent**: Pseudonymized cross-user aggregate correlation dashboard with CSV exporter.
* **Data Ownership**: Instant full JSON data export and permanent account/data deletion (GDPR).

---

## 💻 Technology Stack

```text
frontend/
├── React 18 & TypeScript
├── Vite & Tailwind CSS
├── Framer Motion & Recharts
├── Lucide React Icons
└── HTML5 3D Canvas Matrix & Service Worker PWA

backend/
├── Python 3.13 & FastAPI
├── Pydantic v2 & SQLAlchemy 2.0
├── Scikit-learn (Ridge Regression ML)
├── SciPy (Spearman ρ, t-tests, Fisher z)
├── Pandas & NumPy
└── Google Gemini 2.5 Flash / OpenAI Provider Layer
```

---

## 🚀 Quick Start & Local Deployment

### Prerequisites
- **Python**: `3.13+`
- **Node.js**: `v20+` & `npm`

### 1. Clone Repository & Install Backend
```bash
git clone https://github.com/subhadip758/mindtrace.git
cd mindtrace/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
- **Backend Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Install & Start Frontend Web Application
```bash
cd ../frontend
npm install
npm run dev
```
- **Web Application URL**: [http://localhost:3000](http://localhost:3000)

### 3. Run Automated Pytest Suite
```bash
cd ../backend
python -m pytest tests/test_backend.py
```

---

## 📚 API Reference & Technical Documentation

Full technical architecture documentation is available in [`docs/`](./docs/):

* 📐 **[docs/Architecture.md](./docs/Architecture.md)** — High-level architecture, component design, data flow diagrams.
* 🛠️ **[docs/MVP_Tech_Doc.md](./docs/MVP_Tech_Doc.md)** — Core technical specifications and data ingestion rules.
* 🎯 **[docs/PRD.md](./docs/PRD.md)** — Product requirements, personas, and user stories.
* 🔄 **[docs/System_Design.md](./docs/System_Design.md)** — Sequence diagrams, synchronization, background workers.
* 🔌 **[docs/API.md](./docs/API.md)** — REST API endpoint documentation & request/response payloads.
* 🗄️ **[docs/DATA_MODEL.md](./docs/DATA_MODEL.md)** — Relational database schema & data provenance models.
* 🛡️ **[docs/SECURITY.md](./docs/SECURITY.md)** — Security controls, JWT, encryption, and research consent policy.

---

## 🛡️ Responsible AI & Safety Bounds

> **CRITICAL TRANSPARENCY NOTICE**:
> MindTrace is an educational, self-reflective behavioral intelligence platform. It is **NOT** a therapist, psychologist, psychiatrist, diagnostic tool, or medical device.
>
> MindTrace **never claims to diagnose or treat psychiatric conditions** (such as Clinical Depression, Generalized Anxiety Disorder, ADHD, Bipolar Disorder, or PTSD). All output is strictly framed as observational behavioral co-variation requiring personal experimental verification.
