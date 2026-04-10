from sqlalchemy.orm import Session
from models import User, ServicePackage, Portfolio, FaqItem, AlaCarteService
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_EMAIL = "admin@danielsilva.photography"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "TempAdmin2026!Secure"

def seed_admin_user(db: Session):
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            return
        
        hashed = pwd_context.hash(ADMIN_PASSWORD)
        admin = User(
            email=ADMIN_EMAIL,
            username=ADMIN_USERNAME,
            hashed_password=hashed,
            full_name="Admin User",
            is_active=True,
            is_admin=True,
            role="admin"
        )
        db.add(admin)
        db.commit()
        print("✅ Admin user seeded")
    except Exception as e:
        print(f"⚠️ Error seeding admin: {e}")
        db.rollback()

def seed_packages(db: Session):
    try:
        if db.query(ServicePackage).count() > 0:
            return
        
        packages = [
            ServicePackage(
                name="Signature",
                description="8 hours of professional photography",
                price=4500.00,
                deliverables="Professional photographer, High-resolution photos, 500+ edited images, Cloud backup, Web gallery access",
                is_active=True
            ),
            ServicePackage(
                name="Premium Plus",
                description="12 hours with second photographer",
                price=6200.00,
                deliverables="Everything in Signature, Second photographer, Engagement photos, Videography highlights, Premium album, Unlimited gallery",
                is_active=True
            ),
            ServicePackage(
                name="Elite",
                description="16 hours with all premium features",
                price=8500.00,
                deliverables="Everything in Premium Plus, Drone photography, Full-length video, Multiple locations, Print packages, VIP consultation, Lifetime gallery",
                is_active=True
            ),
        ]
        db.add_all(packages)
        db.commit()
        print("✅ Packages seeded")
    except Exception as e:
        print(f"⚠️ Error seeding packages: {e}")
        db.rollback()

def seed_portfolios(db: Session):
    try:
        if db.query(Portfolio).count() > 0:
            return
        
        portfolios = [
            Portfolio(title="Wedding Ceremony & First Dance", description="Cinematic capture", category="Weddings", image_url="/images/wedding-ceremony-still.jpg", thumbnail_url="/images/wedding-ceremony-still.jpg", order=1),
            Portfolio(title="Quinceañera Golden Hour", description="Golden hour celebration", category="Quinceañeras", image_url="/images/quinceanera/quince-01-v2.jpg", thumbnail_url="/images/quinceanera/quince-01-v2.jpg", order=2),
            Portfolio(title="Quinceañera Glamour", description="Glamorous portraits", category="Quinceañeras", image_url="/images/quinceanera/quince-02-v2.jpg", thumbnail_url="/images/quinceanera/quince-02-v2.jpg", order=3),
            Portfolio(title="Event Highlights", description="Event coverage", category="Events", image_url="/images/event-highlights-still.jpg", thumbnail_url="/images/event-highlights-still.jpg", order=4),
            Portfolio(title="Portrait Natural Light", description="Natural light session", category="Portraits", image_url="/images/portrait-cinematic-still-1.jpg", thumbnail_url="/images/portrait-cinematic-still-1.jpg", order=5),
            Portfolio(title="Portrait Studio", description="Studio session", category="Portraits", image_url="/images/portrait-cinematic-still-2.jpg", thumbnail_url="/images/portrait-cinematic-still-2.jpg", order=6),
            Portfolio(title="La Hacienda Wedding", description="Venue wedding", category="Weddings", image_url="/images/wedding/wedding-02.jpg", thumbnail_url="/images/wedding/wedding-02.jpg", order=7),
            Portfolio(title="Family Portraits", description="Family session", category="Portraits", image_url="/images/portrait-2.jpg", thumbnail_url="/images/portrait-2.jpg", order=8),
        ]
        db.add_all(portfolios)
        db.commit()
        print("✅ Portfolios seeded")
    except Exception as e:
        print(f"⚠️ Error seeding portfolios: {e}")
        db.rollback()

def seed_faq(db: Session):
    try:
        if db.query(FaqItem).count() > 0:
            return
        
        faqs = [
            FaqItem(question="What is included in each package?", answer="Each package includes professional photography, edited high-resolution images, cloud backup, and gallery access. Premium packages include additional services like a second photographer or videography.", order=1, is_active=True),
            FaqItem(question="How long does it take to receive photos?", answer="You can typically expect to receive edited photos within 4-6 weeks of your event. Rush processing is available for an additional fee.", order=2, is_active=True),
            FaqItem(question="Do you offer videography?", answer="Yes, videography is included in the Premium Plus and Elite packages. Videography can also be added separately for $1,500.", order=3, is_active=True),
            FaqItem(question="What is your cancellation policy?", answer="Cancellations made more than 60 days in advance receive a full refund. Cancellations within 60 days forfeit the deposit. Rescheduling is available within one year.", order=4, is_active=True),
            FaqItem(question="Do you provide engagement shoots?", answer="Yes! Engagement shoots are available for $500 and are the perfect way to get comfortable in front of the camera before your big day.", order=5, is_active=True),
            FaqItem(question="Can you accommodate multiple locations?", answer="Yes! We love shooting at multiple locations. The Elite package includes multiple location coverage. Additional locations can be added for $300 per location.", order=6, is_active=True),
        ]
        db.add_all(faqs)
        db.commit()
        print("✅ FAQ seeded")
    except Exception as e:
        print(f"⚠️ Error seeding FAQ: {e}")
        db.rollback()

def seed_ala_carte(db: Session):
    try:
        if db.query(AlaCarteService).count() > 0:
            return
        
        services = [
            AlaCarteService(name="Pre-wedding engagement shoot", description="60 minute engagement photo session", price=500.00, order=1, is_active=True),
            AlaCarteService(name="Additional hours", description="Per hour", price=400.00, order=2, is_active=True),
            AlaCarteService(name="Drone footage package", description="Aerial coverage and edited video", price=800.00, order=3, is_active=True),
            AlaCarteService(name="Premium hardcover album", description="50-page heirloom quality album", price=600.00, order=4, is_active=True),
            AlaCarteService(name="Rush delivery", description="Expedited photo delivery", price=400.00, order=5, is_active=True),
        ]
        db.add_all(services)
        db.commit()
        print("✅ A La Carte services seeded")
    except Exception as e:
        print(f"⚠️ Error seeding a la carte: {e}")
        db.rollback()

def seed_database(db: Session):
    seed_admin_user(db)
    seed_packages(db)
    seed_portfolios(db)
    seed_faq(db)
    seed_ala_carte(db)
