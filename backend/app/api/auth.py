from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, Profile
from app.schemas.schemas import UserRegister, UserLogin, Token, ProfileBase, ProfileResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(payload.password)
    new_user = User(email=payload.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create empty initial profile
    profile = Profile(user_id=new_user.id)
    db.add(profile)
    db.commit()
    
    token = create_access_token(subject=new_user.id)
    return Token(access_token=token, user_id=new_user.id, email=new_user.email)

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    token = create_access_token(subject=user.id)
    return Token(access_token=token, user_id=user.id, email=user.email)

@router.get("/me", response_model=ProfileResponse)
def get_current_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/onboarding", response_model=ProfileResponse)
def update_onboarding(payload: ProfileBase, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        
    profile.nickname = payload.nickname
    profile.age_range = payload.age_range
    profile.primary_goals = payload.primary_goals
    profile.sleep_schedule = payload.sleep_schedule
    profile.work_schedule = payload.work_schedule
    profile.custom_metrics_schema = payload.custom_metrics_schema
    profile.onboarding_completed = True
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
