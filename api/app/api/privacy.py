from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.models import User, Profile, DailyLog, JournalEntry, Experiment, ResearchConsent, DataSource
from app.schemas.schemas import DataExportResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/export", response_model=DataExportResponse)
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    logs = db.query(DailyLog).filter(DailyLog.user_id == current_user.id).all()
    journals = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).all()
    experiments = db.query(Experiment).filter(Experiment.user_id == current_user.id).all()

    profile_dict = {
        "nickname": profile.nickname if profile else None,
        "age_range": profile.age_range if profile else None,
        "primary_goals": profile.primary_goals if profile else [],
        "sleep_schedule": profile.sleep_schedule if profile else None,
        "work_schedule": profile.work_schedule if profile else None
    } if profile else None

    logs_list = [{
        "log_date": l.log_date,
        "mood": l.mood,
        "energy": l.energy,
        "focus": l.focus,
        "productivity": l.productivity,
        "sleep_duration": l.sleep_duration,
        "sleep_quality": l.sleep_quality,
        "screen_time": l.screen_time,
        "study_work_duration": l.study_work_duration,
        "exercise_duration": l.exercise_duration,
        "social_duration": l.social_duration,
        "custom_habits": l.custom_habits
    } for l in logs]

    journals_list = [{
        "id": j.id,
        "content": j.content,
        "mood_tags": j.mood_tags,
        "activity_tags": j.activity_tags,
        "created_at": j.created_at.isoformat()
    } for j in journals]

    exp_list = [{
        "id": e.id,
        "title": e.title,
        "hypothesis": e.hypothesis,
        "target_metric": e.target_metric,
        "status": e.status
    } for e in experiments]

    return DataExportResponse(
        user={"id": current_user.id, "email": current_user.email, "created_at": current_user.created_at.isoformat()},
        profile=profile_dict,
        daily_logs=logs_list,
        journal_entries=journals_list,
        experiments=exp_list,
        exported_at=datetime.now(timezone.utc).isoformat()
    )

@router.delete("/account")
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes user account and all associated personal data from PostgreSQL/SQLite.
    """
    user_id = current_user.id
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    
    return {"status": "SUCCESS", "message": f"Account {user_id} and all personal records permanently deleted."}
