import numpy as np
import pandas as pd
from scipy import stats
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import DailyLog, Insight
from app.schemas.schemas import PatternPair, FingerprintResponse
from app.core.config import settings

METRIC_LABELS = {
    "sleep_duration": "Sleep Duration (hrs)",
    "sleep_quality": "Sleep Quality (1-10)",
    "screen_time": "Screen Time (hrs)",
    "study_work_duration": "Study/Work Hours",
    "exercise_duration": "Exercise (mins)",
    "social_duration": "Social Interaction (mins)",
    "mood": "Reported Mood (1-10)",
    "energy": "Reported Energy (1-10)",
    "focus": "Reported Focus (1-10)",
    "productivity": "Reported Productivity (1-10)",
}

def calculate_confidence_interval(r: float, n: int, confidence: float = 0.95) -> List[float]:
    """Calculates Fisher z-transformation confidence interval for Pearson correlation."""
    if n <= 3 or abs(r) >= 0.99999:
        return [round(r, 2), round(r, 2)]
    z = np.arctanh(r)
    sigma = 1 / np.sqrt(n - 3)
    z_critical = stats.norm.ppf((1 + confidence) / 2)
    low_z = z - z_critical * sigma
    high_z = z + z_critical * sigma
    low_r = float(np.tanh(low_z))
    high_r = float(np.tanh(high_z))
    return [round(low_r, 2), round(high_r, 2)]

def compute_user_behavioral_fingerprint(db: Session, user_id: str) -> FingerprintResponse:
    """
    Computes statistical behavioral correlations from actual user logs.
    Strictly enforces minimum sample size N >= 14 paired observations.
    """
    logs = db.query(DailyLog).filter(DailyLog.user_id == user_id).order_by(DailyLog.log_date.asc()).all()
    total_obs = len(logs)
    
    # Calculate Data Readiness Percentage (e.g. 14 minimum baseline)
    data_readiness_pct = min(100.0, round((total_obs / settings.MIN_CORRELATION_OBSERVATIONS) * 100.0, 1))
    
    if total_obs < settings.MIN_CORRELATION_OBSERVATIONS:
        return FingerprintResponse(
            total_observations=total_obs,
            data_readiness_pct=data_readiness_pct,
            sufficient_data=False,
            patterns=[],
            message=f"Not enough real data yet. You have recorded {total_obs} daily observations out of {settings.MIN_CORRELATION_OBSERVATIONS} required for reliable personal patterns."
        )

    # Build DataFrame from logs
    data = []
    for l in logs:
        row = {
            "sleep_duration": l.sleep_duration,
            "sleep_quality": l.sleep_quality,
            "screen_time": l.screen_time,
            "study_work_duration": l.study_work_duration,
            "exercise_duration": l.exercise_duration,
            "social_duration": l.social_duration,
            "mood": l.mood,
            "energy": l.energy,
            "focus": l.focus,
            "productivity": l.productivity,
        }
        # Add custom habits
        if isinstance(l.custom_habits, dict):
            for k, v in l.custom_habits.items():
                row[f"custom_{k}"] = v
        data.append(row)

    df = pd.DataFrame(data)
    
    patterns: List[PatternPair] = []
    
    metric_cols = [c for c in df.columns if df[c].notna().sum() >= settings.MIN_CORRELATION_OBSERVATIONS]
    
    if len(metric_cols) < 2:
        return FingerprintResponse(
            total_observations=total_obs,
            data_readiness_pct=data_readiness_pct,
            sufficient_data=False,
            patterns=[],
            message=f"Not enough paired metric data across logs yet. Keep tracking to reach {settings.MIN_CORRELATION_OBSERVATIONS} observations per habit metric."
        )

    date_min = logs[0].log_date
    date_max = logs[-1].log_date
    date_range_str = f"{date_min} to {date_max}"

    # Pairwise correlation analysis
    for i in range(len(metric_cols)):
        for j in range(i + 1, len(metric_cols)):
            col_a = metric_cols[i]
            col_b = metric_cols[j]
            
            valid_df = df[[col_a, col_b]].dropna()
            n_paired = len(valid_df)
            
            if n_paired >= settings.MIN_CORRELATION_OBSERVATIONS:
                x = valid_df[col_a].values
                y = valid_df[col_b].values
                
                # Check for zero variance
                if np.std(x) == 0 or np.std(y) == 0:
                    continue
                    
                # Spearman rank correlation
                rho, p_val = stats.spearmanr(x, y)
                if np.isnan(rho):
                    continue
                    
                rho = round(float(rho), 2)
                p_val = round(float(p_val), 4) if not np.isnan(p_val) else None
                ci = calculate_confidence_interval(rho, n_paired)
                
                pattern = PatternPair(
                    metric_a=col_a,
                    metric_b=col_b,
                    coefficient=rho,
                    sample_size=n_paired,
                    p_value=p_val,
                    confidence_interval=ci,
                    date_range=date_range_str,
                    is_statistically_significant=(p_val < 0.05) if p_val is not None else False,
                    limitation_notice="Association does not imply causation. Personal correlation based on real observations."
                )
                patterns.append(pattern)

    # Sort patterns by strongest absolute correlation
    patterns.sort(key=lambda p: abs(p.coefficient), reverse=True)

    return FingerprintResponse(
        total_observations=total_obs,
        data_readiness_pct=100.0 if total_obs >= settings.MIN_CORRELATION_OBSERVATIONS else data_readiness_pct,
        sufficient_data=True,
        patterns=patterns,
        message=f"Identified {len(patterns)} personal behavioral pattern associations from {total_obs} real observations."
    )
