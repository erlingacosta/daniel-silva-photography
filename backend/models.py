from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CLIENT = "client"

class BookingStatus(str, enum.Enum):
    INQUIRY = "inquiry"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ServiceType(str, enum.Enum):
    WEDDING = "wedding"
    QUINCEAÑERA = "quinceañera"
    EVENTS = "events"
    PORTRAITS = "portraits"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    password_hash = Column(String)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CLIENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="client")
    testimonials = relationship("Testimonial", back_populates="user")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    service_type = Column(Enum(ServiceType))
    event_date = Column(DateTime)
    event_location = Column(String)
    package = Column(String)  # Signature, Premium Plus, Elite
    price = Column(Float)
    status = Column(Enum(BookingStatus), default=BookingStatus.INQUIRY)
    notes = Column(Text, nullable=True)
    contract_signed = Column(Boolean, default=False)
    payment_intent_id = Column(String, nullable=True)
    payment_status = Column(String, default="pending")
    deliverables_ready = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    client = relationship("User", back_populates="bookings")
    gallery = relationship("Gallery", uselist=False, back_populates="booking", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="booking")

class Gallery(Base):
    __tablename__ = "galleries"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    service_type = Column(Enum(ServiceType))
    is_public = Column(Boolean, default=True)
    password = Column(String, nullable=True)  # For password-protected galleries
    cover_image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    booking = relationship("Booking", back_populates="gallery")
    images = relationship("GalleryImage", back_populates="gallery", cascade="all, delete-orphan")

class GalleryImage(Base):
    __tablename__ = "gallery_images"
    
    id = Column(Integer, primary_key=True, index=True)
    gallery_id = Column(Integer, ForeignKey("galleries.id"))
    image_url = Column(String)
    thumbnail_url = Column(String)
    caption = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    gallery = relationship("Gallery", back_populates="images")

class Inquiry(Base):
    __tablename__ = "inquiries"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    full_name = Column(String)
    phone = Column(String, nullable=True)
    service_type = Column(Enum(ServiceType))
    event_date = Column(DateTime, nullable=True)
    message = Column(Text)
    status = Column(String, default="new")  # new, contacted, converted, lost
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Testimonial(Base):
    __tablename__ = "testimonials"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text)
    rating = Column(Integer, default=5)  # 1-5 stars
    photo_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="testimonials")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    invoice_number = Column(String, unique=True)
    amount = Column(Float)
    status = Column(String, default="draft")  # draft, sent, paid, overdue
    due_date = Column(DateTime)
    paid_date = Column(DateTime, nullable=True)
    stripe_invoice_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    booking = relationship("Booking", back_populates="invoices")

class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
