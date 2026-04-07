from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Testimonial, User
from schemas import TestimonialCreate, TestimonialResponse
from routers.auth import get_current_user

router = APIRouter()

@router.get("/featured")
async def get_featured_testimonials(db: Session = Depends(get_db)):
    """Get featured testimonials (public endpoint)"""
    testimonials = db.query(Testimonial).filter(Testimonial.is_featured == True).all()
    return [TestimonialResponse.model_validate(t) for t in testimonials]

@router.get("", response_model=List[TestimonialResponse])
async def get_all_testimonials(db: Session = Depends(get_db)):
    """Get all testimonials"""
    testimonials = db.query(Testimonial).all()
    return [TestimonialResponse.model_validate(t) for t in testimonials]

@router.post("", response_model=TestimonialResponse)
async def create_testimonial(
    testimonial: TestimonialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create testimonial"""
    new_testimonial = Testimonial(
        user_id=current_user.id,
        text=testimonial.text,
        rating=testimonial.rating,
        photo_url=testimonial.photo_url,
        video_url=testimonial.video_url
    )
    
    db.add(new_testimonial)
    db.commit()
    db.refresh(new_testimonial)
    
    return TestimonialResponse.model_validate(new_testimonial)

@router.patch("/{testimonial_id}")
async def update_testimonial(
    testimonial_id: int,
    is_featured: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update testimonial (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    if is_featured is not None:
        testimonial.is_featured = is_featured
    
    db.commit()
    db.refresh(testimonial)
    
    return TestimonialResponse.model_validate(testimonial)
