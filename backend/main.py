import os
import json
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from pathlib import Path
import shutil
from pydantic import BaseModel

from database import get_db, engine, SessionLocal
from models import Base, Portfolio, Testimonial, ServicePackage, Booking, User, Inquiry, NewsletterSubscriber, ContactMessage, FaqItem, AlaCarteService, FeaturedIn
from routers import auth, admin
from db_seed import seed_database as run_seed_database
from spaces import upload_to_spaces

load_dotenv()

# Pydantic schemas
class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str
    message: str

# Create tables on startup
def init_database():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")

# Seed database after tables are created
def seed_database():
    try:
        db = SessionLocal()
        run_seed_database(db)
        db.close()
        print("✅ Database seeding completed")
    except Exception as e:
        print(f"⚠️  Database seeding skipped: {e}")

app = FastAPI(
    title="Daniel Silva Photography API",
    description="Premium photography booking platform",
    version="1.0.0"
)

# Initialize database and seed on startup
@app.on_event("startup")
async def startup_event():
    init_database()
    seed_database()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth router
app.include_router(auth.router, prefix="/auth", tags=["auth"])

# Admin router
app.include_router(admin.router, prefix="/admin", tags=["admin"])

# Root route
@app.get("/")
def root():
    return {"message": "Daniel Silva Photography API", "version": "1.0.0", "docs": "/docs"}

# Health check endpoints
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/status")
def status():
    return {"status": "Daniel Silva Photography API is running", "version": "1.0.0"}

# Public About endpoint
ABOUT_FILE = Path(__file__).parent / "about_data.json"

DEFAULT_ABOUT = {
    "photographer_name": "Daniel Silva",
    "bio": "Daniel Silva is a passionate photographer dedicated to capturing life's most important moments. With over 15 years of experience, he specializes in wedding, quinceañera, and event photography.",
    "photo_url": "",
    "events_photographed": 500,
    "years_experience": 15,
    "client_satisfaction": 100,
}

@app.get("/about")
def get_about():
    """Get about section data (public endpoint)"""
    try:
        if ABOUT_FILE.exists():
            return json.loads(ABOUT_FILE.read_text())
        return DEFAULT_ABOUT
    except Exception as e:
        print(f"Error reading about data: {e}")
        return DEFAULT_ABOUT

# Portfolio endpoints
@app.get("/portfolios")
def get_portfolios(db: Session = Depends(get_db)):
    portfolios = db.query(Portfolio).order_by(Portfolio.order).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "category": p.category,
            "image_url": p.image_url,
            "thumbnail_url": p.thumbnail_url,
        }
        for p in portfolios
    ]

