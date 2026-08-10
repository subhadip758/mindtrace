from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import numpy as np
from app.core.database import get_db
from app.models.models import User, DailyLog, Experiment
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/weekly")
def get_weekly_psychology_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(DailyLog).filter(DailyLog.user_id == current_user.id).order_by(DailyLog.log_date.desc()).limit(14).all()
    n_logs = len(logs)
    
    if n_logs == 0:
        return {
            "sufficient_data": False,
            "message": "No real observations recorded yet. Complete your daily check-in to build your behavioral report."
        }
        
    moods = [l.mood for l in logs if l.mood is not None]
    sleeps = [l.sleep_duration for l in logs if l.sleep_duration is not None]
    focuses = [l.focus for l in logs if l.focus is not None]
    
    avg_mood = round(float(np.mean(moods)), 1) if moods else None
    avg_sleep = round(float(np.mean(sleeps)), 1) if sleeps else None
    avg_focus = round(float(np.mean(focuses)), 1) if focuses else None
    
    experiments = db.query(Experiment).filter(Experiment.user_id == current_user.id).all()
    active_exp_titles = [e.title for e in experiments if e.status in ["BASELINE", "INTERVENTION"]]
    
    return {
        "sufficient_data": True,
        "observations_analyzed": n_logs,
        "date_window": f"Last {n_logs} check-in entries",
        "sections": {
            "positive_patterns": [
                f"Recorded an average sleep duration of {avg_sleep} hours across your last {len(sleeps)} sleep logs." if avg_sleep else "Consistent logging started."
            ],
            "possible_friction": [
                f"Reported focus score averaged {avg_focus}/10 over recent observations." if avg_focus else "Tracking baseline habits."
            ],
            "behavioral_trends": {
                "avg_mood": avg_mood,
                "avg_sleep_hours": avg_sleep,
                "avg_focus_score": avg_focus
            },
            "active_experiments": active_exp_titles,
            "suggested_experiment": "Try limiting evening screen time to evaluate impact on morning focus.",
            "data_quality": {
                "coverage_score": f"{round(n_logs/14*100)}%",
                "status": "High Quality" if n_logs >= 7 else "Building Baseline"
            },
            "scientific_limitation": "All report summaries are calculated directly from your self-reported logs. Correlation does not imply direct causation."
        }
    }
