from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from pathlib import Path
from pydantic import BaseModel, EmailStr
import secrets
from passlib.context import CryptContext
from datetime import datetime

from database import get_db
from models import Booking, User, Inquiry, Invoice, ServicePackage, ContactMessage, FaqItem, AlaCarteService, FeaturedIn
from schemas import BookingResponse, InvoiceResponse
from routers.auth import get_current_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ABOUT_FILE = Path(__file__).parent.parent / "about_data.json"

DEFAULT_ABOUT = {
    "photo_url": "/images/daniel-silva.jpg",
    "bio_heading": "Premium Photography",
    "bio_since": "Since 2009",
    "bio_paragraphs": [
        "Daniel Silva is a passionate photographer dedicated to capturing life's most important moments. With over 15 years of experience, he specializes in wedding, quinceañera, and event photography.",
        "His approach combines technical expertise with artistic vision, ensuring every photo tells a story. Daniel believes in building genuine relationships with clients to understand and deliver on their unique vision.",
        "When not behind the camera, Daniel mentors emerging photographers and explores new locations for stunning backdrops across the Southwest.",
    ],
    "stats": [
        {"value": "500+", "label": "Events Photographed"},
        {"value": "15+", "label": "Years of Experience"},
        {"value": "100%", "label": "Client Satisfaction"},
    ],
}

router = APIRouter()

@router.get("/dashboard")
async def get_admin_dashboard(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Get admin dashboard stats"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "confirmed").count()
    pending_inquiries = db.query(Inquiry).filter(Inquiry.status == "new").count()
    
    # Calculate revenue
    paid_invoices = db.query(Invoice).filter(Invoice.status == "paid").all()
    total_revenue = sum(inv.amount for inv in paid_invoices)
    
    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_inquiries": pending_inquiries,
        "total_revenue": total_revenue
    }

