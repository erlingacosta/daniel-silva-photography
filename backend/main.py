import os
import json
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from pathlib import Path
import shutil

from database import get_db, engine, SessionLocal
from models import Base, Portfolio, Testimonial, ServicePackage, Booking, User, Inquiry, NewsletterSubscriber
from routers import auth, admin
from db_seed import seed_admin_user

load_dotenv()

# Create tables on startup (uses SQLAlchemy, not Alembic)
def init_database():
    """Create all tables using SQLAlchemy metadata.create_all().
    This works with limited permissions (only needs CREATE TABLE, not schema ownership).
    """
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized")
    except Exception as e:
        print(f"⚠️  Database initialization error: {e}")

# Seed admin user after tables are created
def seed_database():
    """Seed the database with admin user if needed."""
    try:
        db = SessionLocal()
        seed_admin_user(db)
        db.close()
        print("✅ Database seeding completed")
    except Exception as e:
        print(f"⚠️  Seeding error: {e}")

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
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Admin router
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# Root route
@app.get("/")
def root():
    return {"message": "Daniel Silva Photography API", "version": "1.0.0", "docs": "/docs"}

# Health check endpoints
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/status")
def status():
    return {"status": "Daniel Silva Photography API is running", "version": "1.0.0"}

# Portfolio endpoints
@app.get("/api/portfolios")
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

@app.post("/api/portfolios")
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

@app.put("/api/portfolios/{portfolio_id}")
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

@app.delete("/api/portfolios/{portfolio_id}")
def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    db.delete(portfolio)
    db.commit()
    return {"message": "Deleted successfully", "id": portfolio_id}

# Testimonials endpoints
@app.get("/api/testimonials")
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

@app.post("/api/testimonials")
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
@app.get("/api/packages")
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

@app.post("/api/packages")
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
@app.post("/api/newsletter/subscribe")
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
@app.post("/api/inquiries")
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

@app.get("/api/inquiries")
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
@app.post("/api/bookings")
def create_booking(client_email: str, package_id: int, event_date: str, event_type: str, event_location: str, notes: str, db: Session = Depends(get_db)):
    # Get or create user by email
    user = db.query(User).filter(User.email == client_email).first()
    if not user:
        user = User(email=client_email, username=client_email.split("@")[0])
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Get package
    package = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Create booking
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

@app.get("/api/bookings")
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

# File upload endpoint for portfolios
@app.post("/api/upload/portfolio")
async def upload_portfolio(file: UploadFile = File(...)):
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/portfolios")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "filename": file.filename,
        "url": f"/uploads/portfolios/{file.filename}",
        "message": "File uploaded successfully"
    }

if __name__ == "__main__":
    import uvicorn
    # Initialize database before starting server
    init_database()
    seed_database()
    uvicorn.run(app, host="0.0.0.0", port=8000)
