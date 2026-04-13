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
    Message, ClientGallery, Testimonial, HeroSettings
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
    event_location: Optional[str] = None
    total_price: Optional[float] = None
    deposit_amount: Optional[float] = 0.0
    deposit_due_date: Optional[str] = ""
    contract_notes: Optional[str] = ""
    internal_notes: Optional[str] = ""


class BookingGeneralUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[str] = None
    notes: Optional[str] = None
    total_price: Optional[float] = None
    deposit_paid: Optional[bool] = None
    deliverables_ready: Optional[bool] = None


class CreateClientMessageRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_id: Optional[int] = None
    content: Optional[str] = ""


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
        event_date=datetime.fromisoformat(data.event_date),
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
        event_date=datetime.fromisoformat(data.event_date),
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

    # Get messages for this client
    messages = db.query(Message).filter(Message.sender_id == id).order_by(Message.created_at.asc()).all()
    messages_list = [
        {
            "id": m.id,
            "content": m.content or "",
            "sender_id": m.sender_id,
            "sender_name": db.query(User).filter(User.id == m.sender_id).first().full_name if m.sender_id else "",
            "is_read": m.is_read if m.is_read is not None else False,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]

    return {
        "id": client.id,
        "email": client.email or "",
        "full_name": client.full_name or "",
        "phone": client.phone or "",
        "role": client.role or "",
        "created_at": client.created_at.isoformat() if client.created_at else None,
        "booking": _booking_dict(client.bookings[0]) if client.bookings else None,
        "messages": messages_list
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

    message = Message(
        booking_id=data.booking_id,
        sender_id=current_user.id,
        content=data.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Return the full message object so frontend can add it to state
    return {
        "id": message.id,
        "content": message.content or "",
        "sender_id": message.sender_id,
        "sender_name": current_user.full_name or current_user.username or "",
        "is_read": message.is_read if message.is_read is not None else False,
        "created_at": message.created_at.isoformat() if message.created_at else None,
    }


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


# ---------------------------------------------------------------------------
# About (admin) — reads/writes about_data.json
# ---------------------------------------------------------------------------

@router.get("/about")
async def admin_get_about(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        import json as _json
        if ABOUT_FILE.exists():
            return _json.loads(ABOUT_FILE.read_text())
        return DEFAULT_ABOUT
    except Exception:
        return DEFAULT_ABOUT


@router.post("/about")
async def admin_save_about(
    data: UpdateAboutRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        import json as _json
        existing = _json.loads(ABOUT_FILE.read_text()) if ABOUT_FILE.exists() else dict(DEFAULT_ABOUT)
        existing.update(data.dict(exclude_unset=True))
        ABOUT_FILE.write_text(_json.dumps(existing, indent=2))
        return existing
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Contact Messages (admin)
# ---------------------------------------------------------------------------

class ContactStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    status: Optional[str] = "read"


@router.get("/contact")
async def admin_get_contact_messages(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    msgs = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
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
        for m in msgs
    ]


@router.patch("/contact/{id}/status")
async def admin_update_contact_status(
    id: int,
    data: ContactStatusUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    msg = db.query(ContactMessage).filter(ContactMessage.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.status = data.status
    db.commit()
    return {"message": "Status updated", "status": msg.status}


@router.patch("/contact/{id}/read")
async def admin_toggle_contact_read(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    msg = db.query(ContactMessage).filter(ContactMessage.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.status = "unread" if msg.status == "read" else "read"
    db.commit()
    return {"message": "Status toggled", "status": msg.status}


@router.delete("/contact/{id}")
async def admin_delete_contact_message(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    msg = db.query(ContactMessage).filter(ContactMessage.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return {"message": "Deleted"}


# ---------------------------------------------------------------------------
# Users (admin)
# ---------------------------------------------------------------------------

@router.get("/users")
async def admin_get_users(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email or "",
            "username": u.username or "",
            "full_name": u.full_name or "",
            "phone": u.phone or "",
            "role": u.role or "user",
            "is_active": u.is_active if u.is_active is not None else True,
            "is_admin": u.is_admin if u.is_admin is not None else False,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/users")
async def admin_create_user(
    data: UserCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    if not data.email:
        raise HTTPException(status_code=400, detail="Email is required")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    base_username = data.email.split("@")[0]
    username = base_username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1
    user = User(
        email=data.email,
        username=username,
        full_name=data.full_name or "",
        hashed_password=pwd_context.hash(data.password or "changeme123"),
        role=data.role or "client",
        is_admin=(data.role == "admin"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.put("/users/{id}")
async def admin_update_user(
    id: int,
    data: UserUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.email is not None: user.email = data.email
    if data.full_name is not None: user.full_name = data.full_name
    if data.role is not None:
        user.role = data.role
        user.is_admin = (data.role == "admin")
    if data.is_active is not None: user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username or "",
        "full_name": user.full_name or "",
        "role": user.role,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.delete("/users/{id}")
async def admin_deactivate_user(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}


@router.patch("/users/{id}/activate")
async def admin_activate_user(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username or "",
        "full_name": user.full_name or "",
        "role": user.role,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ---------------------------------------------------------------------------
# Featured In (admin)
# ---------------------------------------------------------------------------

class FeaturedInCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = ""
    logo_url: Optional[str] = ""
    url: Optional[str] = ""
    is_active: Optional[bool] = True
    order: Optional[int] = 0


@router.get("/featured-in")
async def admin_get_featured_in(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    items = db.query(FeaturedIn).order_by(FeaturedIn.order).all()
    return [
        {
            "id": i.id,
            "name": i.name or "",
            "logo_url": i.logo_url or "",
            "url": i.url or "",
            "is_active": i.is_active if i.is_active is not None else True,
            "order": i.order or 0,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        }
        for i in items
    ]


@router.post("/featured-in")
async def admin_create_featured_in(
    data: FeaturedInCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    item = FeaturedIn(
        name=data.name or "",
        logo_url=data.logo_url or "",
        url=data.url or "",
        is_active=data.is_active if data.is_active is not None else True,
        order=data.order or 0,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "id": item.id, "name": item.name, "logo_url": item.logo_url,
        "url": item.url, "is_active": item.is_active, "order": item.order,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


@router.put("/featured-in/{id}")
async def admin_update_featured_in(
    id: int,
    data: FeaturedInCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    item = db.query(FeaturedIn).filter(FeaturedIn.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Featured In item not found")

    for field, val in data.dict(exclude_unset=True).items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)
    return {
        "id": item.id, "name": item.name, "logo_url": item.logo_url,
        "url": item.url, "is_active": item.is_active, "order": item.order,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


@router.delete("/featured-in/{id}")
async def admin_delete_featured_in(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    item = db.query(FeaturedIn).filter(FeaturedIn.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Featured In item not found")

    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# ---------------------------------------------------------------------------
# Testimonials (admin)
# ---------------------------------------------------------------------------

class TestimonialAdminCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    client_name: Optional[str] = ""
    event_type: Optional[str] = ""
    quote: Optional[str] = ""
    rating: Optional[float] = 5.0
    image_url: Optional[str] = ""
    order: Optional[int] = 0
    is_approved: Optional[bool] = True


TestimonialModel = Testimonial


@router.get("/testimonials")
async def admin_get_testimonials(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    items = db.query(TestimonialModel).order_by(TestimonialModel.order).all()
    return [
        {
            "id": t.id,
            "client_name": t.client_name or "",
            "event_type": t.event_type or "",
            "quote": t.quote or "",
            "rating": t.rating or 5.0,
            "image_url": t.image_url or "",
            "order": t.order or 0,
            "is_approved": getattr(t, "is_approved", True),
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in items
    ]


@router.post("/testimonials")
async def admin_create_testimonial(
    data: TestimonialAdminCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    t = TestimonialModel(
        client_name=data.client_name or "",
        event_type=data.event_type or "",
        quote=data.quote or "",
        rating=data.rating or 5.0,
        image_url=data.image_url or "",
        order=data.order or 0,
    )
    if hasattr(t, "is_approved"):
        t.is_approved = data.is_approved if data.is_approved is not None else True
    db.add(t)
    db.commit()
    db.refresh(t)
    return {
        "id": t.id, "client_name": t.client_name, "event_type": t.event_type,
        "quote": t.quote, "rating": t.rating, "image_url": t.image_url,
        "order": t.order, "is_approved": getattr(t, "is_approved", True),
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


@router.put("/testimonials/{id}")
async def admin_update_testimonial(
    id: int,
    data: TestimonialAdminCreate,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    t = db.query(TestimonialModel).filter(TestimonialModel.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    for field, val in data.dict(exclude_unset=True).items():
        if hasattr(t, field):
            setattr(t, field, val)
    db.commit()
    db.refresh(t)
    return {
        "id": t.id, "client_name": t.client_name, "event_type": t.event_type,
        "quote": t.quote, "rating": t.rating, "image_url": t.image_url,
        "order": t.order, "is_approved": getattr(t, "is_approved", True),
    }


@router.patch("/testimonials/{id}/approve")
async def admin_toggle_testimonial_approval(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    t = db.query(TestimonialModel).filter(TestimonialModel.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    if hasattr(t, "is_approved"):
        t.is_approved = not t.is_approved
        db.commit()
        return {"message": "Approval toggled", "is_approved": t.is_approved}
    return {"message": "ok", "is_approved": True}


@router.delete("/testimonials/{id}")
async def admin_delete_testimonial(
    id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    t = db.query(TestimonialModel).filter(TestimonialModel.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(t)
    db.commit()
    return {"message": "Deleted"}


# ---------------------------------------------------------------------------
# Hero Settings (admin)
# ---------------------------------------------------------------------------

class HeroUploadRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    video_url: Optional[str] = None


@router.get("/hero")
async def admin_get_hero(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    hero = db.query(HeroSettings).first()
    if not hero:
        return {"video_url": "/videos/05_hero_luxury_montage.mp4"}
    
    return {
        "id": hero.id,
        "video_url": hero.video_url or "/videos/05_hero_luxury_montage.mp4",
        "updated_at": hero.updated_at.isoformat() if hero.updated_at else None,
    }


@router.post("/hero/upload")
async def admin_upload_hero_video(
    file: UploadFile = File(...),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Upload to DigitalOcean Spaces under videos/ folder
    url = await upload_to_spaces(file, folder='videos')
    
    # Update or create hero settings
    hero = db.query(HeroSettings).first()
    if not hero:
        hero = HeroSettings(video_url=url)
        db.add(hero)
    else:
        hero.video_url = url
        hero.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(hero)
    
    return {
        "id": hero.id,
        "video_url": hero.video_url,
        "updated_at": hero.updated_at.isoformat() if hero.updated_at else None,
    }


@router.post("/hero")
async def admin_update_hero(
    data: HeroUploadRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    current_user = await get_current_user(authorization, db)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not data.video_url:
        raise HTTPException(status_code=400, detail="video_url is required")
    
    hero = db.query(HeroSettings).first()
    if not hero:
        hero = HeroSettings(video_url=data.video_url)
        db.add(hero)
    else:
        hero.video_url = data.video_url
        hero.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(hero)
    
    return {
        "id": hero.id,
        "video_url": hero.video_url,
        "updated_at": hero.updated_at.isoformat() if hero.updated_at else None,
    }
