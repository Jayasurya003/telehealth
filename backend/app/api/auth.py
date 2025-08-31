from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models import User, Base, Doctor, Patient
from app.schemas import UserCreate, UserRead, UserLogin, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from sqlalchemy import select
from app.utils import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.execute(select(User).where(User.email == user.email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Create doctor or patient profile if needed
    if user.role == 'doctor':
        db_doctor = Doctor(user_id=db_user.id)
        db.add(db_doctor)
        db.commit()
    elif user.role == 'patient':
        db_patient = Patient(user_id=db_user.id)
        db.add(db_patient)
        db.commit()
    return db_user

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    print("DEBUG: /auth/login route hit, returning user info")
    db_user = db.execute(select(User).where(User.email == user.email)).scalar_one_or_none()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": db_user.email, "user_id": db_user.id, "role": db_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "role": db_user.role,
            "name": db_user.name
        }
    }

@router.post("/forgot-password")
def forgot_password(email: str):
    # Simulate email sending
    print(f"Password reset requested for: {email}")
    return {"msg": "If this email exists, a reset link has been sent."}
