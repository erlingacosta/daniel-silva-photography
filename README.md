# Daniel Silva Photography Platform

A premium, full-featured photography booking and portfolio management platform built with Next.js, FastAPI, and PostgreSQL.

## Features

### 📸 Portfolio & Galleries
- Full-screen hero image carousel with cinematic transitions
- Organized galleries by service type (Weddings, Quinceañeras, Events, Portraits)
- Full-screen lightbox image viewer
- Password-protected client galleries for post-event access
- Before/after sliders for editing showcase
- Instagram feed integration

### 📅 Booking System
- Service selection with clear pricing
- Interactive calendar availability checking
- Three tiered packages: Signature ($4,500), Premium Plus ($6,200), Elite ($8,500)
- Automated inquiry form with email confirmations
- Lead capture and management
- Client inquiry tracking

### 👥 Client Portal
- Secure login with email/password authentication
- View booking status and contract management
- Download high-resolution photos
- Invoice and payment status tracking
- Leave reviews and testimonials
- Access private event galleries

### 🎯 Admin Dashboard
- Comprehensive booking management
- Inquiry tracking and conversion
- Invoice generation and payment reminders
- Automated email notifications
- Gallery and photo management
- Revenue and booking reports

### 🎖️ Trust & Credibility
- Client testimonials with ratings and photos
- Video testimonial embeds
- Featured in/Press mentions section
- Comprehensive FAQ
- About page with credentials
- Quick response time guarantee (24 hours)

### 📢 Marketing & Lead Generation
- Email newsletter signup
- Social media integration (Instagram prominent)
- SEO optimization
- Blog capability
- Contact forms with CTAs throughout
- Quinceañera resource section

## Tech Stack

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Utility-first CSS
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Zustand** - State management
- **Stripe.js** - Payment integration

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Stripe API** - Payment processing
- **SendGrid** - Email service
- **JWT** - Authentication
- **Alembic** - Database migrations

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy
- **PostgreSQL 16** - Production database

## Project Structure

```
daniel-silva-photography/
├── frontend/              # Next.js React app
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── hooks/        # Custom hooks
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── backend/              # FastAPI application
│   ├── routers/          # API route handlers
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database config
│   ├── config.py         # App configuration
│   ├── main.py           # FastAPI app entry
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic/          # Database migrations
├── nginx/                # Nginx configuration
├── docker-compose.yml    # Multi-container setup
└── README.md
```

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development without Docker)
- Python 3.11+ (for backend development without Docker)

### Quick Start with Docker

1. **Clone and navigate to project:**
   ```bash
   cd daniel-silva-photography
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Update with your API keys (Stripe, SendGrid, etc.)

   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Create admin user:**
   ```bash
   docker-compose exec backend python -c "
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
   print('Admin user created')
   "
   ```

6. **Access the platform:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Local Development (Without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up .env file
cp .env.example .env

# Initialize database
alembic upgrade head

# Run development server
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

## Configuration

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://daniel:danielsilva@db:5432/daniel_silva_photo
SECRET_KEY=your-super-secret-key-change-in-production
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
SENDGRID_API_KEY=SG.YOUR_KEY_HERE
SENDGRID_FROM_EMAIL=contact@danielsilva.photo
DEBUG=False
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Bookings
- `POST /api/bookings/inquiry` - Create booking inquiry
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/{id}` - Get booking details
- `PATCH /api/bookings/{id}` - Update booking
- `POST /api/bookings/{id}/sign-contract` - Sign contract

### Galleries
- `GET /api/galleries/public` - Get public galleries
- `GET /api/galleries/{id}` - Get gallery details
- `POST /api/galleries` - Create gallery (admin)
- `POST /api/galleries/{id}/images` - Add image (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/bookings` - All bookings
- `POST /api/admin/bookings/{id}/send-invoice` - Send invoice
- `GET /api/admin/reports/revenue` - Revenue report

### Client Portal
- `GET /api/client/dashboard` - Client dashboard
- `GET /api/client/bookings/{id}` - Booking details
- `GET /api/client/galleries` - Client's galleries
- `GET /api/client/profile` - User profile
- `PATCH /api/client/profile` - Update profile

### Public
- `GET /api/testimonials/featured` - Featured testimonials
- `GET /api/inquiries` - Create inquiry
- `POST /api/inquiries` - Create inquiry

## Deployment

### Cloud Deployment (DigitalOcean Recommended)

1. **Create droplet:**
   - 2GB RAM, 2 CPUs minimum
   - Ubuntu 24.04 LTS
   - Enable Docker option

2. **Clone and configure:**
   ```bash
   git clone <repo>
   cd daniel-silva-photography
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   # Update with production values
   ```

3. **Deploy with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Set up SSL (Let's Encrypt):**
   ```bash
   # Use Nginx with Certbot
   docker run -it --rm --network app-network \
     -v /etc/letsencrypt:/etc/letsencrypt \
     certbot/certbot certonly --standalone -d yourdomain.com
   ```

### Database Backup

```bash
# Backup PostgreSQL
docker-compose exec -T db pg_dump -U daniel daniel_silva_photo > backup.sql

# Restore
docker-compose exec -T db psql -U daniel daniel_silva_photo < backup.sql
```

## Pricing Integration

The platform includes Stripe integration for payment processing:

1. **Add Stripe keys to .env files**
2. **Implement payment intent creation** in booking endpoint
3. **Handle webhook callbacks** for payment confirmation
4. **Update booking payment status** on successful payment

## Email Configuration

SendGrid is configured for automated emails:
- Booking confirmations
- Invoice reminders
- Payment notifications
- Gallery delivery notifications

## Image Optimization

- Frontend uses Next.js Image component for optimization
- Backend serves optimized images via CDN
- Thumbnail generation for galleries
- Responsive image sizing

## Security Considerations

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Environment variable protection
- ✅ HTTPS/SSL ready
- ✅ Rate limiting ready (implement with Fastapi-limiter)
- ⚠️ Add CSRF protection for production
- ⚠️ Enable API rate limiting
- ⚠️ Use secrets manager for production keys

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

**Database connection error:**
```bash
docker-compose logs db
# Check if db service is healthy
docker-compose ps
```

**Frontend can't reach backend:**
- Check NEXT_PUBLIC_API_URL environment variable
- Ensure backend container is running
- Check nginx configuration

**Images not loading:**
- Verify image paths in public/images directory
- Check image permissions: `chmod 644 public/images/*`
- Check nginx volume mounts

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally with Docker
4. Submit PR with description

## License

Proprietary - Daniel Silva Photography

## Support

For issues and questions:
- Email: contact@danielsilva.photo
- Phone: (555) 123-4567
- Response time: 24 hours

## Roadmap

- [ ] Instagram feed auto-sync
- [ ] AI-powered image tagging
- [ ] Custom print shop integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Client referral program
- [ ] Video hosting integration
