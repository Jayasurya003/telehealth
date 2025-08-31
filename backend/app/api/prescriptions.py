from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import Prescription
from app.schemas import PrescriptionCreate, PrescriptionRead
from app.utils import get_db
from sqlalchemy import select

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

@router.get("/", response_model=list[PrescriptionRead])
def list_prescriptions(db: Session = Depends(get_db)):
    return db.execute(select(Prescription)).scalars().all()

@router.get("/{prescription_id}", response_model=PrescriptionRead)
def get_prescription(prescription_id: int, db: Session = Depends(get_db)):
    prescription = db.get(Prescription, prescription_id)
    if not prescription:
        raise HTTPException(404, "Prescription not found")
    return prescription

@router.post("/", response_model=PrescriptionRead)
def create_prescription(prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    db_prescription = Prescription(**prescription.dict())
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription




