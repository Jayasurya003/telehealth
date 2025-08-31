import os
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.models import User, Doctor
from app.utils import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def main():
    session = SessionLocal()
    try:
        # Find all users with role 'doctor'
        doctors = session.execute(select(User).where(User.role == 'doctor')).scalars().all()
        for user in doctors:
            # Check if a Doctor profile exists for this user
            exists = session.execute(select(Doctor).where(Doctor.user_id == user.id)).scalar_one_or_none()
            if not exists:
                print(f"Creating doctor profile for user_id={user.id} ({user.email})")
                doc = Doctor(user_id=user.id, specialization='', schedule='', availability=True)
                session.add(doc)
        session.commit()
        print("Done. All missing doctor profiles have been created.")
    finally:
        session.close()

if __name__ == '__main__':
    main()
