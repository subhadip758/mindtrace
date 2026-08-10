from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import User, ResearchConsent, DailyLog
from app.schemas.schemas import ResearchConsentSchema
from app.api.deps import get_current_user
from app.services.analytics_engine import spearmanr

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
        
    metrics = ["sleep_duration", "screen_time", "mood", "focus"]
    metric_vals = {m: [getattr(l, m) for l in logs if getattr(l, m) is not None] for m in metrics}
    
    corrs = []
    for i in range(len(metrics)):
        for j in range(i + 1, len(metrics)):
            m1 = metrics[i]
            m2 = metrics[j]
            v1 = []
            v2 = []
            for l in logs:
                x = getattr(l, m1)
                y = getattr(l, m2)
                if x is not None and y is not None:
                    v1.append(float(x))
                    v2.append(float(y))
            if len(v1) >= 14:
                rho, p_val = spearmanr(v1, v2)
                corrs.append({
                    "metric_a": m1,
                    "metric_b": m2,
                    "spearman_rho": round(rho, 2),
                    "sample_size": len(v1)
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
    
    lines = ["date,sleep_duration,sleep_quality,screen_time,mood,energy,focus,productivity"]
    for l in logs:
        lines.append(f"{l.log_date},{l.sleep_duration},{l.sleep_quality},{l.screen_time},{l.mood},{l.energy},{l.focus},{l.productivity}")
        
    csv_str = "\n".join(lines)
    return Response(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=mindtrace_research_aggregate.csv"})
