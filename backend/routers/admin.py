from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from pathlib import Path
from pydantic import BaseModel, EmailStr, ConfigDict
import secrets
from passlib.context import CryptContext
from datetime import datetime

from database import get_db
from models import Booking, User, Inquiry, Invoice, ServicePackage, ContactMessage, FaqItem, AlaCarteService, FeaturedIn, Portfolio
from schemas import BookingResponse, InvoiceResponse
from routers.auth import get_current_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ABOUT_FILE = Path(__file__).parent.parent / "about_data.json"

DEFAULT_ABOUT = {
    "photographer_name": "Daniel Silva",
    "bio": "Daniel Silva is a passionate photographer dedicated to capturing life's most important moments. With over 15 years of experience, he specializes in wedding, quinceañera, and event photography.",
    "photo_url": "/images/daniel-silva.jpg",
    "events_photographed": 500,
    "years_experience": 15,
    "client_satisfaction": 100,
}

# Pydantic Schemas — all fields Optional with defaults, extra='ignore' everywhere
class CreateFaqRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    question: Optional[str] = ""
    answer: Optional[str] = ""
    is_active: Optional[bool] = True
    order: Optional[int] = 0

class UpdateFaqRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    question: Optional[str] = None
    answer: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class CreateServiceRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: Optional[str] = ""
    description: Optional[str] = ""
    price: Optional[float] = 0.0
    is_active: Optional[bool] = True

class UpdateServiceRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

class UpdateAboutRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    photographer_name: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    events_photographed: Optional[int] = None
    years_experience: Optional[int] = None
    client_satisfaction: Optional[int] = None

class PackageCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: Optional[str] = ""
    description: Optional[str] = ""
    price: Optional[float] = 0.0
    deliverables: Optional[str] = ""
    is_active: Optional[bool] = True

class PackageUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    deliverables: Optional[str] = None
    is_active: Optional[bool] = None

class PackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = 0.0
    deliverables: Optional[str] = None
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None

class UserCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    email: Optional[EmailStr] = None
    password: Optional[str] = ""
    full_name: Optional[str] = ""
    role: Optional[str] = "client"

class UserUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserPasswordReset(BaseModel):
    model_config = ConfigDict(extra='ignore')
    password: Optional[str] = ""

class UserAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = "client"
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False
    created_at: Optional[datetime] = None

class PortfolioItemCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    title: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = "Weddings"
    image_url: Optional[str] = ""

class PortfolioItemUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    status: Optional[str] = "pending"

class InquiryStatusUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    status: Optional[str] = "new"


router = APIRouter()

@router.get("/dashboard")
async def get_admin_dashboard(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "confirmed").count()
    pending_inquiries = db.query(Inquiry).filter(Inquiry.status == "new").count()
    
    paid_invoices = db.query(Invoice).filter(Invoice.status == "paid").all()
    total_revenue = sum(inv.amount for inv in paid_invoices)
    
    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_inquiries": pending_inquiries,
        "total_revenue": total_revenue
    }

@router.get("/bookings")
async def get_all_bookings(
    status: str = None,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)

    bookings = query.order_by(Booking.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "client_name": b.client.full_name if b.client else "",
            "client_email": b.client.email if b.client else "",
            "client_phone": b.client.phone if b.client else "",
            "service_type": b.service_type or "",
            "event_date": b.event_date.isoformat() if b.event_date else None,
            "event_location": b.event_location or "",
            "package": b.package or "",
            "price": b.price or 0,
            "status": b.status,
            "payment_status": b.payment_status,
            "notes": b.notes or "",
            "created_at": b.created_at.isoformat() if b.created_at else None,
        }
        for b in bookings
    ]

