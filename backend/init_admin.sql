-- Daniel Silva Photography - Admin User Initialization
-- Run this in DigitalOcean Database Console with owner credentials
-- Then the app can connect and use this admin account

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

-- Admin user: admin@danielsilva.photography
-- Password (plaintext): TempAdmin2026!Secure
-- Password (bcrypt): $2b$12$Pop3O/CZmdx0BzlV8JQiOOdyT05bGyAo/GwJxeMyYL/qPViu4kvka
INSERT INTO users (email, username, hashed_password, full_name, is_active, is_admin, role)
VALUES (
    'admin@danielsilva.photography',
    'admin',
    '$2b$12$Pop3O/CZmdx0BzlV8JQiOOdyT05bGyAo/GwJxeMyYL/qPViu4kvka',
    'Admin User',
    true,
    true,
    'admin'
) ON CONFLICT (email) DO NOTHING;
