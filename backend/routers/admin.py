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


def parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str.split("T")[0].split(" ")[0], "%Y-%m-%d").date()
    except:
        return None

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
    model_config = ConfigDict(extra="ignore")
    photographer_name: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    events_photographed: Optional[int] = None
    years_experience: Optional[int] = None
    client_satisfaction: Optional[int] = None


class PackageCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = ""
    description: Optional[str] = ""
    price: Optional[float] = 0.0
    deliverables: Optional[str] = ""
    is_active: Optional[bool] = True


class PackageUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    deliverables: Optional[str] = None
    is_active: Optional[bool] = None


class PackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    deliverables: Optional[str] = None
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: Optional[str] = None
    password: Optional[str] = ""
    full_name: Optional[str] = ""
    role: Optional[str] = "client"


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserPasswordReset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    password: Optional[str] = ""


class UserAdminResponse(BaseModel):
    # Fields that actually exist in users table
    model_config = ConfigDict(from_attributes=True, extra="ignore")
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
    model_config = ConfigDict(extra="ignore")
    title: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = "Weddings"
    image_url: Optional[str] = ""


class PortfolioItemUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[str] = "pending"


class InquiryStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[str] = "new"


class InquiryUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[str] = None


class ConvertInquiryRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    package_id: Optional[int] = None
    event_date: Optional[str] = None
    event_type: Optional[str] = None
    event_location: Optional[str] = None
    total_price: Optional[float] = None
    deposit_amount: Optional[float] = None
    deposit_due_date: Optional[str] = None
    contract_notes: Optional[str] = None
    internal_notes: Optional[str] = None


class CreateClientMessageRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_id: Optional[int] = None
    content: Optional[str] = None
    message: Optional[str] = None


class BookingGeneralUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[str] = None
    notes: Optional[str] = None
    total_price: Optional[float] = None
    deposit_paid: Optional[bool] = None
    deliverables_ready: Optional[bool] = None


class CreateFaqRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question: Optional[str] = ""
    answer: Optional[str] = ""
    is_active: Optional[bool] = True
    order: Optional[int] = 0


class UpdateFaqRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question: Optional[str] = None
    answer: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None


class CreateServiceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = ""
    description: Optional[str] = ""
    price: Optional[float] = 0.0
    is_active: Optional[bool] = True


class UpdateServiceRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
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
        "client_name": b.client.full_name if b.client else "",
        "client_email": b.client.email if b.client else "",
        "package_name": b.package_rel.name if b.package_rel else "",
        "event_type": b.event_type or "",
        "event_date": b.event_date.isoformat() if b.event_date else None,
        "event_location": b.event_location or "",
        "status": b.status or "pending",
        "total_price": b.total_price or 0,
        "deposit_paid": b.deposit_paid or False,
        "deposit_amount": b.deposit_amount or 0.0,
        "contract_notes": b.contract_notes or "",
        "internal_notes": b.internal_notes or "",
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

    query = db.query(Booking).join(User).join(ServicePackage)
    if status:
        query = query.filter(Booking.status == status)
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [_booking_dict(b) for b in bookings]


