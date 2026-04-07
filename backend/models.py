from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Table, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="client")
    inquiries = relationship("Inquiry", back_populates="sender")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String)  # wedding, quinceañera, event, portrait
    image_url = Column(String)
    thumbnail_url = Column(String)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Testimonial(Base):
    __tablename__ = "testimonials"
    
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String)
    event_type = Column(String)  # wedding, quinceañera, event, portrait
    quote = Column(Text)
    rating = Column(Float)
    image_url = Column(String)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ServicePackage(Base):
    __tablename__ = "service_packages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # Signature, Premium Plus, Elite
    description = Column(Text)
    price = Column(Float)
    deliverables = Column(Text)  # JSON string of deliverables
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="package")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    package_id = Column(Integer, ForeignKey("service_packages.id"))
    event_date = Column(DateTime)
    event_type = Column(String)  # wedding, quinceañera, event, portrait
    event_location = Column(String)
    notes = Column(Text)
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    total_price = Column(Float)
    deposit_paid = Column(Boolean, default=False)
    payment_intent_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    client = relationship("User", back_populates="bookings")
    package = relationship("ServicePackage", back_populates="bookings")

class Inquiry(Base):
    __tablename__ = "inquiries"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    email = Column(String)
    name = Column(String)
    phone = Column(String)
    event_type = Column(String)
    event_date = Column(String)
    message = Column(Text)
    status = Column(String, default="new")  # new, contacted, converted, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User", back_populates="inquiries")

class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
