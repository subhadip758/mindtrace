from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.schemas.schemas import FingerprintResponse
from app.api.deps import get_current_user
from app.services.analytics_engine import compute_user_behavioral_fingerprint
from app.ai.journal_analyzer import explain_user_evidence

router = APIRouter()

@router.get("/fingerprint", response_model=FingerprintResponse)
def get_behavioral_fingerprint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return compute_user_behavioral_fingerprint(db, current_user.id)

@router.post("/explain")
def explain_pattern_evidence(
    evidence_payload: dict,
    current_user: User = Depends(get_current_user)
):
    explanation = explain_user_evidence(evidence_payload)
    return {
        "evidence": evidence_payload,
        "explanation": explanation,
        "limitation": "Association does not imply causation."
    }
