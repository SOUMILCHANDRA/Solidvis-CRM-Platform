-- ======================================================================
-- DBMS EXTENSION: TEAM MANAGEMENT TABLE SETUP
-- ======================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  role TEXT,
  email TEXT
);

INSERT INTO team_members (name, role, email)
VALUES
('Rahul Sharma', 'Sales Rep', 'rahul@solidvis.com'),
('Priya Mehta', 'Account Manager', 'priya@solidvis.com');

-- Note: Ensure Row Level Security (RLS) is disabled or properly configured on this table for the frontend CRUD to work without authentication tokens.
