from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import Message
from app.schemas import MessageCreate, MessageRead
from app.utils import get_db
from sqlalchemy import select

router = APIRouter(prefix="/messages", tags=["messages"])

@router.get("/", response_model=list[MessageRead])
def list_messages(db: Session = Depends(get_db)):
    return db.execute(select(Message)).scalars().all()

@router.get("/{message_id}", response_model=MessageRead)
def get_message(message_id: int, db: Session = Depends(get_db)):
    message = db.get(Message, message_id)
    if not message:
        raise HTTPException(404, "Message not found")
    return message

@router.post("/", response_model=MessageRead)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    db_message = Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message




