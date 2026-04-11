from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import Inquiry, User
from schemas import InquiryCreate, InquiryResponse
from routers.auth import get_current_user

router = APIRouter()


def _inquiry_dict(i: Inquiry) -> dict:
    return {
        "id": i.id,
        "email": i.email or "",
        "full_name": i.name or "",        # DB col: name
        "phone": i.phone or "",
        "service_type": i.event_type or "",  # DB col: event_type
        "event_date": i.event_date or None,   # varchar in DB
        "message": i.message or "",
        "status": i.status or "new",
        "created_at": i.created_at.isoformat() if i.created_at else None,
    }


@router.post("")
async def create_inquiry(
    inquiry: InquiryCreate,
    db: Session = Depends(get_db)
):
    """Create inquiry (public endpoint)"""
    new_inquiry = Inquiry(
        email=inquiry.email,
        name=inquiry.full_name,          # DB col: name
        phone=inquiry.phone,
        event_type=inquiry.service_type, # DB col: event_type
        event_date=inquiry.event_date,   # varchar
        message=inquiry.message,
        status="new",
    )
    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)
    return _inquiry_dict(new_inquiry)


@router.get("")
async def get_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: str = None
):
    """Get all inquiries (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    query = db.query(Inquiry)
    if status:
        query = query.filter(Inquiry.status == status)
    return [_inquiry_dict(i) for i in query.all()]


@router.patch("/{inquiry_id}")
async def update_inquiry(
    inquiry_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update inquiry status (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    inquiry.status = status
    db.commit()
    db.refresh(inquiry)
    return _inquiry_dict(inquiry)