@router.post("/bookings")
async def create_booking(
    data: BookingGeneralUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.email == data.client_email).first()
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
            full_name=data.full_name or "",
            phone=data.phone or "",
            hashed_password=pwd_context.hash(secrets.token_hex(16)),
            is_active=True,
            is_admin=False,
            role="client",
        )
        db.add(user)
        db.flush()

    booking = Booking(
        client_id=user.id,
        package_id=data.package_id,
        event_date=parse_date(data.event_date),
        event_type=data.event_type or "",
        event_location=data.event_location or "",
        total_price=data.total_price or 0.0,
        deposit_paid=data.deposit_paid or False,
        deposit_amount=data.deposit_amount or 0.0,
        contract_notes=data.contract_notes or "",
        internal_notes=data.internal_notes or "",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _booking_dict(booking)


@router.put("/bookings/{booking_id}")
async def update_booking(
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

    for field in data.dict(exclude_unset=True):
        setattr(booking, field, getattr(data, field))

    db.commit()
    db.refresh(booking)
    return _booking_dict(booking)


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


@router.patch("/bookings/{booking_id}/deposit")
async def update_booking_deposit(
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

    for field in data.dict(exclude_unset=True):
        setattr(booking, field, getattr(data, field))

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
@router.get("/inquiries")
async def get_all_inquiries(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiries = db.query(Inquiry).all()
    return [
        {
            "id": i.id,
            "name": i.name or "",
            "email": i.email or "",
            "phone": i.phone or "",
            "event_type": i.event_type or "",
            "event_date": i.event_date or "",
            "message": i.message or "",
            "status": i.status or "",
            "created_at": i.created_at.isoformat() if i.created_at else None,
            "converted_to_booking_id": i.converted_to_booking_id
        }
        for i in inquiries
    ]


@router.patch("/inquiries/{id}/status")
async def update_inquiry_status(
    id: int,
    data: InquiryStatusUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiry = db.query(Inquiry).filter(Inquiry.id == id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    inquiry.status = data.status
    db.commit()
    db.refresh(inquiry)
    return {"message": "Status updated"}

@router.delete("/inquiries/{id}")
async def delete_inquiry(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiry = db.query(Inquiry).filter(Inquiry.id == id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    db.delete(inquiry)
    db.commit()

    return {"message": "Inquiry deleted"}


@router.post("/inquiries/{id}/convert")
async def convert_inquiry_to_booking(
    id: int,
    data: ConvertInquiryRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiry = db.query(Inquiry).filter(Inquiry.id == id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    user = db.query(User).filter(User.email == data.client_email).first()
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

    booking = Booking(
        client_id=user.id,
        package_id=data.package_id,
        event_date=parse_date(data.event_date),
        event_type=data.event_type or "",
        event_location=data.event_location or "",
        total_price=data.total_price or 0.0,
        deposit_paid=False,
        deposit_amount=0.0,
        contract_notes=data.contract_notes or "",
        internal_notes=data.internal_notes or "",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    inquiry.status = "converted"
    inquiry.converted_to_booking_id = booking.id
    db.commit()

    return {"message": f"Inquiry converted to Booking {booking.id}"}

# --- Clients ---
@router.get("/clients")
async def get_all_clients(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    clients = db.query(User).filter(User.is_admin == False).all()
    return [
        {
            "id": c.id,
            "email": c.email or "",
            "full_name": c.full_name or "",
            "phone": c.phone or "",
            "role": c.role or "",
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "booking": _booking_dict(c.bookings[0]) if c.bookings else None
        }
        for c in clients
    ]


@router.get("/clients/{id}")
async def get_client(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    client = db.query(User).filter(User.id == id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    return {
        "id": client.id,
        "email": client.email or "",
        "full_name": client.full_name or "",
        "phone": client.phone or "",
        "role": client.role or "",
        "created_at": client.created_at.isoformat() if client.created_at else None,
        "booking": _booking_dict(client.bookings[0]) if client.bookings else None
    }


@router.post("/clients/{id}/messages")
async def create_client_message(
    id: int,
    data: CreateClientMessageRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    client = db.query(User).filter(User.id == id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    message_content = data.content or data.message or ""
    message = Message(
        booking_id=data.booking_id,
        sender_id=current_user.id,
        content=message_content
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return {"message": "Message created"}


@router.post("/gallery/upload")
async def upload_gallery_image(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    booking_id: int = Form(...),
    caption: str = Form(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    url = await upload_to_spaces(file, folder='client_galleries')
    gallery_image = ClientGallery(
        booking_id=booking_id,
        user_id=user_id,
        image_url=url,
        caption=caption or "",
        is_visible=True
    )
    db.add(gallery_image)
    db.commit()
    db.refresh(gallery_image)

    return {"message": "Image uploaded", "url": url}


@router.patch("/gallery/{id}")
async def update_gallery_visibility(
    id: int,
    data: BookingGeneralUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    gallery_image = db.query(ClientGallery).filter(ClientGallery.id == id).first()
    if not gallery_image:
        raise HTTPException(status_code=404, detail="Image not found")

    gallery_image.is_visible = data.is_visible
    db.commit()

    return {"message": "Visibility updated"}


@router.delete("/gallery/{id}")
async def delete_gallery_image(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    gallery_image = db.query(ClientGallery).filter(ClientGallery.id == id).first()
    if not gallery_image:
        raise HTTPException(status_code=404, detail="Image not found")

    db.delete(gallery_image)
    db.commit()

    return {"message": "Image deleted"}


# ---------------------------------------------------------------------------
# Client info update + password reset
# ---------------------------------------------------------------------------

class UpdateClientRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_admin: Optional[bool] = None


@router.put("/clients/{client_id}/info")
async def update_client_info(
    client_id: int,
    data: UpdateClientRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.id == client_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Client not found")

    if data.full_name is not None: user.full_name = data.full_name
    if data.email is not None: user.email = data.email
    if data.phone is not None: user.phone = data.phone
    if data.role is not None:
        user.role = data.role
        user.is_admin = (data.role == "admin")
    if data.is_admin is not None: user.is_admin = data.is_admin

    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_admin": user.is_admin,
    }


@router.post("/clients/{client_id}/reset-password")
async def admin_reset_client_password(
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

    import secrets
    temp_pw = "Temp" + secrets.token_urlsafe(8) + "!"
    user.hashed_password = pwd_context.hash(temp_pw)
    user.temp_password = temp_pw
    user.must_reset_password = True
    db.commit()

    return {
        "temp_password": temp_pw,
        "message": f"Temporary password set for {user.email}. Client will be prompted to change it on next login.",
    }


# --- Packages Admin ---
@router.get("/packages")
async def admin_get_packages(authorization: str = Header(None), db: Session = Depends(get_db)):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    packages = db.query(ServicePackage).order_by(ServicePackage.id).all()
    return [{"id": p.id, "name": p.name, "description": p.description, "price": p.price,
             "deliverables": p.deliverables, "is_active": p.is_active,
             "created_at": p.created_at.isoformat() if p.created_at else None} for p in packages]

@router.post("/packages")
async def admin_create_package(data: PackageCreate, authorization: str = Header(None), db: Session = Depends(get_db)):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    pkg = ServicePackage(name=data.name, description=data.description, price=data.price,
                         deliverables=data.deliverables, is_active=data.is_active)
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return {"id": pkg.id, "name": pkg.name, "description": pkg.description, "price": pkg.price,
            "deliverables": pkg.deliverables, "is_active": pkg.is_active,
            "created_at": pkg.created_at.isoformat() if pkg.created_at else None}

@router.put("/packages/{pkg_id}")
async def admin_update_package(pkg_id: int, data: PackageUpdate, authorization: str = Header(None), db: Session = Depends(get_db)):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    pkg = db.query(ServicePackage).filter(ServicePackage.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    if data.name is not None: pkg.name = data.name
    if data.description is not None: pkg.description = data.description
    if data.price is not None: pkg.price = data.price
    if data.deliverables is not None: pkg.deliverables = data.deliverables
    if data.is_active is not None: pkg.is_active = data.is_active
    db.commit()
    db.refresh(pkg)
    return {"id": pkg.id, "name": pkg.name, "description": pkg.description, "price": pkg.price,
            "deliverables": pkg.deliverables, "is_active": pkg.is_active,
            "created_at": pkg.created_at.isoformat() if pkg.created_at else None}

@router.delete("/packages/{pkg_id}")
async def admin_delete_package(pkg_id: int, authorization: str = Header(None), db: Session = Depends(get_db)):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    pkg = db.query(ServicePackage).filter(ServicePackage.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    db.delete(pkg)
    db.commit()
    return {"message": "Package deleted"}


# --- About Admin ---
@router.get("/about")
async def admin_get_about(authorization: str = Header(None), db: Session = Depends(get_db)):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    from models import AboutSettings
    about = db.query(AboutSettings).first()
    if not about:
        about = AboutSettings()
        db.add(about)
        db.commit()
        db.refresh(about)
    return {"id": about.id, "photographer_name": about.photographer_name, "bio": about.bio,
            "photo_url": about.photo_url, "events_photographed": about.events_photographed,
            "years_experience": about.years_experience, "client_satisfaction": about.client_satisfaction}

@router.post("/about")
async def admin_update_about(data: dict, authorization: str = Header(None), db: Session = Depends(get_db)):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    from models import AboutSettings
    about = db.query(AboutSettings).first()
    if not about:
        about = AboutSettings()
        db.add(about)
    if "photographer_name" in data: about.photographer_name = data["photographer_name"]
    if "bio" in data: about.bio = data["bio"]
    if "photo_url" in data: about.photo_url = data["photo_url"]
    if "events_photographed" in data: about.events_photographed = data["events_photographed"]
    if "years_experience" in data: about.years_experience = data["years_experience"]
    if "client_satisfaction" in data: about.client_satisfaction = data["client_satisfaction"]
    about.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(about)
    return {"id": about.id, "photographer_name": about.photographer_name, "bio": about.bio,
            "photo_url": about.photo_url, "events_photographed": about.events_photographed,
            "years_experience": about.years_experience, "client_satisfaction": about.client_satisfaction}
