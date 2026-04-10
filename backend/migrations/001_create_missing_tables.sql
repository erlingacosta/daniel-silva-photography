-- Migration: Create missing tables for production database
-- Run this with doadmin credentials on the DigitalOcean managed PostgreSQL

CREATE TABLE IF NOT EXISTS faq_items (
  id SERIAL PRIMARY KEY,
  question VARCHAR,
  answer TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ala_carte_services (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  price FLOAT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  message TEXT,
  status VARCHAR DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Grant permissions to dev-db-048240 user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "dev-db-048240";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "dev-db-048240";
