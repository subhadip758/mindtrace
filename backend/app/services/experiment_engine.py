import numpy as np
from scipy import stats
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Experiment, ExperimentObservation, ExperimentResult, DailyLog
from app.schemas.schemas import ExperimentCreate

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
        # Not enough observation pairs across both phases yet
        return None
        
    b_mean = float(np.mean(b_vals))
    b_std = float(np.std(b_vals, ddof=1)) if b_n > 1 else 0.0
    
    i_mean = float(np.mean(i_vals))
    i_std = float(np.std(i_vals, ddof=1)) if i_n > 1 else 0.0
    
    pct_change = ((i_mean - b_mean) / b_mean * 100.0) if b_mean != 0 else 0.0
    
    p_val = None
    if b_n >= 3 and i_n >= 3:
        t_stat, p_val = stats.ttest_ind(b_vals, i_vals, equal_var=False)
        p_val = float(p_val) if not np.isnan(p_val) else None
        
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
    res.p_value = round(p_val, 4) if p_val is not None else None
    res.explanation = explanation
    res.limitation_notice = limitation
    
    db.add(res)
    db.commit()
    db.refresh(res)
    return res
