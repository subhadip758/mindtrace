# MindTrace MVP Technical Document

## 1. Objective
Build a production-grade behavioral self-reflection platform powered by real data, statistical correlations (Pearson / Spearman), N-of-1 behavioral experiments, and explainable AI.

---

## 2. Technical Stack Specifications

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Service Worker PWA.
- **Backend**: Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0, Jose JWT.
- **Database**: PostgreSQL (production) / SQLite (development & portable testing).
- **Data Science Engine**: NumPy, Pandas, SciPy (`scipy.stats`), Scikit-learn (`Ridge` Regression ML).
- **AI Integration**: Gemini 2.5 Flash / OpenAI Provider abstraction with fallback rule-based natural language parser.

---

## 3. Key Technical Modules

1. **Daily Check-In & Validation Engine**: Validates inputs against realistic physical bounds (e.g. sleep duration $0-24$ hrs, mood $1-10$), flagging outliers without corrupting user logs.
2. **Behavioral Fingerprint Engine**: Pairwise Spearman rank correlation matrix calculation with 95% confidence intervals and p-value significance tests.
3. **Behavioral Experiment Lab**: Tracks Baseline vs Intervention phases, calculating percentage changes and mean differences with standard deviations.
4. **What-If Simulator**: Fits Ridge Regression model on user logs to predict expected changes in target metrics.
5. **Research & Privacy Center**: Pseudonymizes user data for research opt-in, allows instant JSON data export, and permanent GDPR account deletion.
