"""
Database seeding module - creates admin user if it doesn't exist.
This runs after Alembic migrations during app startup.
"""

from sqlalchemy.orm import Session
from models import User
from passlib.context import CryptContext

# Initialize password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_EMAIL = "admin@danielsilva.photography"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "TempAdmin2026!Secure"


def seed_admin_user(db: Session) -> None:
    """
    Create admin user if it doesn't already exist.
    This is idempotent - safe to run multiple times.
    """
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(
            User.email == ADMIN_EMAIL
        ).first()
        
        if existing_admin:
            # Admin already exists, do nothing
            return
        
        # Create new admin user
        hashed_password = pwd_context.hash(ADMIN_PASSWORD)
        admin_user = User(
            email=ADMIN_EMAIL,
            username=ADMIN_USERNAME,
            hashed_password=hashed_password,
            full_name="Admin User",
            is_active=True,
            is_admin=True,
            role="admin"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Admin user created: {ADMIN_EMAIL}")
        
    except Exception as e:
        # Log the error but don't crash the app
        print(f"⚠️  Error seeding admin user: {e}")
        db.rollback()
