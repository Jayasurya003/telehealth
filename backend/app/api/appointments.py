from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import Appointment
from app.schemas import AppointmentCreate, AppointmentRead
from app.utils import get_db
from sqlalchemy import select

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.get("/", response_model=list[AppointmentRead])
def list_appointments(db: Session = Depends(get_db)):
    return db.execute(select(Appointment)).scalars().all()

@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(404, "Appointment not found")
    return appointment

@router.post("/", response_model=AppointmentRead)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.put("/{appointment_id}", response_model=AppointmentRead)
def update_appointment(appointment_id: int, appointment: AppointmentCreate, db: Session = Depends(get_db)):
    db_appointment = db.get(Appointment, appointment_id)
    if not db_appointment:
        raise HTTPException(404, "Appointment not found")
    for k, v in appointment.dict().items():
        setattr(db_appointment, k, v)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment




