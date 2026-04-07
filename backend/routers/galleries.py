from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Gallery, GalleryImage, User, ServiceType
from schemas import GalleryCreate, GalleryResponse, GalleryImageCreate
from routers.auth import get_current_user

router = APIRouter()

@router.get("/public", response_model=List[GalleryResponse])
async def get_public_galleries(service_type: str = None, db: Session = Depends(get_db)):
    """Get all public galleries, optionally filtered by service type"""
    query = db.query(Gallery).filter(Gallery.is_public == True)
    
    if service_type:
        query = query.filter(Gallery.service_type == service_type)
    
    galleries = query.all()
    return [GalleryResponse.model_validate(g) for g in galleries]

@router.get("/{gallery_id}", response_model=GalleryResponse)
async def get_gallery(
    gallery_id: int,
    password: str = None,
    db: Session = Depends(get_db)
):
    """Get gallery details"""
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    if not gallery.is_public and not password:
        raise HTTPException(status_code=403, detail="Gallery is password-protected")
    
    # Simple password check (in production, use proper hashing)
    if gallery.password and gallery.password != password:
        raise HTTPException(status_code=403, detail="Invalid password")
    
    return GalleryResponse.model_validate(gallery)

@router.post("", response_model=GalleryResponse)
async def create_gallery(
    gallery: GalleryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new gallery (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    new_gallery = Gallery(
        name=gallery.name,
        description=gallery.description,
        service_type=gallery.service_type,
        is_public=gallery.is_public,
        password=gallery.password
    )
    
    db.add(new_gallery)
    db.commit()
    db.refresh(new_gallery)
    
    return GalleryResponse.model_validate(new_gallery)

@router.post("/{gallery_id}/images")
async def add_gallery_image(
    gallery_id: int,
    image: GalleryImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add image to gallery (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    gallery = db.query(Gallery).filter(Gallery.id == gallery_id).first()
    if not gallery:
        raise HTTPException(status_code=404, detail="Gallery not found")
    
    new_image = GalleryImage(
        gallery_id=gallery_id,
        image_url=image.image_url,
        thumbnail_url=image.thumbnail_url,
        caption=image.caption,
        display_order=image.display_order
    )
    
    db.add(new_image)
    
    # Update gallery cover image if it's the first image
    if not gallery.cover_image_url:
        gallery.cover_image_url = image.thumbnail_url
    
    db.commit()
    db.refresh(new_image)
    
    return {
        "id": new_image.id,
        "image_url": new_image.image_url,
        "thumbnail_url": new_image.thumbnail_url,
        "caption": new_image.caption
    }

@router.delete("/{gallery_id}/images/{image_id}")
async def delete_gallery_image(
    gallery_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete image from gallery (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    image = db.query(GalleryImage).filter(
        GalleryImage.id == image_id,
        GalleryImage.gallery_id == gallery_id
    ).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    db.delete(image)
    db.commit()
    
    return {"message": "Image deleted"}
