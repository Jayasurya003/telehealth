import os
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.models import User, Patient
from app.utils import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def main():
    session = SessionLocal()
    try:
        # Find all users with role 'patient'
        patients = session.execute(select(User).where(User.role == 'patient')).scalars().all()
        for user in patients:
            # Check if a Patient profile exists for this user
            exists = session.execute(select(Patient).where(Patient.user_id == user.id)).scalar_one_or_none()
            if not exists:
                print(f"Creating patient profile for user_id={user.id} ({user.email})")
                pat = Patient(user_id=user.id)
                session.add(pat)
        session.commit()
        print("Done. All missing patient profiles have been created.")
    finally:
        session.close()

if __name__ == '__main__':
    main()


