from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from enum import Enum


class ServiceType(str, Enum):
    WEDDING = "wedding"
    QUINCEANERA = "quinceañera"
    EVENTS = "events"
    PORTRAITS = "portraits"


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class UserLogin(BaseModel):
    model_config = ConfigDict(extra='ignore')
    email: Optional[str] = None
    password: Optional[str] = None


class UserRegister(BaseModel):
    model_config = ConfigDict(extra='ignore')
    email: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(BaseModel):
    # Matches actual users table columns
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


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ---------------------------------------------------------------------------
# Bookings
# DB columns: id, client_id, package_id, event_date, event_type, event_location,
#             notes, status, total_price, deposit_paid, payment_intent_id,
#             deliverables_ready, created_at, updated_at
# ---------------------------------------------------------------------------

class BookingCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    event_type: Optional[str] = "wedding"
    event_date: Optional[datetime] = None
    event_location: Optional[str] = None
    package_id: Optional[int] = None
    notes: Optional[str] = None


class BookingUpdate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    event_date: Optional[datetime] = None
    event_location: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    client_id: Optional[int] = None
    package_id: Optional[int] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    event_location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "pending"
    total_price: Optional[float] = 0
    deposit_paid: Optional[bool] = False
    deliverables_ready: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Inquiries
# DB columns: id, sender_id, email, name, phone, event_type, event_date (varchar),
#             message, status, created_at
# ---------------------------------------------------------------------------

class InquiryCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    email: Optional[str] = None
    full_name: Optional[str] = ""   # maps to DB column 'name'
    phone: Optional[str] = None
    service_type: Optional[str] = "wedding"  # maps to DB column 'event_type'
    event_date: Optional[str] = None
    message: Optional[str] = ""


class InquiryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    email: Optional[str] = None
    full_name: Optional[str] = None   # aliased from DB 'name'
    phone: Optional[str] = None
    service_type: Optional[str] = None  # aliased from DB 'event_type'
    event_date: Optional[str] = None   # varchar in DB
    message: Optional[str] = None
    status: Optional[str] = "new"
    created_at: Optional[datetime] = None


class InquiryAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    service_type: Optional[str] = None
    event_date: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = "new"
    created_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Invoices
# DB columns: id, booking_id, invoice_number, amount, status,
#             due_date, paid_date, notes, created_at, updated_at
# ---------------------------------------------------------------------------

class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    id: int
    booking_id: Optional[int] = None
    invoice_number: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = "draft"
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Newsletter
# ---------------------------------------------------------------------------

class NewsletterSubscribe(BaseModel):
    model_config = ConfigDict(extra='ignore')
    email: Optional[str] = None


# ---------------------------------------------------------------------------
# Misc stubs (referenced by other routers — kept minimal)
# ---------------------------------------------------------------------------

class PaymentIntentCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    amount: Optional[float] = None
    booking_id: Optional[int] = None
