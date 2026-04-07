# Setup & Deployment Guide

## Local Development Setup

### Prerequisites
- Docker Desktop or Docker Engine + Docker Compose
- Git
- Text editor (VSCode recommended)

### Step 1: Clone and Configure

```bash
# Navigate to project
cd daniel-silva-photography

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### Step 2: Update Environment Variables

**backend/.env**
```env
DATABASE_URL=postgresql://daniel:danielsilva@db:5432/daniel_silva_photo
SECRET_KEY=dev-secret-key-not-for-production-12345
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
SENDGRID_API_KEY=SG.YOUR_KEY_HERE
SENDGRID_FROM_EMAIL=contact@danielsilva.photo
CORS_ORIGINS=http://localhost:3000,http://localhost
DEBUG=True
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### Step 3: Start Services

```bash
# Start all services in background
docker-compose up -d

# Check status
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

### Step 4: Initialize Database

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Create admin user
docker-compose exec backend python << 'EOF'
from database import SessionLocal
from models import User
from routers.auth import get_password_hash

db = SessionLocal()
admin = User(
    email='admin@danielsilva.photo',
    full_name='Daniel Silva',
    password_hash=get_password_hash('password123'),
    role='admin',
    is_active=True
)
db.add(admin)
db.commit()
print(f"✓ Admin user created: {admin.email}")
EOF
```

### Step 5: Verify Setup

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
open http://localhost:3000

# Check API docs
open http://localhost:8000/docs
```

## Development Workflow

### Frontend Development

```bash
# Terminal 1: Start frontend with hot reload
docker-compose exec frontend npm run dev

# Frontend runs on http://localhost:3000
```

### Backend Development

```bash
# Terminal 2: Start backend with auto-reload
docker-compose exec backend uvicorn main:app --reload --host 0.0.0.0

# Backend runs on http://localhost:8000
```

### Database Changes

```bash
# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "Add new field"

# Review and edit alembic/versions/XXX_add_new_field.py

# Apply migration
docker-compose exec backend alembic upgrade head

# Rollback if needed
docker-compose exec backend alembic downgrade -1
```

## Testing Locally

### Test Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Test Bookings

```bash
# Create booking inquiry
curl -X POST http://localhost:8000/api/bookings/inquiry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "service_type": "wedding",
    "event_date": "2024-06-15T18:00:00",
    "event_location": "Hotel Grand Ballroom",
    "package": "Premium Plus",
    "notes": "Outdoor ceremony with indoor reception"
  }'
```

## Production Deployment

### Prerequisites for Cloud (DigitalOcean)

1. Create Ubuntu 24.04 droplet (2GB RAM, 2 CPU minimum)
2. Enable Docker option
3. Add SSH key
4. Create firewall rules for ports 80, 443, 22

### Deployment Steps

```bash
# 1. SSH into droplet
ssh root@your_droplet_ip

# 2. Clone repository
git clone https://github.com/yourusername/daniel-silva-photography.git
cd daniel-silva-photography

# 3. Create production .env files
nano backend/.env
# Add production values:
# - Strong SECRET_KEY
# - Real Stripe API keys
# - Real SendGrid API key
# - Production database credentials
# - CORS_ORIGINS with your domain
# - DEBUG=False

nano frontend/.env.local
# Add production values

# 4. Create .env for docker-compose
nano .env.prod
# DATABASE_PASSWORD=strong_password_here
# SECRET_KEY=your-production-secret-key-here

# 5. Update docker-compose.prod.yml if needed
nano docker-compose.yml

# 6. Start services
docker-compose up -d

# 7. Setup SSL with Let's Encrypt
docker run -it --rm --network host \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com

# 8. Update nginx.conf for SSL
# See nginx-ssl.conf below

# 9. Restart nginx
docker-compose restart nginx
```

### Nginx SSL Configuration (nginx/nginx.conf)

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Configuration
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL certificates
        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        client_max_body_size 100M;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # API
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }

        # Health check
        location /health {
            proxy_pass http://backend/health;
        }
    }
}
```

## Database Backup & Restore

### Regular Backups

```bash
#!/bin/bash
# Save as: backup.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/daniel_silva_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

docker-compose exec -T db pg_dump -U daniel daniel_silva_photo > $BACKUP_FILE

# Keep only last 7 backups
find $BACKUP_DIR -name "daniel_silva_*.sql" -mtime +7 -delete

echo "✓ Backup created: $BACKUP_FILE"
```

### Restore from Backup

```bash
docker-compose exec -T db psql -U daniel daniel_silva_photo < backups/daniel_silva_20240115_143022.sql
```

## Monitoring & Maintenance

### Check Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Live logs
docker-compose logs -f
```

### Container Health

```bash
# Check status
docker-compose ps

# Restart service
docker-compose restart backend

# Restart all
docker-compose restart

# View container stats
docker stats
```

### Database Maintenance

```bash
# Connect to database
docker-compose exec db psql -U daniel daniel_silva_photo

# Useful SQL commands:
# \dt - List tables
# \du - List users
# SELECT COUNT(*) FROM bookings; - Count records
# VACUUM; - Clean up
# ANALYZE; - Analyze table stats
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 PID

# Or use different ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check database logs
docker-compose logs db

# Verify connection string
docker-compose exec backend python -c "from config import settings; print(settings.DATABASE_URL)"

# Test connection
docker-compose exec db psql -U daniel -d daniel_silva_photo -c "SELECT 1;"
```

### Frontend Can't Reach Backend

```bash
# Check API URL
docker-compose exec frontend bash -c 'echo $NEXT_PUBLIC_API_URL'

# Test backend connectivity
curl http://localhost:8000/health

# Check nginx logs
docker-compose logs nginx
```

### Memory Issues

```bash
# Increase Docker memory
# Edit docker-compose.yml:
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           memory: 1G

docker-compose up -d
```

## Performance Optimization

```bash
# Frontend optimization
frontend/
  └─ next.config.js (image optimization)
     └─ unoptimized: false (enable optimization)

# Backend optimization
backend/
  └─ database.py
     └─ pool_size: 10 (connection pooling)
     └─ max_overflow: 20

# Database optimization
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security Hardening

- [ ] Change default database password
- [ ] Update SECRET_KEY to strong random value
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Enable database backups
- [ ] Setup monitoring/alerts
- [ ] Implement rate limiting
- [ ] Setup API key rotation
- [ ] Enable CORS restriction
- [ ] Setup log aggregation

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Admin user created
- [ ] SSL certificates installed
- [ ] Email service configured and tested
- [ ] Stripe keys configured and tested
- [ ] Database backups scheduled
- [ ] Logs configured
- [ ] Monitoring setup
- [ ] DNS pointing to server
- [ ] Site live and accessible
