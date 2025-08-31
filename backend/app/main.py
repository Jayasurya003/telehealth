from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth_router, doctors_router, patients_router, appointments_router, messages_router, medical_records_router, prescriptions_router
from app.models import Base
from app.utils import engine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(doctors_router)
app.include_router(patients_router)
app.include_router(appointments_router)
app.include_router(messages_router)
app.include_router(medical_records_router)
app.include_router(prescriptions_router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
