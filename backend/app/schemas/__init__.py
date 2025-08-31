from pydantic import BaseModel, EmailStr
from typing import Optional, List, Union
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Doctor Schemas
class DoctorBase(BaseModel):
    specialization: Optional[str] = None
    schedule: Optional[str] = None
    availability: Optional[bool] = True

class DoctorCreate(DoctorBase):
    pass

class DoctorRead(DoctorBase):
    id: int
    user: UserRead
    class Config:
        from_attributes = True

class DoctorUpdate(BaseModel):
    specialization: Optional[str] = None
    schedule: Optional[str] = None
    availability: Optional[bool] = None

# Patient Schemas
class PatientBase(BaseModel):
    pass

class PatientCreate(PatientBase):
    pass

class PatientRead(PatientBase):
    id: int
    user: UserRead
    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    scheduled_time: datetime
    status: Optional[str] = 'pending'

class AppointmentCreate(AppointmentBase):
    doctor_id: int
    patient_id: int

class AppointmentRead(AppointmentBase):
    id: int
    doctor: DoctorRead
    patient: PatientRead
    class Config:
        from_attributes = True

# Message Schemas
class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    appointment_id: int
    sender_id: int

class MessageRead(MessageBase):
    id: int
    appointment_id: int
    sender: UserRead
    timestamp: datetime
    class Config:
        from_attributes = True

# MedicalRecord Schemas
class MedicalRecordBase(BaseModel):
    file_path: str

class MedicalRecordCreate(MedicalRecordBase):
    patient_id: int

class MedicalRecordRead(MedicalRecordBase):
    id: int
    patient: PatientRead
    uploaded_at: datetime
    class Config:
        from_attributes = True

# Prescription Schemas
class PrescriptionBase(BaseModel):
    file_path: str

class PrescriptionCreate(PrescriptionBase):
    appointment_id: int

class PrescriptionRead(PrescriptionBase):
    id: int
    appointment: AppointmentRead
    created_at: datetime
    class Config:
        from_attributes = True

# Token
class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'
