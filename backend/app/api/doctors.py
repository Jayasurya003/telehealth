from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import Doctor, User
from app.schemas import DoctorCreate, DoctorRead, DoctorUpdate
from app.utils import get_db
from sqlalchemy import select

router = APIRouter(prefix="/doctors", tags=["doctors"])

@router.get("/", response_model=list[DoctorRead])
def list_doctors(db: Session = Depends(get_db)):
    return db.execute(select(Doctor)).scalars().all()

@router.get("/{doctor_id}", response_model=DoctorRead)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    return doctor

@router.get("/by_user/{user_id}", response_model=DoctorRead)
def get_doctor_by_user(user_id: int, db: Session = Depends(get_db)):
    doctor = db.execute(select(Doctor).where(Doctor.user_id == user_id)).scalar_one_or_none()
    if not doctor:
        raise HTTPException(404, "Doctor not found for user")
    return doctor

@router.post("/", response_model=DoctorRead)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    db_doctor = Doctor(**doctor.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.put("/{doctor_id}", response_model=DoctorRead)
def update_doctor(doctor_id: int, doctor: DoctorUpdate, db: Session = Depends(get_db)):
    db_doctor = db.get(Doctor, doctor_id)
    if not db_doctor:
        raise HTTPException(404, "Doctor not found")
    for k, v in doctor.dict(exclude_unset=True).items():
        setattr(db_doctor, k, v)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

