from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.models import User, Experiment, ExperimentObservation
from app.schemas.schemas import ExperimentCreate, ExperimentResponse
from app.api.deps import get_current_user
from app.services.experiment_engine import create_experiment, compute_experiment_results

router = APIRouter()

@router.post("/", response_model=ExperimentResponse)
def new_experiment(
    payload: ExperimentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_experiment(db, current_user.id, payload)

@router.get("/", response_model=List[ExperimentResponse])
def get_user_experiments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exps = db.query(Experiment).filter(Experiment.user_id == current_user.id).order_by(Experiment.created_at.desc()).all()
    return exps

@router.get("/{exp_id}", response_model=ExperimentResponse)
def get_experiment_detail(
    exp_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experiment).filter(Experiment.id == exp_id, Experiment.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@router.post("/{exp_id}/observations")
def log_experiment_observation(
    exp_id: str,
    payload: Dict[str, Any], # phase, observation_date, metric_name, metric_value
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experiment).filter(Experiment.id == exp_id, Experiment.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    obs = ExperimentObservation(
        experiment_id=exp.id,
        phase=payload.get("phase", "BASELINE"),
        observation_date=payload.get("observation_date", ""),
        metric_name=exp.target_metric,
        metric_value=float(payload.get("metric_value", 0.0))
    )
    db.add(obs)
    exp.status = "INTERVENTION" if payload.get("phase") == "INTERVENTION" else "BASELINE"
    db.commit()

    return {"status": "Observation logged successfully", "observation_id": obs.id}

@router.get("/{exp_id}/results")
def get_experiment_results(
    exp_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experiment).filter(Experiment.id == exp_id, Experiment.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    res = compute_experiment_results(db, exp_id)
    if not res:
        return {
            "sufficient_data": False,
            "message": "Not enough observation data across Baseline and Intervention phases yet to calculate results."
        }
    return {
        "sufficient_data": True,
        "baseline_mean": res.baseline_mean,
        "baseline_std": res.baseline_std,
        "baseline_n": res.baseline_n,
        "intervention_mean": res.intervention_mean,
        "intervention_std": res.intervention_std,
        "intervention_n": res.intervention_n,
        "pct_change": res.pct_change,
        "p_value": res.p_value,
        "explanation": res.explanation,
        "limitation_notice": res.limitation_notice
    }
