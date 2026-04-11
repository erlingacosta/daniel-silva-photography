from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

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
    new_inquiry = Inquiry(
        email=inquiry.email,
        full_name=inquiry.full_name,
        phone=inquiry.phone,
        service_type=inquiry.service_type,
        event_date=inquiry.event_date,
        message=inquiry.message,
        status="new"
    )
    
    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)
    
    return InquiryResponse(
        id=new_inquiry.id,
        email=new_inquiry.email,
        full_name=new_inquiry.full_name or "",
        phone=new_inquiry.phone or "",
        service_type=new_inquiry.service_type or "",
        event_date=None,
        message=new_inquiry.message or "",
        status=new_inquiry.status,
        created_at=new_inquiry.created_at,
    )

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
    return [
        InquiryResponse(
            id=i.id,
            email=i.email,
            full_name=i.full_name or "",
            phone=i.phone or "",
            service_type=i.service_type or "",
            event_date=None,
            message=i.message or "",
            status=i.status,
            created_at=i.created_at,
        )
        for i in inquiries
    ]

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
    
    return InquiryResponse(
        id=inquiry.id,
        email=inquiry.email,
        full_name=inquiry.full_name or "",
        phone=inquiry.phone or "",
        service_type=inquiry.service_type or "",
        event_date=None,
        message=inquiry.message or "",
        status=inquiry.status,
        created_at=inquiry.created_at,
    )
