from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from pathlib import Path
from pydantic import BaseModel, EmailStr, ConfigDict
from passlib.context import CryptContext
from datetime import datetime

from database import get_db
from models import (
    Booking, User, Inquiry, Invoice, ServicePackage,
    ContactMessage, FaqItem, AlaCarteService, FeaturedIn, Portfolio,
    Message, ClientGallery
)
from spaces import upload_to_spaces
from routers.auth import get_current_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ABOUT_FILE = Path(__file__).parent.parent / "about_data.json"

DEFAULT_ABOUT = {
    "photographer_name": "Daniel Silva",
    "bio": "Daniel Silva is a passionate photographer dedicated to capturing life's most important moments.",
    "photo_url": "",
    "events_photographed": 500,
    "years_experience": 15,
    "client_satisfaction": 100,
}

# ---------------------------------------------------------------------------
# Request / Response schemas — all fields Optional + extra='ignore'
# ---------------------------------------------------------------------------

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
    price: Optional[float] = None
    deliverables: Optional[str] = None
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None


class UserCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    email: Optional[str] = None
    password: Optional[str] = ""
    full_name: Optional[str] = ""
    role: Optional[str] = "client"


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserPasswordReset(BaseModel):
    model_config = ConfigDict(extra='ignore')
    password: Optional[str] = ""


class UserAdminResponse(BaseModel):
    # Fields that actually exist in users table
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = "user"
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


class InquiryUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    status: Optional[str] = None


class ConvertInquiryRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    package_id: Optional[int] = None
    event_date: Optional[str] = None
    event_type: Optional[str] = None
    event_location: Optional[str] = None
    total_price: Optional[float] = None
    deposit_amount: Optional[float] = 0.0
    deposit_due_date: Optional[str] = None
    contract_notes: Optional[str] = None
    internal_notes: Optional[str] = None


class BookingGeneralUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    client_email: Optional[str] = None
    package_id: Optional[int] = None
    event_date: Optional[str] = None
    event_type: Optional[str] = None
    event_location: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    internal_notes: Optional[str] = None
    contract_notes: Optional[str] = None
    total_price: Optional[float] = None
    deposit_paid: Optional[bool] = None
    deposit_amount: Optional[float] = None
    deposit_due_date: Optional[str] = None
    deliverables_ready: Optional[bool] = None


class CreateBookingRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    client_email: Optional[str] = None
    package_id: Optional[int] = None
    event_date: Optional[str] = None
    event_type: Optional[str] = None
    event_location: Optional[str] = None
    total_price: Optional[float] = None
    deposit_amount: Optional[float] = 0.0
    deposit_due_date: Optional[str] = None
    contract_notes: Optional[str] = None
    internal_notes: Optional[str] = None


class DepositUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    deposit_paid: Optional[bool] = True
    deposit_amount: Optional[float] = None


class SendMessageRequest(BaseModel):
    model_config = ConfigDict(extra='ignore')
    content: Optional[str] = ""


class GalleryVisibilityUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    is_visible: Optional[bool] = True


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


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

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
    total_revenue = sum(inv.amount or 0 for inv in paid_invoices)

    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_inquiries": pending_inquiries,
        "total_revenue": total_revenue,
    }


# --- Bookings ---
# DB columns: id, client_id, package_id, event_date, event_type, event_location,
#             notes, status, total_price, deposit_paid, payment_intent_id,
#             deliverables_ready, created_at, updated_at

def _booking_dict(b: Booking) -> dict:
    return {
        "id": b.id,
        "client_id": b.client_id,
        "client_name": b.client.full_name if b.client else "",
        "client_email": b.client.email if b.client else "",
        "client_phone": b.client.phone if b.client else "",
        "package_id": b.package_id,
        "package_name": b.package_rel.name if b.package_rel else "",
        "package_price": b.package_rel.price if b.package_rel else 0,
        "event_type": b.event_type or "",
        "event_date": b.event_date.isoformat() if b.event_date else None,
        "event_location": b.event_location or "",
        "status": b.status or "pending",
        "total_price": b.total_price or 0,
        "deposit_paid": b.deposit_paid or False,
        "deposit_amount": b.deposit_amount or 0,
        "deposit_due_date": b.deposit_due_date or "",
        "contract_notes": b.contract_notes or "",
        "internal_notes": b.internal_notes or "",
        "notes": b.notes or "",
        "created_at": b.created_at.isoformat() if b.created_at else None,
        "updated_at": b.updated_at.isoformat() if b.updated_at else None,
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
    return [_booking_dict(b) for b in bookings]


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
    return _booking_dict(booking)


@router.post("/bookings")
async def create_booking(
    data: CreateBookingRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    import uuid
    user = db.query(User).filter(User.email == data.client_email).first()
    created_user = False
    if not user:
        user = User(
            email=data.client_email,
            username=data.client_email,
            hashed_password=str(uuid.uuid4()),
            is_active=True,
            is_admin=False,
            role="client",
        )
        db.add(user)
        db.flush()
        created_user = True

    event_date_obj = None
    if data.event_date:
        try:
            event_date_obj = datetime.fromisoformat(data.event_date)
        except Exception:
            pass

    booking = Booking(
        client_id=user.id,
        package_id=data.package_id,
        event_date=event_date_obj,
        event_type=data.event_type or "",
        event_location=data.event_location or "",
        total_price=data.total_price or 0,
        deposit_amount=data.deposit_amount or 0,
        deposit_due_date=data.deposit_due_date or "",
        contract_notes=data.contract_notes or "",
        internal_notes=data.internal_notes or "",
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return {**_booking_dict(booking), "created_user": created_user}


@router.put("/bookings/{booking_id}")
async def update_booking_full(
    booking_id: int,
    data: BookingGeneralUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if data.event_type is not None: booking.event_type = data.event_type
    if data.event_location is not None: booking.event_location = data.event_location
    if data.event_date is not None:
        try:
            booking.event_date = datetime.fromisoformat(data.event_date)
        except Exception:
            pass
    if data.package_id is not None: booking.package_id = data.package_id
    if data.status is not None: booking.status = data.status
    if data.notes is not None: booking.notes = data.notes
    if data.internal_notes is not None: booking.internal_notes = data.internal_notes
    if data.contract_notes is not None: booking.contract_notes = data.contract_notes
    if data.total_price is not None: booking.total_price = data.total_price
    if data.deposit_paid is not None: booking.deposit_paid = data.deposit_paid
    if data.deposit_amount is not None: booking.deposit_amount = data.deposit_amount
    if data.deposit_due_date is not None: booking.deposit_due_date = data.deposit_due_date
    if data.deliverables_ready is not None: booking.deliverables_ready = data.deliverables_ready

    db.commit()
    db.refresh(booking)
    return _booking_dict(booking)


@router.patch("/bookings/{booking_id}")
async def update_booking(
    booking_id: int,
    data: BookingGeneralUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    return await update_booking_full(booking_id, data, authorization, db)


@router.patch("/bookings/{booking_id}/deposit")
async def update_booking_deposit(
    booking_id: int,
    data: DepositUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if data.deposit_paid is not None: booking.deposit_paid = data.deposit_paid
    if data.deposit_amount is not None: booking.deposit_amount = data.deposit_amount
    db.commit()
    db.refresh(booking)
    return _booking_dict(booking)


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
    return {"message": "Booking deleted"}


# --- Inquiries ---
# DB columns: id, sender_id, email, name, phone, event_type, event_date (varchar),
#             message, status, created_at

def _inquiry_dict(i: Inquiry) -> dict:
    return {
        "id": i.id,
        "name": i.name or "",
        "email": i.email or "",
        "phone": i.phone or "",
        "event_type": i.event_type or "",
        "event_date": i.event_date or None,   # stored as varchar
        "message": i.message or "",
        "status": i.status or "new",
        "created_at": i.created_at.isoformat() if i.created_at else None,
        "converted_to_booking_id": i.converted_to_booking_id,
    }


@router.get("/inquiries")
async def get_all_inquiries(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiries = db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()
    return [_inquiry_dict(i) for i in inquiries]


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
    return _inquiry_dict(inquiry)


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
    return {"message": "Inquiry deleted"}


@router.patch("/inquiries/{inquiry_id}")
async def update_inquiry(
    inquiry_id: int,
    data: InquiryUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    if data.status is not None:
        inquiry.status = data.status
    db.commit()
    db.refresh(inquiry)
    return _inquiry_dict(inquiry)


@router.post("/inquiries/{inquiry_id}/convert")
async def convert_inquiry_to_booking(
    inquiry_id: int,
    data: ConvertInquiryRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    # Find or create user by email
    user = db.query(User).filter(User.email == data.client_email).first()
    created_user = False
    if not user:
        import secrets
        base_username = (data.client_email or "client").split("@")[0]
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
        user = User(
            email=data.client_email,
            username=username,
            full_name=data.client_name or "",
            phone=data.client_phone or "",
            hashed_password=pwd_context.hash(secrets.token_hex(16)),
            is_active=True,
            is_admin=False,
            role="client",
        )
        db.add(user)
        db.flush()
        created_user = True

    # Parse event_date
    event_date_obj = None
    if data.event_date:
        try:
            from datetime import datetime as dt
            event_date_obj = dt.fromisoformat(data.event_date)
        except Exception:
            event_date_obj = None

    # Create booking
    booking = Booking(
        client_id=user.id,
        package_id=data.package_id,
        event_date=event_date_obj,
        event_type=data.event_type or inquiry.event_type or "",
        event_location=data.event_location or "",
        total_price=data.total_price or 0.0,
        deposit_amount=data.deposit_amount or 0.0,
        deposit_due_date=data.deposit_due_date or "",
        contract_notes=data.contract_notes or "",
        internal_notes=data.internal_notes or "",
        status="pending",
    )
    db.add(booking)
    db.flush()

    # Mark inquiry as converted
    inquiry.status = "converted"
    inquiry.converted_to_booking_id = booking.id
    db.commit()
    db.refresh(booking)

    return {"booking_id": booking.id, "user_id": user.id, "created_user": created_user}


# --- About ---

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
@router.put("/about")
async def update_about_data(
    data: UpdateAboutRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    about_data = {
        "photographer_name": data.photographer_name or DEFAULT_ABOUT["photographer_name"],
        "bio": data.bio or DEFAULT_ABOUT["bio"],
        "photo_url": data.photo_url if data.photo_url is not None else DEFAULT_ABOUT["photo_url"],
        "events_photographed": data.events_photographed if data.events_photographed is not None else DEFAULT_ABOUT["events_photographed"],
        "years_experience": data.years_experience if data.years_experience is not None else DEFAULT_ABOUT["years_experience"],
        "client_satisfaction": data.client_satisfaction if data.client_satisfaction is not None else DEFAULT_ABOUT["client_satisfaction"],
    }
    ABOUT_FILE.write_text(json.dumps(about_data, indent=2))
    return about_data


# --- Packages ---

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


@router.post("/packages", response_model=PackageResponse)
async def create_package(
    data: PackageCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    pkg = ServicePackage(
        name=data.name, description=data.description,
        price=data.price, deliverables=data.deliverables, is_active=data.is_active
    )
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return PackageResponse.model_validate(pkg)


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

    pkg = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    if data.name is not None: pkg.name = data.name
    if data.description is not None: pkg.description = data.description
    if data.price is not None: pkg.price = data.price
    if data.deliverables is not None: pkg.deliverables = data.deliverables
    if data.is_active is not None: pkg.is_active = data.is_active

    db.commit()
    db.refresh(pkg)
    return PackageResponse.model_validate(pkg)


@router.delete("/packages/{package_id}")
async def delete_package(
    package_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    pkg = db.query(ServicePackage).filter(ServicePackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    db.delete(pkg)
    db.commit()
    return {"message": "Package deleted"}


# --- Users ---

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


@router.post("/users", response_model=UserAdminResponse)
async def create_user(
    data: UserCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    username = data.email.split("@")[0]
    base = username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base}{counter}"
        counter += 1

    user = User(
        email=data.email,
        username=username,
        full_name=data.full_name,
        hashed_password=pwd_context.hash(data.password),
        role=data.role,
        is_admin=(data.role == "admin"),
        is_active=True,
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
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
    if data.full_name is not None: user.full_name = data.full_name
    if data.role is not None:
        user.role = data.role
        user.is_admin = (data.role == "admin")
    if data.is_active is not None: user.is_active = data.is_active

    db.commit()
    db.refresh(user)
    return UserAdminResponse.model_validate(user)


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
    return {"message": "User deactivated"}


# --- Contact messages ---
# DB columns: id, name, email, phone, message, status, created_at

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
            "name": m.name or "",
            "email": m.email or "",
            "phone": m.phone or "",
            "message": m.message or "",
            "status": m.status or "unread",
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]


# --- FAQ ---
# DB columns: id, question, answer, order, is_active, created_at

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
        {"id": f.id, "question": f.question, "answer": f.answer,
         "is_active": f.is_active, "order": f.order}
        for f in items
    ]


@router.post("/faq")
async def create_faq_item(
    data: CreateFaqRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    faq = FaqItem(question=data.question, answer=data.answer,
                  is_active=data.is_active, order=data.order or 0)
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return {"id": faq.id, "question": faq.question, "answer": faq.answer,
            "is_active": faq.is_active, "order": faq.order}


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

    if data.question is not None: faq.question = data.question
    if data.answer is not None: faq.answer = data.answer
    if data.is_active is not None: faq.is_active = data.is_active
    if data.order is not None: faq.order = data.order

    db.commit()
    db.refresh(faq)
    return {"id": faq.id, "question": faq.question, "answer": faq.answer,
            "is_active": faq.is_active, "order": faq.order}


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


# --- À La Carte Services ---
# DB columns: id, name, description, price, is_active, order, created_at

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
        {"id": s.id, "name": s.name, "description": s.description,
         "price": s.price, "is_active": s.is_active}
        for s in services
    ]


@router.post("/services")
async def create_service(
    data: CreateServiceRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    service = AlaCarteService(
        name=data.name, description=data.description,
        price=data.price, is_active=data.is_active
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return {"id": service.id, "name": service.name, "description": service.description,
            "price": service.price, "is_active": service.is_active}


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

    if data.name is not None: service.name = data.name
    if data.description is not None: service.description = data.description
    if data.price is not None: service.price = data.price
    if data.is_active is not None: service.is_active = data.is_active

    db.commit()
    db.refresh(service)
    return {"id": service.id, "name": service.name, "description": service.description,
            "price": service.price, "is_active": service.is_active}


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


# --- Portfolio ---
# DB columns: id, title, description, category, image_url, thumbnail_url, order, created_at

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
        {"id": p.id, "title": p.title, "description": p.description,
         "category": p.category, "image_url": p.image_url}
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
        title=data.title, description=data.description or "",
        category=data.category, image_url=data.image_url,
        thumbnail_url=data.image_url,
        order=db.query(Portfolio).count() + 1
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "title": item.title, "description": item.description,
            "category": item.category, "image_url": item.image_url}


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

    if data.title is not None: item.title = data.title
    if data.description is not None: item.description = data.description
    if data.category is not None: item.category = data.category
    if data.image_url is not None:
        item.image_url = data.image_url
        item.thumbnail_url = data.image_url

    db.commit()
    db.refresh(item)
    return {"id": item.id, "title": item.title, "description": item.description,
            "category": item.category, "image_url": item.image_url}


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


# ---------------------------------------------------------------------------
# Client Management
# ---------------------------------------------------------------------------

@router.get("/clients")
async def list_clients(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    users = db.query(User).filter(User.is_admin == False).order_by(User.id.desc()).all()
    result = []
    for u in users:
        booking = (
            db.query(Booking)
            .filter(Booking.client_id == u.id)
            .order_by(Booking.created_at.desc())
            .first()
        )
        booking_info = None
        if booking:
            pkg = db.query(ServicePackage).filter(ServicePackage.id == booking.package_id).first()
            booking_info = {
                "id": booking.id,
                "status": booking.status or "pending",
                "event_date": booking.event_date.isoformat() if booking.event_date else None,
                "event_type": booking.event_type or "",
                "package_name": pkg.name if pkg else "",
            }
        result.append({
            "id": u.id,
            "email": u.email or "",
            "full_name": u.full_name or "",
            "phone": u.phone or "",
            "role": u.role or "client",
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "booking": booking_info,
        })
    return result


@router.get("/clients/{client_id}")
async def get_client_detail(
    client_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.id == client_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Client not found")

    booking = (
        db.query(Booking)
        .filter(Booking.client_id == client_id)
        .order_by(Booking.created_at.desc())
        .first()
    )

    booking_info = None
    messages_list = []
    gallery_list = []
    message_count = 0
    gallery_count = 0

    if booking:
        pkg = db.query(ServicePackage).filter(ServicePackage.id == booking.package_id).first()
        booking_info = {
            "id": booking.id,
            "client_id": booking.client_id,
            "package_id": booking.package_id,
            "package_name": pkg.name if pkg else "",
            "event_date": booking.event_date.isoformat() if booking.event_date else None,
            "event_type": booking.event_type or "",
            "event_location": booking.event_location or "",
            "status": booking.status or "pending",
            "total_price": booking.total_price or 0,
            "deposit_paid": booking.deposit_paid or False,
            "deposit_amount": booking.deposit_amount or 0,
            "deposit_due_date": booking.deposit_due_date or "",
            "contract_notes": booking.contract_notes or "",
            "internal_notes": booking.internal_notes or "",
            "notes": booking.notes or "",
        }

        msgs = db.query(Message).filter(Message.booking_id == booking.id).order_by(Message.created_at.asc()).all()
        message_count = len(msgs)
        for m in msgs:
            sender = db.query(User).filter(User.id == m.sender_id).first()
            messages_list.append({
                "id": m.id,
                "content": m.content or "",
                "sender_id": m.sender_id,
                "sender_name": sender.full_name if sender else "Unknown",
                "is_read": m.is_read or False,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            })

        gallery = db.query(ClientGallery).filter(ClientGallery.booking_id == booking.id).order_by(ClientGallery.created_at.desc()).all()
        gallery_count = len(gallery)
        for g in gallery:
            gallery_list.append({
                "id": g.id,
                "image_url": g.image_url or "",
                "caption": g.caption or "",
                "is_visible": g.is_visible,
                "created_at": g.created_at.isoformat() if g.created_at else None,
            })

    return {
        "user": {
            "id": user.id,
            "email": user.email or "",
            "full_name": user.full_name or "",
            "phone": user.phone or "",
            "bio": user.bio or "",
            "profile_image": user.profile_image or "",
        },
        "booking": booking_info,
        "message_count": message_count,
        "gallery_count": gallery_count,
        "messages": messages_list,
        "gallery": gallery_list,
    }


@router.post("/clients/{client_id}/messages")
async def admin_send_message(
    client_id: int,
    data: SendMessageRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    booking = (
        db.query(Booking)
        .filter(Booking.client_id == client_id)
        .order_by(Booking.created_at.desc())
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="No booking found for this client")

    msg = Message(
        booking_id=booking.id,
        sender_id=current_user.id,
        content=data.content,
        is_read=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "content": msg.content,
        "sender_id": msg.sender_id,
        "sender_name": current_user.full_name or current_user.email or "Admin",
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@router.post("/gallery/upload")
async def upload_gallery_photo(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    booking_id: int = Form(...),
    caption: Optional[str] = Form(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    image_url = await upload_to_spaces(file, folder="gallery")

    gallery_item = ClientGallery(
        booking_id=booking_id,
        user_id=user_id,
        image_url=image_url,
        caption=caption or "",
        is_visible=True,
    )
    db.add(gallery_item)
    db.commit()
    db.refresh(gallery_item)
    return {
        "id": gallery_item.id,
        "image_url": gallery_item.image_url,
        "caption": gallery_item.caption,
    }


@router.patch("/gallery/{gallery_id}")
async def update_gallery_visibility(
    gallery_id: int,
    data: GalleryVisibilityUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    item = db.query(ClientGallery).filter(ClientGallery.id == gallery_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    item.is_visible = data.is_visible
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "image_url": item.image_url,
        "caption": item.caption,
        "is_visible": item.is_visible,
    }


@router.delete("/gallery/{gallery_id}")
async def delete_gallery_item(
    gallery_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    item = db.query(ClientGallery).filter(ClientGallery.id == gallery_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    db.delete(item)
    db.commit()
    return {"message": "Gallery item deleted"}
