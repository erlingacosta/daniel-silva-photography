from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db
from models import Inquiry, User
from schemas import InquiryCreate, InquiryResponse
from routers.auth import get_current_user

router = APIRouter()

@router.post("", response_model=InquiryResponse)
async def create_inquiry(
    inquiry: InquiryCreate,
    db: Session = Depends(get_db)
):
    """Create inquiry (public endpoint)"""
    
    # Parse event_date if it's a string
    event_date = None
    if inquiry.event_date:
        if isinstance(inquiry.event_date, str):
            try:
                event_date = datetime.fromisoformat(inquiry.event_date.replace('Z', '+00:00'))
            except:
                event_date = None
        else:
            event_date = inquiry.event_date
    
    new_inquiry = Inquiry(
        email=inquiry.email,
        full_name=inquiry.full_name,
        phone=inquiry.phone,
        service_type=inquiry.service_type,
        event_date=event_date,
        message=inquiry.message,
        status="new"
    )
    
    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)
    
    return InquiryResponse.model_validate(new_inquiry)

@router.get("", response_model=List[InquiryResponse])
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
    
    inquiries = query.all()
    return [InquiryResponse.model_validate(i) for i in inquiries]

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
    
    return InquiryResponse.model_validate(inquiry)