@app.post("/portfolios")
def create_portfolio(title: str, description: str, category: str, image_url: str, db: Session = Depends(get_db)):
    portfolio = Portfolio(
        title=title,
        description=description,
        category=category,
        image_url=image_url,
        thumbnail_url=image_url,
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return {"id": portfolio.id, "title": portfolio.title, "category": portfolio.category}

@app.put("/portfolios/{portfolio_id}")
def update_portfolio(portfolio_id: int, data: dict, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    for field in ("title", "description", "category", "image_url"):
        if field in data:
            setattr(portfolio, field, data[field])
    if "image_url" in data:
        portfolio.thumbnail_url = data["image_url"]
    db.commit()
    db.refresh(portfolio)
    return {"id": portfolio.id, "title": portfolio.title, "category": portfolio.category}

@app.delete("/portfolios/{portfolio_id}")
def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    db.delete(portfolio)
    db.commit()
    return {"message": "Deleted successfully", "id": portfolio_id}

# Testimonials endpoints
@app.get("/testimonials")
def get_testimonials(db: Session = Depends(get_db)):
    testimonials = db.query(Testimonial).order_by(Testimonial.order).all()
    return [
        {
            "id": t.id,
            "client_name": t.client_name,
            "event_type": t.event_type,
            "quote": t.quote,
            "rating": t.rating,
            "image_url": t.image_url,
        }
        for t in testimonials
    ]

@app.post("/testimonials")
def create_testimonial(client_name: str, event_type: str, quote: str, rating: float, image_url: str, db: Session = Depends(get_db)):
    testimonial = Testimonial(
        client_name=client_name,
        event_type=event_type,
        quote=quote,
        rating=rating,
        image_url=image_url,
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return {"id": testimonial.id, "client_name": testimonial.client_name}

# Service packages endpoints
@app.get("/packages")
def get_packages(db: Session = Depends(get_db)):
    packages = db.query(ServicePackage).filter(ServicePackage.is_active == True).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "deliverables": p.deliverables,
        }
        for p in packages
    ]

@app.post("/packages")
def create_package(name: str, description: str, price: float, deliverables: str, db: Session = Depends(get_db)):
    package = ServicePackage(
        name=name,
        description=description,
        price=price,
        deliverables=deliverables,
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    return {"id": package.id, "name": package.name, "price": package.price}

# Newsletter endpoints
@app.post("/newsletter/subscribe")
def subscribe_newsletter(email: str, db: Session = Depends(get_db)):
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    if existing:
        return {"message": "Already subscribed", "email": email}
    
    subscriber = NewsletterSubscriber(email=email)
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    return {"message": "Subscribed successfully", "email": email}

# Inquiry endpoints
@app.post("/inquiries")
def create_inquiry(name: str, email: str, phone: str, event_type: str, event_date: str, message: str, db: Session = Depends(get_db)):
    inquiry = Inquiry(
        name=name,
        email=email,
        phone=phone,
        event_type=event_type,
        event_date=event_date,
        message=message,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return {"id": inquiry.id, "message": "Inquiry received, we'll contact you soon!"}

@app.get("/inquiries")
def get_inquiries(db: Session = Depends(get_db)):
    inquiries = db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()
    return [
        {
            "id": i.id,
            "name": i.name,
            "email": i.email,
            "event_type": i.event_type,
            "status": i.status,
            "created_at": i.created_at.isoformat(),
        }
        for i in inquiries
    ]

# Booking endpoints
@app.post("/bookings")
def create_booking(client_email: str, package_id: int, event_date: str, event_type: str, event_location: str, notes: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == client_email).first()
    if not user:
        user = User(email=client_email, username=client_email.split("@")[0])
        db.add(user)
        db.commit()
        db.refresh(user)
    
    package = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    booking = Booking(
        client_id=user.id,
        package_id=package_id,
        event_date=event_date,
        event_type=event_type,
        event_location=event_location,
        notes=notes,
        total_price=package.price,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {
        "id": booking.id,
        "status": "pending",
        "total_price": booking.total_price,
        "message": "Booking created. A confirmation email will be sent shortly."
    }

@app.get("/bookings")
def get_bookings(db: Session = Depends(get_db)):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "client_email": b.client.email if b.client else "Unknown",
            "package": b.package.name if b.package else "Unknown",
            "event_date": b.event_date.isoformat() if b.event_date else None,
            "status": b.status,
            "total_price": b.total_price,
            "created_at": b.created_at.isoformat(),
        }
        for b in bookings
    ]

# Contact form endpoint - FIXED to accept JSON body
@app.post("/contact")
def create_contact(contact_data: ContactCreate, db: Session = Depends(get_db)):
    contact = ContactMessage(
        name=contact_data.name,
        email=contact_data.email,
        phone=contact_data.phone,
        message=contact_data.message,
        status="new"
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return {"id": contact.id, "message": "Thank you! We'll get back to you soon."}

# FAQ endpoints
@app.get("/faq")
def get_faq(db: Session = Depends(get_db)):
    faqs = db.query(FaqItem).filter(FaqItem.is_active == True).order_by(FaqItem.order).all()
    return [
        {"id": f.id, "question": f.question, "answer": f.answer}
        for f in faqs
    ]

# A La Carte Services endpoints
@app.get("/ala-carte")
def get_ala_carte(db: Session = Depends(get_db)):
    services = db.query(AlaCarteService).filter(AlaCarteService.is_active == True).order_by(AlaCarteService.order).all()
    return [
        {"id": s.id, "name": s.name, "description": s.description, "price": s.price}
        for s in services
    ]

# Featured In endpoints
@app.get("/featured-in")
def get_featured_in(db: Session = Depends(get_db)):
    featured = db.query(FeaturedIn).filter(FeaturedIn.is_active == True).order_by(FeaturedIn.order).all()
    return [
        {"id": f.id, "name": f.name, "logo_url": f.logo_url, "url": f.url}
        for f in featured
    ]

# Upload endpoint - Spaces
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        print(f"📤 Uploading file: {file.filename}")
        url = await upload_to_spaces(file, folder="images")
        print(f"✅ Upload successful: {url}")
        return {"url": url, "filename": file.filename, "message": "Uploaded successfully"}
    except Exception as e:
        print(f"❌ Upload error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# API endpoint
@app.post("/api/upload")
async def api_upload_file(file: UploadFile = File(...)):
    """Alias for /upload endpoint"""
    try:
        print(f"📤 Uploading file: {file.filename}")
        url = await upload_to_spaces(file, folder="images")
        print(f"✅ Upload successful: {url}")
        return {"url": url, "filename": file.filename, "message": "Uploaded successfully"}
    except Exception as e:
        print(f"❌ Upload error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Daniel Silva Photography API...")
    init_database()
    seed_database()
    
    print("✅ API ready at http://0.0.0.0:8000")
    print("📖 Documentation: http://0.0.0.0:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
