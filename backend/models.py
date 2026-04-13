from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    username = Column(String, nullable=True, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    is_admin = Column(Boolean, default=False, nullable=True)
    role = Column(String, default="user", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    phone = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    must_reset_password = Column(Boolean, default=False, nullable=True)
    temp_password = Column(String, nullable=True)

    bookings = relationship("Booking", back_populates="client")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    order = Column(Integer, default=0, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=True)
    event_type = Column(String, nullable=True)
    quote = Column(Text, nullable=True)
    rating = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)
    order = Column(Integer, default=0, nullable=True)
    is_approved = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)


class ServicePackage(Base):
    __tablename__ = "service_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    deliverables = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    bookings = relationship("Booking", back_populates="package_rel")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    package_id = Column(Integer, ForeignKey("service_packages.id"), nullable=True)
    event_date = Column(DateTime, nullable=True)
    event_type = Column(String, nullable=True)
    event_location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="pending", nullable=True)
    total_price = Column(Float, nullable=True)
    deposit_paid = Column(Boolean, default=False, nullable=True)
    deposit_amount = Column(Float, default=0, nullable=True)
    deposit_due_date = Column(String, nullable=True)
    contract_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    payment_intent_id = Column(String, nullable=True)
    deliverables_ready = Column(Boolean, default=False, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    client = relationship("User", back_populates="bookings")
    package_rel = relationship("ServicePackage", back_populates="bookings")
    invoices = relationship("Invoice", back_populates="booking")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, nullable=True)
    email = Column(String, nullable=True)
    name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    event_type = Column(String, nullable=True)
    event_date = Column(String, nullable=True)   # stored as VARCHAR in DB
    message = Column(Text, nullable=True)
    status = Column(String, default="new", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    converted_to_booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    invoice_number = Column(String, nullable=True, unique=True, index=True)
    amount = Column(Float, nullable=True)
    status = Column(String, default="draft", nullable=True)
    due_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    booking = relationship("Booking", back_populates="invoices")


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    phone = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    status = Column(String, default="unread", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)


class FaqItem(Base):
    __tablename__ = "faq_items"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=True, index=True)
    answer = Column(Text, nullable=True)
    order = Column(Integer, default=0, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)


class AlaCarteService(Base):
    __tablename__ = "ala_carte_services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    order = Column(Integer, default=0, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)


class FeaturedIn(Base):
    __tablename__ = "featured_in"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True, index=True)
    logo_url = Column(String, nullable=True)
    url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)
    order = Column(Integer, default=0, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ClientGallery(Base):
    __tablename__ = "client_galleries"

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String)
    caption = Column(String)
    is_visible = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AboutSettings(Base):
    __tablename__ = "about_settings"

    id = Column(Integer, primary_key=True, index=True)
    photographer_name = Column(String, default="Daniel Silva")
    bio = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    events_photographed = Column(Integer, default=500)
    years_experience = Column(Integer, default=15)
    client_satisfaction = Column(Integer, default=100)
    updated_at = Column(DateTime, default=datetime.utcnow)


class HeroSettings(Base):
    __tablename__ = "hero_settings"

    id = Column(Integer, primary_key=True, index=True)
    video_url = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
