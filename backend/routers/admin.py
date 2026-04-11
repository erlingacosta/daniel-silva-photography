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

# Pydantic Schemas
class CreateFaqRequest(BaseModel):
    question: str
    answer: str
    is_active: bool = True

class CreateServiceRequest(BaseModel):
    name: str
    description: str = ""
    price: float
    is_active: bool = True

class UpdateAboutRequest(BaseModel):
    photographer_name: Optional[str] = "Daniel Silva"
    bio: Optional[str] = ""
    photo_url: Optional[str] = ""
    events_photographed: Optional[int] = 500
    years_experience: Optional[int] = 15
    client_satisfaction: Optional[int] = 100

    class Config:
        extra = "ignore"  # ignore unknown fields like id, created_at

class PackageCreate(BaseModel):
    name: str
    description: str
    price: float
    deliverables: str
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

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "client"

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

class PortfolioItemCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str = "Weddings"
    image_url: str

class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


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

@router.get("/bookings", response_model=List[BookingResponse])
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
    
    bookings = query.all()
    return [BookingResponse.model_validate(b) for b in bookings]

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
        amount=booking.total_price,
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
        # Normalize: if stored in old nested format, return default instead
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
        "photographer_name": data.photographer_name,
        "bio": data.bio,
        "photo_url": data.photo_url,
        "events_photographed": data.events_photographed,
        "years_experience": data.years_experience,
        "client_satisfaction": data.client_satisfaction,
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
        "photographer_name": data.photographer_name,
        "bio": data.bio,
        "photo_url": data.photo_url,
        "events_photographed": data.events_photographed,
        "years_experience": data.years_experience,
        "client_satisfaction": data.client_satisfaction,
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
