from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

from database import get_db
from models import Booking, User, Message, ClientGallery, ServicePackage
from routers.auth import get_current_user

router = APIRouter()


class MessageCreate(BaseModel):
    model_config = ConfigDict(extra='ignore')
    content: Optional[str] = None


@router.get("/dashboard")
async def get_client_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.client_id == current_user.id).first()
    booking_data = None
    if booking:
        package_name = booking.package_rel.name if booking.package_rel else None
        booking_data = {
            "id": booking.id,
            "status": booking.status,
            "event_date": booking.event_date.isoformat() if booking.event_date else None,
            "event_type": booking.event_type,
            "event_location": booking.event_location,
            "package_name": package_name,
            "total_price": booking.total_price,
            "deposit_paid": booking.deposit_paid,
        }
    return {
        "user": {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
        },
        "booking": booking_data,
    }


@router.get("/booking")
async def get_client_booking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.client_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="No booking found")
    package = booking.package_rel
    return {
        "id": booking.id,
        "status": booking.status,
        "event_date": booking.event_date.isoformat() if booking.event_date else None,
        "event_type": booking.event_type,
        "event_location": booking.event_location,
        "notes": booking.notes,
        "total_price": booking.total_price,
        "deposit_paid": booking.deposit_paid,
        "deliverables_ready": booking.deliverables_ready,
        "created_at": booking.created_at.isoformat() if booking.created_at else None,
        "package": {
            "id": package.id,
            "name": package.name,
            "description": package.description,
            "price": package.price,
            "deliverables": package.deliverables,
        } if package else None,
    }


@router.get("/messages")
async def get_client_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.client_id == current_user.id).first()
    if not booking:
        return []
    messages = (
        db.query(Message)
        .filter(Message.booking_id == booking.id)
        .order_by(Message.created_at)
        .all()
    )
    # Mark unread messages (not sent by current user) as read
    for msg in messages:
        if not msg.is_read and msg.sender_id != current_user.id:
            msg.is_read = True
    db.commit()

    result = []
    for msg in messages:
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        result.append({
            "id": msg.id,
            "content": msg.content,
            "sender_id": msg.sender_id,
            "sender_name": sender.full_name if sender else "Unknown",
            "is_read": msg.is_read,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
        })
    return result


@router.post("/messages")
async def send_client_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.client_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="No booking found")
    msg = Message(
        booking_id=booking.id,
        sender_id=current_user.id,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "content": msg.content,
        "sender_id": msg.sender_id,
        "sender_name": current_user.full_name,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@router.get("/gallery")
async def get_client_gallery(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photos = (
        db.query(ClientGallery)
        .filter(
            ClientGallery.user_id == current_user.id,
            ClientGallery.is_visible == True,
        )
        .order_by(ClientGallery.created_at.desc())
        .all()
    )
    return [
        {
            "id": p.id,
            "image_url": p.image_url,
            "caption": p.caption,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in photos
    ]
