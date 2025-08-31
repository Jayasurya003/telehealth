from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import MedicalRecord
from app.schemas import MedicalRecordCreate, MedicalRecordRead
from app.utils import get_db
from sqlalchemy import select

router = APIRouter(prefix="/medical-records", tags=["medical_records"])

@router.get("/", response_model=list[MedicalRecordRead])
def list_medical_records(db: Session = Depends(get_db)):
    return db.execute(select(MedicalRecord)).scalars().all()

@router.get("/{record_id}", response_model=MedicalRecordRead)
def get_medical_record(record_id: int, db: Session = Depends(get_db)):
    record = db.get(MedicalRecord, record_id)
    if not record:
        raise HTTPException(404, "Medical record not found")
    return record

@router.post("/", response_model=MedicalRecordRead)
def create_medical_record(record: MedicalRecordCreate, db: Session = Depends(get_db)):
    db_record = MedicalRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record




