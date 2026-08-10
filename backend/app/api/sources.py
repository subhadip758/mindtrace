from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List
from app.core.database import get_db
from app.models.models import User, DataSource, SyncJob, DailyLog, DataProvenance
from app.api.deps import get_current_user

router = APIRouter()

SUPPORTED_PROVIDERS = [
    {"id": "health_connect", "name": "Android Health Connect", "icon": "Smartphone"},
    {"id": "apple_health", "name": "Apple Health", "icon": "Heart"},
    {"id": "google_fit", "name": "Google Fit API", "icon": "Activity"},
    {"id": "fitbit", "name": "Fitbit Web API", "icon": "Watch"}
]

@router.get("/")
def list_data_sources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_sources = db.query(DataSource).filter(DataSource.user_id == current_user.id).all()
    source_map = {s.provider_name: s for s in user_sources}
    
    result = []
    for prov in SUPPORTED_PROVIDERS:
        prov_id = prov["id"]
        s = source_map.get(prov_id)
        if s:
            result.append({
                "provider_id": prov_id,
                "provider_name": prov["name"],
                "connection_status": s.connection_status,
                "last_sync": s.last_sync,
                "permissions": s.permissions,
                "error_message": s.error_message
            })
        else:
            result.append({
                "provider_id": prov_id,
                "provider_name": prov["name"],
                "connection_status": "DISCONNECTED",
                "last_sync": None,
                "permissions": ["sleep", "steps", "exercise"],
                "error_message": None
            })
    return result

@router.post("/{provider_id}/connect")
def connect_data_source(
    provider_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid_ids = [p["id"] for p in SUPPORTED_PROVIDERS]
    if provider_id not in valid_ids:
        raise HTTPException(status_code=400, detail="Unsupported data provider")
        
    s = db.query(DataSource).filter(DataSource.user_id == current_user.id, DataSource.provider_name == provider_id).first()
    if not s:
        s = DataSource(user_id=current_user.id, provider_name=provider_id)
        
    s.connection_status = "CONNECTED"
    s.last_sync = datetime.now(timezone.utc)
    s.permissions = ["sleep", "steps", "exercise", "screen_time"]
    s.error_message = None
    
    db.add(s)
    db.commit()
    db.refresh(s)
    
    return {"status": "CONNECTED", "provider_id": provider_id}

@router.post("/{provider_id}/sync")
def sync_data_source(
    provider_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(DataSource).filter(DataSource.user_id == current_user.id, DataSource.provider_name == provider_id).first()
    if not s or s.connection_status != "CONNECTED":
        raise HTTPException(status_code=400, detail="Data source is not connected")
        
    s.connection_status = "SYNCING"
    db.commit()
    
    # Create sync job record
    job = SyncJob(data_source_id=s.id, status="IN_PROGRESS", records_synced=0)
    db.add(job)
    db.commit()
    
    # Update status to SYNCED
    s.connection_status = "SYNCED"
    s.last_sync = datetime.now(timezone.utc)
    job.status = "COMPLETED"
    job.records_synced = 1
    job.completed_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {
        "status": "SYNCED",
        "records_synced": job.records_synced,
        "last_sync": s.last_sync
    }

@router.delete("/{provider_id}")
def disconnect_data_source(
    provider_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    s = db.query(DataSource).filter(DataSource.user_id == current_user.id, DataSource.provider_name == provider_id).first()
    if s:
        s.connection_status = "DISCONNECTED"
        db.commit()
    return {"status": "DISCONNECTED", "provider_id": provider_id}
