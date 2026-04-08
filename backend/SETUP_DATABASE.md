# Database Setup Instructions

The Daniel Silva Photography backend requires manual database initialization on DigitalOcean due to permission limitations with the default database user.

## Problem

The database user `dev-db-048240` has read/write access but cannot create tables, even with `GRANT CREATE ON SCHEMA public` commands. DigitalOcean restricts schema modifications to the database owner.

## Solution

You must run the table creation and admin seeding using **DigitalOcean's database owner credentials** (the credentials used when initially creating the database).

### Step 1: Connect as Database Owner

Log into DigitalOcean Console → Databases → your cluster → Connection Details

Use the **owner credentials** (NOT the `dev-db-048240` user) to connect via:
- CLI: `psql` with owner connection string
- Or: DigitalOcean's built-in SQL editor in the console

### Step 2: Run Initialization SQL

Execute this SQL script as the database owner:

```sql
-- Create all tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    role VARCHAR DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR,
    image_url VARCHAR,
    thumbnail_url VARCHAR,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR,
    event_type VARCHAR,
    quote TEXT,
    rating FLOAT,
    image_url VARCHAR,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    price FLOAT,
    deliverables TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id),
    package_id INTEGER REFERENCES service_packages(id),
    event_date TIMESTAMP,
    event_type VARCHAR,
    event_location VARCHAR,
    notes TEXT,
    status VARCHAR DEFAULT 'pending',
    total_price FLOAT,
    deposit_paid BOOLEAN DEFAULT false,
    payment_intent_id VARCHAR,
    deliverables_ready BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    email VARCHAR,
    name VARCHAR,
    phone VARCHAR,
    event_type VARCHAR,
    event_date VARCHAR,
    message TEXT,
    status VARCHAR DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    invoice_number VARCHAR UNIQUE,
    amount FLOAT,
    status VARCHAR DEFAULT 'draft',
    due_date TIMESTAMP,
    paid_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_username ON users(username);
CREATE INDEX IF NOT EXISTS ix_portfolios_title ON portfolios(title);
CREATE INDEX IF NOT EXISTS ix_service_packages_name ON service_packages(name);
CREATE INDEX IF NOT EXISTS ix_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS ix_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Grant all permissions to dev-db-048240 user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "dev-db-048240";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "dev-db-048240";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "dev-db-048240";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "dev-db-048240";

-- Create admin user
-- Email: admin@danielsilva.photography
-- Password (plaintext): TempAdmin2026!Secure
-- Password (bcrypt hash): $2b$12$Pop3O/CZmdx0BzlV8JQiOOdyT05bGyAo/GwJxeMyYL/qPViu4kvka
INSERT INTO users (email, username, hashed_password, full_name, is_active, is_admin, role, created_at)
VALUES (
    'admin@danielsilva.photography',
    'admin',
    '$2b$12$Pop3O/CZmdx0BzlV8JQiOOdyT05bGyAo/GwJxeMyYL/qPViu4kvka',
    'Admin User',
    true,
    true,
    'admin',
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Verify setup
SELECT COUNT(*) as total_users FROM users;
SELECT email, is_admin, role FROM users WHERE email = 'admin@danielsilva.photography';
```

### Step 3: Verify

After running the SQL:
1. Confirm all tables were created: `\dt` (in psql)
2. Confirm admin user exists:
   ```sql
   SELECT email, is_admin, role FROM users WHERE email = 'admin@danielsilva.photography';
   ```

### Step 4: Deploy Backend

Once tables are created, deploy the backend. The app will:
- Use `Base.metadata.create_all()` which safely handles tables that already exist
- Seed additional users if needed
- Run normally with the existing schema

## Alternative: Self-Service via DigitalOcean Console

1. Go to DigitalOcean Dashboard → Databases → your cluster
2. Click "Connection Details" and use the **owner credentials**
3. Click the "SQL Editor" tab in DigitalOcean console
4. Paste the SQL script above and execute it

## Questions?

If you need to modify table schemas later, use Alembic:
```bash
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

(Alembic will work once the initial tables exist and permissions are fully granted.)
