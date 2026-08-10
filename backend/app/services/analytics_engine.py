import math
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.models import DailyLog
from app.schemas.schemas import PatternPair, FingerprintResponse
from app.core.config import settings

def rankdata(values: List[float]) -> List[float]:
    """Computes fractional ranks for a list of values."""
    n = len(values)
    sorted_indices = sorted(range(n), key=lambda i: values[i])
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j < n - 1 and values[sorted_indices[j]] == values[sorted_indices[j + 1]]:
            j += 1
        rank_val = (i + j + 2) / 2.0
        for k in range(i, j + 1):
            ranks[sorted_indices[k]] = rank_val
        i = j + 1
    return ranks

def pearsonr(x: List[float], y: List[float]) -> Tuple[float, float]:
    """Computes Pearson correlation coefficient r and approximate p-value."""
    n = len(x)
    if n <= 2:
        return 0.0, 1.0
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    cov = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
    var_x = sum((x[i] - mean_x) ** 2 for i in range(n))
    var_y = sum((y[i] - mean_y) ** 2 for i in range(n))
    if var_x == 0 or var_y == 0:
        return 0.0, 1.0
    r = cov / math.sqrt(var_x * var_y)
    r = max(-1.0, min(1.0, r))
    
    if abs(r) >= 0.9999:
        p_val = 0.0001
    else:
        t_stat = r * math.sqrt((n - 2) / (1 - r ** 2))
        p_val = 2 * (1 - 0.5 * (1 + math.erf(abs(t_stat) / math.sqrt(2))))
    return r, round(p_val, 4)

def spearmanr(x: List[float], y: List[float]) -> Tuple[float, float]:
    """Computes Spearman rank correlation coefficient rho and p-value."""
    rx = rankdata(x)
    ry = rankdata(y)
    return pearsonr(rx, ry)

def calculate_confidence_interval(r: float, n: int, confidence: float = 0.95) -> List[float]:
    """Calculates Fisher z-transformation confidence interval for Pearson correlation."""
    if n <= 3 or abs(r) >= 0.99999:
        return [round(r, 2), round(r, 2)]
    z = 0.5 * math.log((1 + r) / (1 - r))
    sigma = 1 / math.sqrt(n - 3)
    z_critical = 1.96
    low_z = z - z_critical * sigma
    high_z = z + z_critical * sigma
    low_r = math.tanh(low_z)
    high_r = math.tanh(high_z)
    return [round(low_r, 2), round(high_r, 2)]

def compute_user_behavioral_fingerprint(db: Session, user_id: str) -> FingerprintResponse:
    """
    Computes statistical behavioral correlations from actual user logs.
    Strictly enforces minimum sample size N >= 14 paired observations.
    """
    logs = db.query(DailyLog).filter(DailyLog.user_id == user_id).order_by(DailyLog.log_date.asc()).all()
    total_obs = len(logs)
    
    data_readiness_pct = min(100.0, round((total_obs / settings.MIN_CORRELATION_OBSERVATIONS) * 100.0, 1))
    
    if total_obs < settings.MIN_CORRELATION_OBSERVATIONS:
        return FingerprintResponse(
            total_observations=total_obs,
            data_readiness_pct=data_readiness_pct,
            sufficient_data=False,
            patterns=[],
            message=f"Not enough real data yet. You have recorded {total_obs} daily observations out of {settings.MIN_CORRELATION_OBSERVATIONS} required for reliable personal patterns."
        )

    # Extract metrics into columns
    metric_keys = ["sleep_duration", "sleep_quality", "screen_time", "study_work_duration", "exercise_duration", "social_duration", "mood", "energy", "focus", "productivity"]
    
    metric_data: Dict[str, List[float]] = {k: [] for k in metric_keys}
    
    for l in logs:
        metric_data["sleep_duration"].append(l.sleep_duration)
        metric_data["sleep_quality"].append(l.sleep_quality)
        metric_data["screen_time"].append(l.screen_time)
        metric_data["study_work_duration"].append(l.study_work_duration)
        metric_data["exercise_duration"].append(l.exercise_duration)
        metric_data["social_duration"].append(l.social_duration)
        metric_data["mood"].append(l.mood)
        metric_data["energy"].append(l.energy)
        metric_data["focus"].append(l.focus)
        metric_data["productivity"].append(l.productivity)

    patterns: List[PatternPair] = []
    
    valid_cols = [k for k, vals in metric_data.items() if len([v for v in vals if v is not None]) >= settings.MIN_CORRELATION_OBSERVATIONS]
    
    date_min = logs[0].log_date
    date_max = logs[-1].log_date
    date_range_str = f"{date_min} to {date_max}"

    for i in range(len(valid_cols)):
        for j in range(i + 1, len(valid_cols)):
            col_a = valid_cols[i]
            col_b = valid_cols[j]
            
            # Filter paired non-null observations
            paired_x = []
            paired_y = []
            for k in range(total_obs):
                va = metric_data[col_a][k]
                vb = metric_data[col_b][k]
                if va is not None and vb is not None:
                    paired_x.append(float(va))
                    paired_y.append(float(vb))
                    
            n_paired = len(paired_x)
            if n_paired >= settings.MIN_CORRELATION_OBSERVATIONS:
                # Calculate variance
                mean_x = sum(paired_x) / n_paired
                mean_y = sum(paired_y) / n_paired
                var_x = sum((vx - mean_x) ** 2 for vx in paired_x)
                var_y = sum((vy - mean_y) ** 2 for vy in paired_y)
                
                if var_x == 0 or var_y == 0:
                    continue
                    
                rho, p_val = spearmanr(paired_x, paired_y)
                rho = round(rho, 2)
                ci = calculate_confidence_interval(rho, n_paired)
                
                pattern = PatternPair(
                    metric_a=col_a,
                    metric_b=col_b,
                    coefficient=rho,
                    sample_size=n_paired,
                    p_value=p_val,
                    confidence_interval=ci,
                    date_range=date_range_str,
                    is_statistically_significant=(p_val < 0.05),
                    limitation_notice="Association does not imply causation. Personal correlation based on real observations."
                )
                patterns.append(pattern)

    patterns.sort(key=lambda p: abs(p.coefficient), reverse=True)

    return FingerprintResponse(
        total_observations=total_obs,
        data_readiness_pct=100.0 if total_obs >= settings.MIN_CORRELATION_OBSERVATIONS else data_readiness_pct,
        sufficient_data=True,
        patterns=patterns,
        message=f"Identified {len(patterns)} personal behavioral pattern associations from {total_obs} real observations."
    )
