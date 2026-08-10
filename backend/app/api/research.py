from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import pandas as pd
import numpy as np

from app.core.database import get_db
from app.models.models import User, ResearchConsent, DailyLog
from app.schemas.schemas import ResearchConsentSchema
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/consent")
def get_research_consent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consent = db.query(ResearchConsent).filter(ResearchConsent.user_id == current_user.id).first()
    if not consent:
        consent = ResearchConsent(user_id=current_user.id, opt_in=False)
        db.add(consent)
        db.commit()
        db.refresh(consent)
    return {"opt_in": consent.opt_in, "anonymized_id": consent.anonymized_id, "updated_at": consent.updated_at}

@router.post("/consent")
def update_research_consent(
    payload: ResearchConsentSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consent = db.query(ResearchConsent).filter(ResearchConsent.user_id == current_user.id).first()
    if not consent:
        consent = ResearchConsent(user_id=current_user.id)
        
    consent.opt_in = payload.opt_in
    if payload.opt_in:
        consent.consent_given_at = datetime.now(timezone.utc)
    consent.updated_at = datetime.now(timezone.utc)
    
    db.add(consent)
    db.commit()
    return {"status": "SUCCESS", "opt_in": consent.opt_in}

@router.get("/dashboard")
def get_research_dashboard(
    db: Session = Depends(get_db)
):
    """
    Returns aggregated cross-user research statistics across users who explicitly opted in.
    Protects user identity via pseudonymization & data minimization.
    """
    opt_in_users = db.query(ResearchConsent).filter(ResearchConsent.opt_in == True).all()
    opt_in_user_ids = [c.user_id for c in opt_in_users]
    
    total_participants = len(opt_in_user_ids)
    if total_participants == 0:
        return {
            "total_participants": 0,
            "total_observations": 0,
            "aggregate_correlations": [],
            "message": "No active research opt-in participants yet. Data will update as users opt in."
        }
        
    logs = db.query(DailyLog).filter(DailyLog.user_id.in_(opt_in_user_ids)).all()
    total_obs = len(logs)
    
    if total_obs < 14:
        return {
            "total_participants": total_participants,
            "total_observations": total_obs,
            "aggregate_correlations": [],
            "message": "Insufficient aggregate observations for statistical publication (minimum N=14 required)."
        }
        
    data = []
    for l in logs:
        data.append({
            "sleep_duration": l.sleep_duration,
            "screen_time": l.screen_time,
            "mood": l.mood,
            "focus": l.focus
        })
    df = pd.DataFrame(data).dropna()
    
    corrs = []
    if len(df) >= 14:
        corr_matrix = df.corr(method="spearman")
        for c1 in corr_matrix.columns:
            for c2 in corr_matrix.columns:
                if c1 < c2:
                    val = corr_matrix.loc[c1, c2]
                    if not np.isnan(val):
                        corrs.append({
                            "metric_a": c1,
                            "metric_b": c2,
                            "spearman_rho": round(float(val), 2),
                            "sample_size": len(df)
                        })

    return {
        "total_participants": total_participants,
        "total_observations": total_obs,
        "aggregate_correlations": corrs,
        "privacy_guarantee": "All data is strictly pseudonymized and aggregated. No individual identities or journal texts are exposed."
    }

@router.get("/export/csv")
def export_research_csv(db: Session = Depends(get_db)):
    opt_in_users = db.query(ResearchConsent).filter(ResearchConsent.opt_in == True).all()
    opt_in_user_ids = [c.user_id for c in opt_in_users]
    
    logs = db.query(DailyLog).filter(DailyLog.user_id.in_(opt_in_user_ids)).all()
    
    data = []
    for l in logs:
        data.append({
            "date": l.log_date,
            "sleep_duration": l.sleep_duration,
            "sleep_quality": l.sleep_quality,
            "screen_time": l.screen_time,
            "mood": l.mood,
            "energy": l.energy,
            "focus": l.focus,
            "productivity": l.productivity
        })
        
    df = pd.DataFrame(data)
    csv_str = df.to_csv(index=False)
    return Response(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=mindtrace_research_aggregate.csv"})
