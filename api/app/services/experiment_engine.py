import math
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.models import Experiment, ExperimentObservation, ExperimentResult, DailyLog
from app.schemas.schemas import ExperimentCreate

def mean_and_std(values: List[float]) -> tuple[float, float]:
    n = len(values)
    if n == 0:
        return 0.0, 0.0
    m = sum(values) / n
    if n == 1:
        return m, 0.0
    var = sum((x - m) ** 2 for x in values) / (n - 1)
    return m, math.sqrt(var)

def welch_ttest(sample1: List[float], sample2: List[float]) -> float:
    """Computes Welch's t-test p-value approximation."""
    n1, n2 = len(sample1), len(sample2)
    m1, s1 = mean_and_std(sample1)
    m2, s2 = mean_and_std(sample2)
    
    if n1 < 2 or n2 < 2 or (s1 == 0 and s2 == 0):
        return 1.0
        
    se1 = (s1 ** 2) / n1
    se2 = (s2 ** 2) / n2
    se_diff = math.sqrt(se1 + se2)
    
    if se_diff == 0:
        return 1.0
        
    t_stat = (m1 - m2) / se_diff
    # Normal approximation p-value
    p_val = 2 * (1 - 0.5 * (1 + math.erf(abs(t_stat) / math.sqrt(2))))
    return round(p_val, 4)

def create_experiment(db: Session, user_id: str, payload: ExperimentCreate) -> Experiment:
    exp = Experiment(
        user_id=user_id,
        title=payload.title,
        hypothesis=payload.hypothesis,
        target_metric=payload.target_metric,
        status="PLANNED"
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

def compute_experiment_results(db: Session, experiment_id: str) -> Optional[ExperimentResult]:
    """
    Computes statistical comparison between Baseline and Intervention observations for an experiment.
    Uses real paired observation values.
    """
    exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
    if not exp:
        return None
        
    obs_baseline = db.query(ExperimentObservation).filter(
        ExperimentObservation.experiment_id == experiment_id,
        ExperimentObservation.phase == "BASELINE"
    ).all()
    
    obs_intervention = db.query(ExperimentObservation).filter(
        ExperimentObservation.experiment_id == experiment_id,
        ExperimentObservation.phase == "INTERVENTION"
    ).all()
    
    b_vals = [o.metric_value for o in obs_baseline]
    i_vals = [o.metric_value for o in obs_intervention]
    
    b_n = len(b_vals)
    i_n = len(i_vals)
    
    if b_n == 0 or i_n == 0:
        return None
        
    b_mean, b_std = mean_and_std(b_vals)
    i_mean, i_std = mean_and_std(i_vals)
    
    pct_change = ((i_mean - b_mean) / b_mean * 100.0) if b_mean != 0 else 0.0
    
    p_val = welch_ttest(b_vals, i_vals) if (b_n >= 2 and i_n >= 2) else None
    
    direction = "higher" if i_mean > b_mean else ("lower" if i_mean < b_mean else "changed")
    explanation = f"During the intervention phase ({i_n} observations), average reported {exp.target_metric} was {round(i_mean, 2)} ± {round(i_std, 2)}, compared to baseline ({b_n} observations) of {round(b_mean, 2)} ± {round(b_std, 2)} ({round(pct_change, 1)}% {direction})."
    limitation = "Results describe observed differences during this experiment period. External confounding factors may have contributed to changes."
    
    res = db.query(ExperimentResult).filter(ExperimentResult.experiment_id == experiment_id).first()
    if not res:
        res = ExperimentResult(experiment_id=experiment_id)
        
    res.baseline_mean = round(b_mean, 2)
    res.baseline_std = round(b_std, 2)
    res.baseline_n = b_n
    res.intervention_mean = round(i_mean, 2)
    res.intervention_std = round(i_std, 2)
    res.intervention_n = i_n
    res.pct_change = round(pct_change, 1)
    res.p_value = p_val
    res.explanation = explanation
    res.limitation_notice = limitation
    
    db.add(res)
    db.commit()
    db.refresh(res)
    return res
