from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from pathlib import Path

from database import get_db
from models import Booking, User, Inquiry
from schemas import BookingResponse
from routers.auth import get_current_user

ABOUT_FILE = Path(__file__).parent.parent / "about_data.json"

DEFAULT_ABOUT = {
    "photo_url": "/images/daniel-silva.jpg",
    "bio_heading": "Premium Photography",
    "bio_since": "Since 2009",
    "bio_paragraphs": [
        "Daniel Silva is a passionate photographer dedicated to capturing life's most important moments. With over 15 years of experience, he specializes in wedding, quinceañera, and event photography.",
        "His approach combines technical expertise with artistic vision, ensuring every photo tells a story. Daniel believes in building genuine relationships with clients to understand and deliver on their unique vision.",
        "When not behind the camera, Daniel mentors emerging photographers and explores new locations for stunning backdrops across the Southwest.",
    ],
    "stats": [
        {"value": "500+", "label": "Events Photographed"},
        {"value": "15+", "label": "Years of Experience"},
        {"value": "100%", "label": "Client Satisfaction"},
    ],
}

router = APIRouter()

@router.get("/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get admin dashboard stats"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "confirmed").count()
    pending_inquiries = db.query(Inquiry).filter(Inquiry.status == "new").count()
    
    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_inquiries": pending_inquiries
    }

@router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all bookings (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    
    bookings = query.all()
    return [BookingResponse.model_validate(b) for b in bookings]

@router.post("/bookings/{booking_id}/mark-complete")
async def mark_booking_complete(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark booking as completed"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = "completed"
    booking.deliverables_ready = True
    db.commit()
    db.refresh(booking)
    
    return BookingResponse.model_validate(booking)

@router.get("/about")
async def get_about_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get about section data"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    if ABOUT_FILE.exists():
        return json.loads(ABOUT_FILE.read_text())
    return DEFAULT_ABOUT

@router.put("/about")
async def update_about_data(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update about section data"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    ABOUT_FILE.write_text(json.dumps(data, indent=2))
    return {"message": "About section updated successfully"}


