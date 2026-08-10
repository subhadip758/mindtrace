from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import User, DailyLog
from app.schemas.schemas import DailyCheckInCreate, DailyCheckInResponse
from app.api.deps import get_current_user
from app.core.data_quality import validate_and_flag_daily_log, create_provenance_records

router = APIRouter()

@router.post("/", response_model=DailyCheckInResponse)
def create_or_update_checkin(
    payload: DailyCheckInCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cleaned_dict, warnings = validate_and_flag_daily_log(payload.dict())

    existing_log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.log_date == payload.log_date
    ).first()

    if existing_log:
        for k, v in cleaned_dict.items():
            if hasattr(existing_log, k):
                setattr(existing_log, k, v)
        log_obj = existing_log
    else:
        log_obj = DailyLog(user_id=current_user.id, **cleaned_dict)
        db.add(log_obj)

    db.commit()
    db.refresh(log_obj)

    # Attach Data Provenance
    prov_records = create_provenance_records(
        daily_log_id=log_obj.id,
        log_data=cleaned_dict,
        source_type="manual",
        source_provider="MindTrace Web Checkin"
    )
    for p in prov_records:
        db.add(p)
    db.commit()

    return log_obj

@router.get("/", response_model=List[DailyCheckInResponse])
def get_checkins(
    limit: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id
    ).order_by(DailyLog.log_date.desc()).limit(limit).all()
    return logs

@router.get("/today", response_model=Optional[DailyCheckInResponse])
def get_today_checkin(
    today_date: str = Query(..., description="YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.log_date == today_date
    ).first()
    return log
