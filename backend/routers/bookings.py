from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Booking, User
from schemas import BookingCreate, BookingUpdate, BookingResponse
from routers.auth import get_current_user

router = APIRouter()


@router.post("/inquiry", response_model=BookingResponse)
async def create_inquiry(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_booking = Booking(
        client_id=current_user.id,
        package_id=booking.package_id,
        event_type=booking.event_type,
        event_date=booking.event_date,
        event_location=booking.event_location,
        notes=booking.notes,
        status="pending",
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
    bookings = db.query(Booking).filter(Booking.client_id == current_user.id).all()
    return [BookingResponse.model_validate(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
    return {"available_dates": []}
