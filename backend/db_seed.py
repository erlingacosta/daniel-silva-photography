"""
Database seeding module - creates admin user, packages, and portfolios if they don't exist.
This runs after Alembic migrations during app startup.
"""

from sqlalchemy.orm import Session
from models import User, ServicePackage, Portfolio
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


def seed_packages(db: Session) -> None:
    """
    Create default service packages if none exist.
    This is idempotent - safe to run multiple times.
    """
    try:
        # Check if packages already exist
        existing_count = db.query(ServicePackage).count()
        if existing_count > 0:
            return
        
        packages = [
            ServicePackage(
                name="Signature",
                description="8 hours of professional photography",
                price=4500.00,
                deliverables="Professional photographer\nHigh-resolution photos\n500+ edited images\nCloud backup\nWeb gallery access",
                is_active=True
            ),
            ServicePackage(
                name="Premium Plus",
                description="12 hours with second photographer",
                price=6200.00,
                deliverables="Everything in Signature\nSecond photographer\nEngagement photos\nVideography (highlights)\nPremium album\nUnlimited gallery access",
                is_active=True
            ),
            ServicePackage(
                name="Elite",
                description="16 hours with all premium features",
                price=8500.00,
                deliverables="Everything in Premium Plus\nDrone photography\nFull-length video\nMultiple locations\nPrint packages included\nVIP consultation\nLifetime gallery access",
                is_active=True
            ),
        ]
        
        db.add_all(packages)
        db.commit()
        print(f"✅ Seeded {len(packages)} service packages")
        
    except Exception as e:
        print(f"⚠️  Error seeding packages: {e}")
        db.rollback()


def seed_portfolios(db: Session) -> None:
    """
    Create default portfolio items if none exist.
    This is idempotent - safe to run multiple times.
    """
    try:
        # Check if portfolios already exist
        existing_count = db.query(Portfolio).count()
        if existing_count > 0:
            return
        
        portfolios = [
            Portfolio(
                title="Wedding Ceremony & First Dance",
                description="Cinematic capture of wedding moments",
                category="Weddings",
                image_url="/images/wedding-ceremony-still.jpg",
                thumbnail_url="/images/wedding-ceremony-still.jpg",
                order=1
            ),
            Portfolio(
                title="Quinceañera — Golden Hour",
                description="Golden hour quinceañera celebration",
                category="Quinceañeras",
                image_url="/images/quinceanera/quince-01-v2.jpg",
                thumbnail_url="/images/quinceanera/quince-01-v2.jpg",
                order=2
            ),
            Portfolio(
                title="Quinceañera — Glamour Close-Up",
                description="Glamorous close-up portraits",
                category="Quinceañeras",
                image_url="/images/quinceanera/quince-02-v2.jpg",
                thumbnail_url="/images/quinceanera/quince-02-v2.jpg",
                order=3
            ),
            Portfolio(
                title="Event Photography Highlights",
                description="Event coverage highlights",
                category="Events",
                image_url="/images/event-highlights-still.jpg",
                thumbnail_url="/images/event-highlights-still.jpg",
                order=4
            ),
            Portfolio(
                title="Cinematic Portrait — Natural Light",
                description="Natural light portrait session",
                category="Portraits",
                image_url="/images/portrait-cinematic-still-1.jpg",
                thumbnail_url="/images/portrait-cinematic-still-1.jpg",
                order=5
            ),
            Portfolio(
                title="Cinematic Portrait — Studio",
                description="Studio portrait session",
                category="Portraits",
                image_url="/images/portrait-cinematic-still-2.jpg",
                thumbnail_url="/images/portrait-cinematic-still-2.jpg",
                order=6
            ),
            Portfolio(
                title="La Hacienda Wedding",
                description="Wedding at La Hacienda venue",
                category="Weddings",
                image_url="/images/wedding/wedding-02.jpg",
                thumbnail_url="/images/wedding/wedding-02.jpg",
                order=7
            ),
            Portfolio(
                title="Family Portrait Collection",
                description="Family portrait session",
                category="Portraits",
                image_url="/images/portrait-2.jpg",
                thumbnail_url="/images/portrait-2.jpg",
                order=8
            ),
        ]
        
        db.add_all(portfolios)
        db.commit()
        print(f"✅ Seeded {len(portfolios)} portfolio items")
        
    except Exception as e:
        print(f"⚠️  Error seeding portfolios: {e}")
        db.rollback()


def seed_database(db: Session) -> None:
    """
    Run all seeding functions.
    This is the main entry point for database seeding.
    """
    seed_admin_user(db)
    seed_packages(db)
    seed_portfolios(db)
