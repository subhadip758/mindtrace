import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score
from sqlalchemy.orm import Session
from app.models.models import DailyLog
from app.schemas.schemas import SimulatorRequest, SimulatorResponse
from app.core.config import settings

def run_what_if_simulation(db: Session, user_id: str, request: SimulatorRequest) -> SimulatorResponse:
    """
    Trains a Ridge regression model on the user's actual historical daily logs to simulate
    expected changes in a target metric (e.g., focus, mood, productivity).
    """
    logs = db.query(DailyLog).filter(DailyLog.user_id == user_id).order_by(DailyLog.log_date.asc()).all()
    n_logs = len(logs)
    
    if n_logs < settings.MIN_CORRELATION_OBSERVATIONS:
        return SimulatorResponse(
            target_metric=request.target_metric,
            predicted_value=0.0,
            baseline_value=0.0,
            predicted_change_pct=0.0,
            sample_size_used=n_logs,
            model_type="None",
            r2_score=0.0,
            sufficient_data=False,
            message=f"Simulation unavailable. Requires at least {settings.MIN_CORRELATION_OBSERVATIONS} personal daily observations (you currently have {n_logs})."
        )
        
    data = []
    for l in logs:
        row = {
            "sleep_duration": l.sleep_duration or 0.0,
            "sleep_quality": l.sleep_quality or 0.0,
            "screen_time": l.screen_time or 0.0,
            "study_work_duration": l.study_work_duration or 0.0,
            "exercise_duration": l.exercise_duration or 0.0,
            "social_duration": l.social_duration or 0.0,
            "mood": l.mood or 0.0,
            "energy": l.energy or 0.0,
            "focus": l.focus or 0.0,
            "productivity": l.productivity or 0.0,
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    
    if request.target_metric not in df.columns:
        return SimulatorResponse(
            target_metric=request.target_metric,
            predicted_value=0.0,
            baseline_value=0.0,
            predicted_change_pct=0.0,
            sample_size_used=n_logs,
            model_type="None",
            r2_score=0.0,
            sufficient_data=False,
            message=f"Target metric '{request.target_metric}' not found in user log features."
        )

    # Prepare features X and target y
    y = df[request.target_metric].values
    feature_cols = [c for c in df.columns if c != request.target_metric]
    X = df[feature_cols].values
    
    baseline_value = float(np.mean(y))
    
    # Train Ridge regression model
    model = Ridge(alpha=1.0)
    model.fit(X, y)
    preds = model.predict(X)
    score = float(r2_score(y, preds)) if len(y) > 1 else 0.0
    
    # Build feature vector for simulation
    # Start with mean values of current history
    input_vector = df[feature_cols].mean().values.copy()
    
    # Apply requested adjustments
    for feat, adj in request.feature_adjustments.items():
        if feat in feature_cols:
            idx = feature_cols.index(feat)
            input_vector[idx] = max(0.0, float(adj))
            
    simulated_pred = float(model.predict([input_vector])[0])
    
    # Clamp simulated prediction to standard 1-10 or non-negative ranges
    if request.target_metric in ["mood", "energy", "focus", "productivity", "sleep_quality"]:
        simulated_pred = max(1.0, min(10.0, simulated_pred))
    else:
        simulated_pred = max(0.0, simulated_pred)
        
    pct_change = ((simulated_pred - baseline_value) / baseline_value * 100.0) if baseline_value > 0 else 0.0
    
    return SimulatorResponse(
        target_metric=request.target_metric,
        predicted_value=round(simulated_pred, 2),
        baseline_value=round(baseline_value, 2),
        predicted_change_pct=round(pct_change, 1),
        sample_size_used=n_logs,
        model_type="Ridge Regression (Linear ML)",
        r2_score=round(score, 3),
        sufficient_data=True,
        message=f"Simulation computed based on {n_logs} personal observation records."
    )
