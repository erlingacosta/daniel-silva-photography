import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Import routers
from routers import auth, bookings, galleries, admin, testimonials, inquiries, client_portal

load_dotenv()

app = FastAPI(
    title="Daniel Silva Photography API",
    description="Premium photography booking platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(galleries.router, prefix="/api/galleries", tags=["galleries"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(testimonials.router, prefix="/api/testimonials", tags=["testimonials"])
app.include_router(inquiries.router, prefix="/api/inquiries", tags=["inquiries"])
app.include_router(client_portal.router, prefix="/api/client", tags=["client"])

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
