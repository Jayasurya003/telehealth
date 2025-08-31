from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import Patient, User
from app.schemas import PatientCreate, PatientRead
from app.utils import get_db
from sqlalchemy import select

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/", response_model=list[PatientRead])
def list_patients(db: Session = Depends(get_db)):
    return db.execute(select(Patient)).scalars().all()

@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(404, "Patient not found")
    return patient

@router.get("/by_user/{user_id}", response_model=PatientRead)
def get_patient_by_user(user_id: int, db: Session = Depends(get_db)):
    patient = db.execute(select(Patient).where(Patient.user_id == user_id)).scalar_one_or_none()
    if not patient:
        raise HTTPException(404, "Patient profile not found for this user.")
    return patient

@router.post("/", response_model=PatientRead)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.put("/{patient_id}", response_model=PatientRead)
def update_patient(patient_id: int, patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.get(Patient, patient_id)
    if not db_patient:
        raise HTTPException(404, "Patient not found")
    for k, v in patient.dict().items():
        setattr(db_patient, k, v)
    db.commit()
    db.refresh(db_patient)
    return db_patient


