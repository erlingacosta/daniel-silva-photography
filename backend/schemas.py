from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum

class ServiceType(str, Enum):
    WEDDING = "wedding"
    QUINCEAÑERA = "quinceañera"
    EVENTS = "events"
    PORTRAITS = "portraits"

# Auth
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Bookings
class BookingCreate(BaseModel):
    service_type: ServiceType
    event_date: datetime
    event_location: str
    package: str
    phone: Optional[str] = None
    notes: Optional[str] = None

class BookingUpdate(BaseModel):
    event_date: Optional[datetime] = None
    event_location: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    client_id: Optional[int] = None
    service_type: Optional[str] = None
    event_date: Optional[datetime] = None
    event_location: Optional[str] = None
    package: Optional[str] = None
    price: float = 0
    status: str = "inquiry"
    notes: Optional[str] = None
    contract_signed: bool = False
    payment_status: str = "pending"
    deliverables_ready: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        extra = "ignore"

class InquiryAdminResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    service_type: Optional[str] = None
    event_date: Optional[datetime] = None
    message: Optional[str] = None
    status: str = "new"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        extra = "ignore"

# Galleries
class GalleryImageCreate(BaseModel):
    image_url: str
    thumbnail_url: str
    caption: Optional[str] = None
    display_order: int = 0

class GalleryImageResponse(BaseModel):
    id: int
    image_url: str
    thumbnail_url: str
    caption: Optional[str]
    display_order: int
    
    class Config:
        from_attributes = True

class GalleryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    service_type: ServiceType
    is_public: bool = True
    password: Optional[str] = None

class GalleryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    service_type: str
    is_public: bool
    cover_image_url: Optional[str]
    images: List[GalleryImageResponse] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# Testimonials
class TestimonialCreate(BaseModel):
    text: str
    rating: int = 5
    photo_url: Optional[str] = None
    video_url: Optional[str] = None

class TestimonialResponse(BaseModel):
    id: int
    user_id: int
    text: str
    rating: int
    photo_url: Optional[str]
    video_url: Optional[str]
    is_featured: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Inquiries
class InquiryCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = ""
    phone: Optional[str] = None
    service_type: Optional[str] = "wedding"
    event_date: Optional[str] = None
    message: Optional[str] = ""

    class Config:
        extra = "ignore"

class InquiryResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    service_type: Optional[str] = None
    event_date: Optional[datetime] = None
    message: Optional[str] = None
    status: str = "new"
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Invoices
class InvoiceResponse(BaseModel):
    id: int
    booking_id: int
    invoice_number: str
    amount: float
    status: str
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Newsletter
class NewsletterSubscribe(BaseModel):
    email: EmailStr

# Stripe
class PaymentIntentCreate(BaseModel):
    amount: float
    booking_id: int
