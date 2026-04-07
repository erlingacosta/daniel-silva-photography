from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Booking, User, Invoice, Inquiry
from schemas import BookingResponse, InvoiceResponse
from routers.auth import get_current_user

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
    
    # Calculate revenue
    paid_invoices = db.query(Invoice).filter(Invoice.status == "paid").all()
    total_revenue = sum(inv.amount for inv in paid_invoices)
    
    return {
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "pending_inquiries": pending_inquiries,
        "total_revenue": total_revenue
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

@router.post("/bookings/{booking_id}/send-invoice")
async def send_invoice(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send invoice to client"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Create invoice
    invoice_number = f"INV-{booking_id}-001"
    invoice = Invoice(
        booking_id=booking_id,
        invoice_number=invoice_number,
        amount=booking.price,
        status="sent"
    )
    
    db.add(invoice)
    db.commit()
    
    # In production, send email via SendGrid
    
    return {
        "message": "Invoice sent",
        "invoice_id": invoice.id,
        "invoice_number": invoice_number
    }

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

@router.get("/reports/revenue")
async def get_revenue_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get revenue report"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    invoices = db.query(Invoice).all()
    paid_invoices = [inv for inv in invoices if inv.status == "paid"]
    
    total_revenue = sum(inv.amount for inv in paid_invoices)
    pending_revenue = sum(inv.amount for inv in invoices if inv.status in ["draft", "sent"])
    
    return {
        "total_revenue": total_revenue,
        "pending_revenue": pending_revenue,
        "paid_invoices": len(paid_invoices),
        "total_invoices": len(invoices)
    }
