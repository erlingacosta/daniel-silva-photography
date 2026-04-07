#!/usr/bin/env python3
"""
Create admin user for Daniel Silva Photography platform.
Run this script before starting the application.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

def create_admin_user():
    load_dotenv()
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("⚠️  DATABASE_URL not set. Skipping admin user creation.")
        return
    
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        db = SessionLocal()
        
        # Check if admin exists
        existing_admin = db.query(User).filter(
            User.email == "erlingacosta@gmail.com"
        ).first()
        
        if existing_admin:
            print("✅ Admin user already exists")
        else:
            # Create admin user
            hashed_password = pwd_context.hash("AcostaSilva")
            admin_user = User(
                email="erlingacosta@gmail.com",
                username="erlingacosta",
                hashed_password=hashed_password,
                full_name="Erling Acosta",
                is_active=True,
                is_admin=True,
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created successfully")
            print("   Email: erlingacosta@gmail.com")
            print("   Password: AcostaSilva")
        
        db.close()
    except Exception as e:
        print(f"⚠️  Could not create admin user: {e}")
        print("   This is normal during local development without a database.")
        print("   The admin will be created when deployed to DigitalOcean.")

if __name__ == "__main__":
    create_admin_user()
