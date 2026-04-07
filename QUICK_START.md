# Quick Start Guide

## 🚀 Start in 5 Minutes

### Step 1: Copy Environment Files
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### Step 2: Start Docker Containers
```bash
docker-compose up -d
```

### Step 3: Initialize Database
```bash
docker-compose exec backend alembic upgrade head
```

### Step 4: Create Admin Account
```bash
docker-compose exec backend python << 'EOF'
from database import SessionLocal
from models import User
from routers.auth import get_password_hash

db = SessionLocal()
admin = User(
    email='admin@danielsilva.photo',
    full_name='Daniel Silva',
    password_hash=get_password_hash('admin123'),
    role='admin'
)
db.add(admin)
db.commit()
print("✓ Admin created: admin@danielsilva.photo / admin123")
EOF
```

### Step 5: Access the Platform
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Login:** admin@danielsilva.photo / admin123

---

## 📋 Common Commands

### View Logs
```bash
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f frontend     # Frontend only
```

### Stop Services
```bash
docker-compose down                 # Stop all
docker-compose stop backend         # Stop specific service
```

### Database Access
```bash
docker-compose exec db psql -U daniel -d daniel_silva_photo
```

### Backend Shell
```bash
docker-compose exec backend bash
```

### Frontend Shell
```bash
docker-compose exec frontend bash
```

---

## 🔑 Test Credentials

**Admin Account:**
- Email: admin@danielsilva.photo
- Password: admin123

---

## 🧪 Test the API

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "password": "password123"
  }'
# Returns: { "access_token": "...", "token_type": "bearer", "user": {...} }
```

### Get Current User
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/auth/me
```

### Create Booking Inquiry
```bash
curl -X POST http://localhost:8000/api/bookings/inquiry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "service_type": "wedding",
    "event_date": "2024-06-15T18:00:00",
    "event_location": "Hotel Grand Ballroom",
    "package": "Premium Plus"
  }'
```

---

## 📁 Project Locations

```
daniel-silva-photography/
├── frontend/           # React/Next.js app (Port 3000)
├── backend/           # FastAPI app (Port 8000)
├── db/               # PostgreSQL (Port 5432)
└── nginx/            # Reverse proxy (Port 80)
```

---

## 🔧 Useful Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://daniel:danielsilva@db:5432/daniel_silva_photo
SECRET_KEY=dev-secret-key
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE...
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE...
SENDGRID_API_KEY=SG.YOUR_KEY_HERE...
DEBUG=True
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE...
```

---

## 📚 Documentation Files

- **README.md** - Full documentation
- **SETUP_GUIDE.md** - Detailed setup & deployment
- **PROJECT_SUMMARY.md** - Project overview

---

## ⚠️ Common Issues

**Port already in use?**
```bash
# Kill process using port
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Database connection failed?**
```bash
# Check if db is ready
docker-compose exec db pg_isready
```

**Frontend can't reach backend?**
```bash
# Verify API URL
curl http://localhost:8000/health
```

---

## 🎯 Next Steps

1. Update `.env` with your real API keys (Stripe, SendGrid)
2. Customize branding (logo, colors, text)
3. Add portfolio images to `frontend/public/images/`
4. Configure email templates
5. Deploy to production (see SETUP_GUIDE.md)

---

## 📞 Need Help?

See **SETUP_GUIDE.md** for:
- Detailed setup instructions
- Troubleshooting guide
- Production deployment
- Database backup/restore
- Performance optimization

---

## ✅ Verification Checklist

- [ ] Docker containers running: `docker-compose ps`
- [ ] Frontend accessible: http://localhost:3000
- [ ] Backend accessible: http://localhost:8000/health
- [ ] Database initialized: migrations applied
- [ ] Admin account created
- [ ] Can login at http://localhost:3000/login
- [ ] API docs visible at http://localhost:8000/docs