@router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings(
    status: str = None,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Get all bookings (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    
    bookings = query.all()
    return [BookingResponse.model_validate(b) for b in bookings]

@router.post("/bookings/{booking_id}/send-invoice")
async def send_invoice(
    booking_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Send invoice to client"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Create invoice
    invoice_number = f"INV-{booking_id}-001"
    invoice = Invoice(
        booking_id=booking_id,
        invoice_number=invoice_number,
        amount=booking.total_price,
        status="sent"
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    # In production, send email via SendGrid
    
    return InvoiceResponse.model_validate(invoice)

@router.post("/bookings/{booking_id}/mark-complete")
async def mark_booking_complete(
    booking_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Mark booking as completed"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "completed"
    booking.deliverables_ready = True
    db.commit()
    db.refresh(booking)
    
    return BookingResponse.model_validate(booking)

@router.get("/reports/revenue")
async def get_revenue_report(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Get revenue report"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    invoices = db.query(Invoice).all()
    paid_invoices = [inv for inv in invoices if inv.status == "paid"]
    
    total_revenue = sum(inv.amount for inv in paid_invoices)
    pending_revenue = sum(inv.amount for inv in invoices if inv.status in ["draft", "sent"])
    
    return {
        "total_revenue": total_revenue,
        "pending_revenue": pending_revenue,
        "paid_invoices": len(paid_invoices),
        "total_invoices": len(invoices)
    }

@router.get("/about")
async def get_about_data(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Get about section data"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    if ABOUT_FILE.exists():
        return json.loads(ABOUT_FILE.read_text())
    return DEFAULT_ABOUT

@router.put("/about")
async def update_about_data(
    data: dict,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Update about section data"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    ABOUT_FILE.write_text(json.dumps(data, indent=2))
    return {"message": "About section updated successfully"}

# Package Management Schemas
class PackageCreate(BaseModel):
    name: str
    description: str
    price: float
    deliverables: str  # JSON string
    is_active: bool = True

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    deliverables: Optional[str] = None
    is_active: Optional[bool] = None

class PackageResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    deliverables: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Package endpoints
@router.get("/packages", response_model=List[PackageResponse])
async def get_all_packages(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Get all service packages (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    packages = db.query(ServicePackage).all()
    return [PackageResponse.model_validate(p) for p in packages]

@router.get("/packages/{package_id}", response_model=PackageResponse)
async def get_package(
    package_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Get a single package by ID (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    package = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    return PackageResponse.model_validate(package)

@router.post("/packages", response_model=PackageResponse)
async def create_package(
    data: PackageCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Create a new service package (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    package = ServicePackage(
        name=data.name,
        description=data.description,
        price=data.price,
        deliverables=data.deliverables,
        is_active=data.is_active
    )
    
    db.add(package)
    db.commit()
    db.refresh(package)
    
    return PackageResponse.model_validate(package)

@router.put("/packages/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: int,
    data: PackageUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Update a service package (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    package = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Update fields if provided
    if data.name is not None:
        package.name = data.name
    if data.description is not None:
        package.description = data.description
    if data.price is not None:
        package.price = data.price
    if data.deliverables is not None:
        package.deliverables = data.deliverables
    if data.is_active is not None:
        package.is_active = data.is_active
    
    db.commit()
    db.refresh(package)
    
    return PackageResponse.model_validate(package)

@router.delete("/packages/{package_id}")
async def delete_package(
    package_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Delete a service package (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    package = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    db.delete(package)
    db.commit()
    
    return {"message": "Package deleted successfully"}


# User Management Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "client"  # admin or client

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserPasswordReset(BaseModel):
    password: str

class UserAdminResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: str = "client"
    is_active: bool = True
    is_admin: bool = False
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# User Management Endpoints
@router.get("/users", response_model=List[UserAdminResponse])
async def list_users(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Get all users (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = db.query(User).all()
    return [UserAdminResponse.model_validate(u) for u in users]

@router.get("/users/{user_id}", response_model=UserAdminResponse)
async def get_user(
    user_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Get a single user by ID (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserAdminResponse.model_validate(user)

@router.post("/users", response_model=UserAdminResponse)
async def create_user(
    data: UserCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Create a new user (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate username from email
    username = data.email.split("@")[0]
    # Ensure unique username
    counter = 1
    base_username = username
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1
    
    # Hash password
    hashed_password = pwd_context.hash(data.password)
    
    # Determine is_admin based on role
    is_admin = data.role == "admin"
    
    user = User(
        email=data.email,
        username=username,
        full_name=data.full_name,
        hashed_password=hashed_password,
        role=data.role,
        is_admin=is_admin,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return UserAdminResponse.model_validate(user)

@router.put("/users/{user_id}", response_model=UserAdminResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Update a user (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email is being changed and if it's unique
    if data.email and data.email != user.email:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
    
    if data.full_name is not None:
        user.full_name = data.full_name
    
    if data.role is not None:
        user.role = data.role
        user.is_admin = data.role == "admin"
    
    if data.is_active is not None:
        user.is_active = data.is_active
    
    db.commit()
    db.refresh(user)
    
    return UserAdminResponse.model_validate(user)

@router.put("/users/{user_id}/password", response_model=dict)
async def reset_user_password(
    user_id: int,
    data: UserPasswordReset,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Reset user password (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not data.password or len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    user.hashed_password = pwd_context.hash(data.password)
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    """Soft-delete a user (admin only) - marks as inactive"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deletion of self
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    # Soft delete - mark as inactive
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}




# Contact Messages
@router.get("/contact")
async def get_contact_messages(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "phone": m.phone,
            "message": m.message,
            "status": m.status,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]

# FAQ Items
@router.get("/faq")
async def get_faq_items(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    items = db.query(FaqItem).order_by(FaqItem.order).all()
    return [
        {"id": f.id, "question": f.question, "answer": f.answer, "is_active": f.is_active, "order": f.order}
        for f in items
    ]

@router.post("/faq")
async def create_faq_item(
    question: str,
    answer: str,
    is_active: bool = True,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    faq = FaqItem(question=question, answer=answer, is_active=is_active)
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return {"id": faq.id, "question": faq.question}

@router.put("/faq/{faq_id}")
async def update_faq_item(
    faq_id: int,
    question: Optional[str] = None,
    answer: Optional[str] = None,
    is_active: Optional[bool] = None,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    faq = db.query(FaqItem).filter(FaqItem.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    if question:
        faq.question = question
    if answer:
        faq.answer = answer
    if is_active is not None:
        faq.is_active = is_active
    
    db.commit()
    db.refresh(faq)
    return {"id": faq.id, "question": faq.question}

@router.delete("/faq/{faq_id}")
async def delete_faq_item(
    faq_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    faq = db.query(FaqItem).filter(FaqItem.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    db.delete(faq)
    db.commit()
    return {"message": "FAQ deleted"}

# A La Carte Services
@router.get("/services")
async def get_services(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    services = db.query(AlaCarteService).order_by(AlaCarteService.order).all()
    return [
        {"id": s.id, "name": s.name, "description": s.description, "price": s.price, "is_active": s.is_active}
        for s in services
    ]

@router.post("/services")
async def create_service(
    name: str,
    price: float,
    description: str = "",
    is_active: bool = True,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service = AlaCarteService(name=name, description=description, price=price, is_active=is_active)
    db.add(service)
    db.commit()
    db.refresh(service)
    return {"id": service.id, "name": service.name, "price": service.price}

@router.put("/services/{service_id}")
async def update_service(
    service_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    price: Optional[float] = None,
    is_active: Optional[bool] = None,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service = db.query(AlaCarteService).filter(AlaCarteService.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    if name:
        service.name = name
    if description:
        service.description = description
    if price is not None:
        service.price = price
    if is_active is not None:
        service.is_active = is_active
    
    db.commit()
    db.refresh(service)
    return {"id": service.id, "name": service.name}

@router.delete("/services/{service_id}")
async def delete_service(
    service_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service = db.query(AlaCarteService).filter(AlaCarteService.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(service)
    db.commit()
    return {"message": "Service deleted"}
