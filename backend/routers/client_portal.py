from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Booking, User, Gallery
from schemas import BookingResponse, GalleryResponse
from routers.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def get_client_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get client dashboard"""
    bookings = db.query(Booking).filter(Booking.client_id == current_user.id).all()
    
    total_bookings = len(bookings)
    confirmed_bookings = sum(1 for b in bookings if b.status == "confirmed")
    
    return {
        "user_id": current_user.id,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "bookings": [BookingResponse.model_validate(b) for b in bookings]
    }

@router.get("/bookings/{booking_id}")
async def get_booking_details(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get booking details for client"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    response = BookingResponse.model_validate(booking)
    
    # Include gallery if available
    gallery = db.query(Gallery).filter(Gallery.booking_id == booking_id).first()
    if gallery:
        response.gallery = GalleryResponse.model_validate(gallery)
    
    return response

@router.get("/galleries")
async def get_my_galleries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get galleries for current user's bookings"""
    bookings = db.query(Booking).filter(Booking.client_id == current_user.id).all()
    booking_ids = [b.id for b in bookings]
    
    galleries = db.query(Gallery).filter(Gallery.booking_id.in_(booking_ids)).all()
    return [GalleryResponse.model_validate(g) for g in galleries]

@router.post("/contact")
async def send_contact_message(
    subject: str,
    message: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send contact message from client portal"""
    # In production, send email via SendGrid
    return {
        "message": "Your message has been sent",
        "subject": subject
    }

@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "created_at": current_user.created_at
    }

@router.patch("/profile")
async def update_profile(
    full_name: str = None,
    phone: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    if full_name:
        current_user.full_name = full_name
    if phone:
        current_user.phone = phone
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone
    }
