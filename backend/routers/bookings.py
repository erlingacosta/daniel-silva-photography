from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from database import get_db
from models import Booking, User, BookingStatus, ServiceType
from schemas import BookingCreate, BookingResponse, BookingUpdate
from routers.auth import get_current_user

router = APIRouter()

PRICING = {
    "Signature": 4500.0,
    "Premium Plus": 6200.0,
    "Elite": 8500.0
}

@router.post("/inquiry", response_model=BookingResponse)
async def create_inquiry(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new booking inquiry"""
    price = PRICING.get(booking.package, 4500.0)
    
    new_booking = Booking(
        client_id=current_user.id,
        service_type=booking.service_type,
        event_date=booking.event_date,
        event_location=booking.event_location,
        package=booking.package,
        price=price,
        status=BookingStatus.INQUIRY,
        notes=booking.notes
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return BookingResponse.model_validate(new_booking)

@router.get("/my-bookings", response_model=List[BookingResponse])
async def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all bookings for current user"""
    bookings = db.query(Booking).filter(Booking.client_id == current_user.id).all()
    return [BookingResponse.model_validate(b) for b in bookings]

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get booking details"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.client_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return BookingResponse.model_validate(booking)

@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    booking_update: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update booking (client or admin only)"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.client_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = booking_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    db.commit()
    db.refresh(booking)
    
    return BookingResponse.model_validate(booking)

@router.get("/availability/calendar")
async def get_availability():
    """Get availability calendar (simplified)"""
    # In production, this would check actual availability
    return {
        "available_dates": [
            "2024-05-15", "2024-05-22", "2024-05-29",
            "2024-06-05", "2024-06-12", "2024-06-19"
        ]
    }

@router.post("/{booking_id}/sign-contract")
async def sign_contract(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark contract as signed"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    booking.contract_signed = True
    booking.status = BookingStatus.CONFIRMED
    db.commit()
    db.refresh(booking)
    
    return BookingResponse.model_validate(booking)
