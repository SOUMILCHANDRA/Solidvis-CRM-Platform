-- ======================================================================
-- DBMS EXTENSION: TEAM MANAGEMENT TABLE SETUP
-- ======================================================================

CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(150),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Ensure Row Level Security (RLS) is disabled or properly configured on this table for the frontend CRUD to work without authentication tokens.
