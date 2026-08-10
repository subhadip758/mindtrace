from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import SimulatorRequest, SimulatorResponse
from app.api.deps import get_current_user
from app.services.simulator_service import run_what_if_simulation

router = APIRouter()

@router.post("/", response_model=SimulatorResponse)
def simulate_behavior_change(
    payload: SimulatorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return run_what_if_simulation(db, current_user.id, payload)
