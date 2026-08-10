from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User, JournalEntry, JournalAnalysis
from app.schemas.schemas import JournalCreate, JournalResponse, JournalAnalysisResult
from app.api.deps import get_current_user
from app.ai.journal_analyzer import analyze_user_journal

router = APIRouter()

@router.post("/", response_model=JournalResponse)
def create_journal_entry(
    payload: JournalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = JournalEntry(
        user_id=current_user.id,
        content=payload.content,
        mood_tags=payload.mood_tags,
        activity_tags=payload.activity_tags
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Perform AI Journal Analysis automatically
    ai_raw = analyze_user_journal(payload.content)
    analysis = JournalAnalysis(
        journal_entry_id=entry.id,
        themes=ai_raw.get("themes", []),
        emotional_signals=ai_raw.get("emotional_signals", []),
        behavioral_signals=ai_raw.get("behavioral_signals", []),
        confidence=ai_raw.get("confidence", 0.85),
        summary=ai_raw.get("summary", ""),
        safety_flag=ai_raw.get("safety_flag", False)
    )
    db.add(analysis)
    db.commit()
    db.refresh(entry)

    return entry

@router.get("/", response_model=List[JournalResponse])
def get_journal_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id
    ).order_by(JournalEntry.created_at.desc()).all()
    return entries

@router.post("/{entry_id}/analyze", response_model=JournalAnalysisResult)
def reanalyze_journal_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    ai_raw = analyze_user_journal(entry.content)
    
    analysis = db.query(JournalAnalysis).filter(JournalAnalysis.journal_entry_id == entry_id).first()
    if not analysis:
        analysis = JournalAnalysis(journal_entry_id=entry_id)
        
    analysis.themes = ai_raw.get("themes", [])
    analysis.emotional_signals = ai_raw.get("emotional_signals", [])
    analysis.behavioral_signals = ai_raw.get("behavioral_signals", [])
    analysis.confidence = ai_raw.get("confidence", 0.85)
    analysis.summary = ai_raw.get("summary", "")
    analysis.safety_flag = ai_raw.get("safety_flag", False)
    
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return JournalAnalysisResult(
        themes=analysis.themes,
        emotional_signals=analysis.emotional_signals,
        behavioral_signals=analysis.behavioral_signals,
        confidence=analysis.confidence,
        summary=analysis.summary,
        safety_flag=analysis.safety_flag
    )