@router.patch("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = data.status
    db.commit()
    db.refresh(booking)

    return {
        "id": booking.id,
        "client_name": booking.client.full_name if booking.client else "",
        "client_email": booking.client.email if booking.client else "",
        "client_phone": booking.client.phone if booking.client else "",
        "service_type": booking.service_type or "",
        "event_date": booking.event_date.isoformat() if booking.event_date else None,
        "event_location": booking.event_location or "",
        "package": booking.package or "",
        "price": booking.price or 0,
        "status": booking.status,
        "payment_status": booking.payment_status,
        "notes": booking.notes or "",
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
    }

@router.delete("/bookings/{booking_id}")
async def delete_booking(
    booking_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted successfully"}

@router.get("/inquiries")
async def get_all_inquiries(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiries = db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()
    return [
        {
            "id": i.id,
            "email": i.email,
            "full_name": i.full_name or "",
            "phone": i.phone or "",
            "service_type": i.service_type or "",
            "event_date": i.event_date.isoformat() if i.event_date else None,
            "message": i.message or "",
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        }
        for i in inquiries
    ]

@router.patch("/inquiries/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: int,
    data: InquiryStatusUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    inquiry.status = data.status
    db.commit()
    db.refresh(inquiry)

    return {
        "id": inquiry.id,
        "email": inquiry.email,
        "full_name": inquiry.full_name or "",
        "phone": inquiry.phone or "",
        "service_type": inquiry.service_type or "",
        "event_date": inquiry.event_date.isoformat() if inquiry.event_date else None,
        "message": inquiry.message or "",
        "status": inquiry.status,
        "created_at": inquiry.created_at.isoformat() if inquiry.created_at else None,
    }

@router.delete("/inquiries/{inquiry_id}")
async def delete_inquiry(
    inquiry_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    db.delete(inquiry)
    db.commit()
    return {"message": "Inquiry deleted successfully"}

@router.post("/bookings/{booking_id}/send-invoice")
async def send_invoice(
    booking_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    invoice_number = f"INV-{booking_id}-001"
    invoice = Invoice(
        booking_id=booking_id,
        invoice_number=invoice_number,
        amount=booking.price or 0,
        status="sent"
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    return InvoiceResponse.model_validate(invoice)

@router.post("/bookings/{booking_id}/mark-complete")
async def mark_booking_complete(
    booking_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    if ABOUT_FILE.exists():
        stored = json.loads(ABOUT_FILE.read_text())
        if "bio_paragraphs" in stored or "stats" in stored:
            return DEFAULT_ABOUT
        return stored
    return DEFAULT_ABOUT

@router.post("/about")
async def update_about_data(
    data: UpdateAboutRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    about_data = {
        "photographer_name": data.photographer_name if data.photographer_name is not None else DEFAULT_ABOUT["photographer_name"],
        "bio": data.bio if data.bio is not None else DEFAULT_ABOUT["bio"],
        "photo_url": data.photo_url if data.photo_url is not None else DEFAULT_ABOUT["photo_url"],
        "events_photographed": data.events_photographed if data.events_photographed is not None else DEFAULT_ABOUT["events_photographed"],
        "years_experience": data.years_experience if data.years_experience is not None else DEFAULT_ABOUT["years_experience"],
        "client_satisfaction": data.client_satisfaction if data.client_satisfaction is not None else DEFAULT_ABOUT["client_satisfaction"],
    }
    ABOUT_FILE.write_text(json.dumps(about_data, indent=2))
    return about_data

@router.put("/about")
async def put_about_data(
    data: UpdateAboutRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    about_data = {
        "photographer_name": data.photographer_name if data.photographer_name is not None else DEFAULT_ABOUT["photographer_name"],
        "bio": data.bio if data.bio is not None else DEFAULT_ABOUT["bio"],
        "photo_url": data.photo_url if data.photo_url is not None else DEFAULT_ABOUT["photo_url"],
        "events_photographed": data.events_photographed if data.events_photographed is not None else DEFAULT_ABOUT["events_photographed"],
        "years_experience": data.years_experience if data.years_experience is not None else DEFAULT_ABOUT["years_experience"],
        "client_satisfaction": data.client_satisfaction if data.client_satisfaction is not None else DEFAULT_ABOUT["client_satisfaction"],
    }
    ABOUT_FILE.write_text(json.dumps(about_data, indent=2))
    return about_data

@router.get("/packages", response_model=List[PackageResponse])
async def get_all_packages(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    package = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    package = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    db.delete(package)
    db.commit()
    
    return {"message": "Package deleted successfully"}

@router.get("/users", response_model=List[UserAdminResponse])
async def list_users(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    username = data.email.split("@")[0]
    counter = 1
    base_username = username
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1
    
    hashed_password = pwd_context.hash(data.password)
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
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
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}

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
    faq_data: CreateFaqRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    faq = FaqItem(question=faq_data.question, answer=faq_data.answer, is_active=faq_data.is_active)
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return {"id": faq.id, "question": faq.question, "answer": faq.answer, "is_active": faq.is_active, "order": getattr(faq, 'order', 0)}

@router.put("/faq/{faq_id}")
async def update_faq_item(
    faq_id: int,
    data: UpdateFaqRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    faq = db.query(FaqItem).filter(FaqItem.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    if data.question is not None:
        faq.question = data.question
    if data.answer is not None:
        faq.answer = data.answer
    if data.is_active is not None:
        faq.is_active = data.is_active
    if data.order is not None and hasattr(faq, 'order'):
        faq.order = data.order
    
    db.commit()
    db.refresh(faq)
    return {"id": faq.id, "question": faq.question, "answer": faq.answer, "is_active": faq.is_active, "order": getattr(faq, 'order', 0)}

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
    service_data: CreateServiceRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service = AlaCarteService(name=service_data.name, description=service_data.description, price=service_data.price, is_active=service_data.is_active)
    db.add(service)
    db.commit()
    db.refresh(service)
    return {"id": service.id, "name": service.name, "description": service.description, "price": service.price, "is_active": service.is_active}

@router.put("/services/{service_id}")
async def update_service(
    service_id: int,
    data: UpdateServiceRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service = db.query(AlaCarteService).filter(AlaCarteService.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    if data.name is not None:
        service.name = data.name
    if data.description is not None:
        service.description = data.description
    if data.price is not None:
        service.price = data.price
    if data.is_active is not None:
        service.is_active = data.is_active
    
    db.commit()
    db.refresh(service)
    return {"id": service.id, "name": service.name, "description": service.description, "price": service.price, "is_active": service.is_active}

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

@router.get("/portfolio")
async def get_portfolio_items(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    items = db.query(Portfolio).order_by(Portfolio.order).all()
    return [
        {"id": p.id, "title": p.title, "description": p.description, "category": p.category, "image_url": p.image_url}
        for p in items
    ]

@router.post("/portfolio")
async def create_portfolio_item(
    data: PortfolioItemCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    item = Portfolio(
        title=data.title,
        description=data.description or "",
        category=data.category,
        image_url=data.image_url,
        thumbnail_url=data.image_url,
        order=db.query(Portfolio).count() + 1
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "title": item.title, "description": item.description, "category": item.category, "image_url": item.image_url}

@router.put("/portfolio/{item_id}")
async def update_portfolio_item(
    item_id: int,
    data: PortfolioItemUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    item = db.query(Portfolio).filter(Portfolio.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    if data.title is not None:
        item.title = data.title
    if data.description is not None:
        item.description = data.description
    if data.category is not None:
        item.category = data.category
    if data.image_url is not None:
        item.image_url = data.image_url
        item.thumbnail_url = data.image_url
    
    db.commit()
    db.refresh(item)
    return {"id": item.id, "title": item.title, "description": item.description, "category": item.category, "image_url": item.image_url}

@router.delete("/portfolio/{item_id}")
async def delete_portfolio_item(
    item_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    item = db.query(Portfolio).filter(Portfolio.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}
