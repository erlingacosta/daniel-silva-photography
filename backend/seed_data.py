"""
Seed database with initial data
"""
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, ServicePackage, Testimonial

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_packages(db: Session):
    # Check if packages already exist
    if db.query(ServicePackage).count() > 0:
        print("Packages already exist, skipping seed...")
        return
    
    packages = [
        ServicePackage(
            name="Signature",
            description="Perfect for intimate gatherings and celebrations",
            price=4500,
            deliverables="8 hours of coverage, 500+ edited photos, online gallery, print releases",
        ),
        ServicePackage(
            name="Premium Plus",
            description="Our most popular package for weddings and quinceañeras",
            price=6200,
            deliverables="12 hours of coverage, 800+ edited photos, 2 photographers, cinematic video highlight (3-5 min), online gallery, print releases",
        ),
        ServicePackage(
            name="Elite",
            description="Complete coverage for your most important day",
            price=8500,
            deliverables="Full-day coverage (up to 16 hours), 1000+ edited photos, 2-3 photographers, cinematic wedding film (15+ min), engagement session, album design, print releases, drone footage",
        ),
    ]
    
    db.add_all(packages)
    db.commit()
    print(f"✓ Seeded {len(packages)} service packages")

def seed_testimonials(db: Session):
    # Check if testimonials already exist
    if db.query(Testimonial).count() > 0:
        print("Testimonials already exist, skipping seed...")
        return
    
    testimonials = [
        Testimonial(
            client_name="Maria & Juan",
            event_type="wedding",
            quote="Daniel captured the essence of our wedding day perfectly. His attention to detail and cinematic style made every moment feel like a movie!",
            rating=5.0,
            image_url="/images/testimonials/maria-juan.jpg",
        ),
        Testimonial(
            client_name="Sofia",
            event_type="quinceañera",
            quote="My quinceañera photos are absolutely stunning! Daniel made me feel so comfortable in front of the camera, and the results exceeded expectations.",
            rating=5.0,
            image_url="/images/testimonials/sofia.jpg",
        ),
        Testimonial(
            client_name="The Rodriguez Family",
            event_type="event",
            quote="Professional, creative, and an absolute pleasure to work with. Highly recommended!",
            rating=5.0,
            image_url="/images/testimonials/rodriguez.jpg",
        ),
    ]
    
    db.add_all(testimonials)
    db.commit()
    print(f"✓ Seeded {len(testimonials)} testimonials")

if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        seed_packages(db)
        seed_testimonials(db)
        print("\n✓ Database seeding complete!")
    finally:
        db.close()
