from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    role = Column(String, default="user")  # user, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="client")

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

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    service_type = Column(String)
    event_date = Column(DateTime)
    event_location = Column(String)
    package = Column(String)
    price = Column(Float)
    status = Column(String, default="inquiry")  # inquiry, pending, confirmed, completed, cancelled
    notes = Column(Text)
    contract_signed = Column(Boolean, default=False)
    payment_intent_id = Column(String, nullable=True)
    payment_status = Column(String, default="pending")
    deliverables_ready = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    client = relationship("User", back_populates="bookings")
    invoices = relationship("Invoice", back_populates="booking")

class Inquiry(Base):
    __tablename__ = "inquiries"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    full_name = Column(String)
    phone = Column(String, nullable=True)
    service_type = Column(String)
    event_date = Column(DateTime, nullable=True)
    message = Column(Text)
    status = Column(String, default="new")  # new, read, contacted, converted, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    invoice_number = Column(String, unique=True, index=True)
    amount = Column(Float)
    status = Column(String, default="draft")  # draft, sent, paid, overdue, cancelled
    due_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    booking = relationship("Booking", back_populates="invoices")

class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    message = Column(Text)
    status = Column(String, default="new")  # new, read, replied
    created_at = Column(DateTime, default=datetime.utcnow)

class FaqItem(Base):
    __tablename__ = "faq_items"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(Text)
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AlaCarteService(Base):
    __tablename__ = "ala_carte_services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeaturedIn(Base):
    __tablename__ = "featured_in"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # Publication/website name
    logo_url = Column(String)
    url = Column(String, nullable=True)  # Link to publication
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
