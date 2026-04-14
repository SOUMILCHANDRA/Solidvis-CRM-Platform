-- ======================================================================
-- DBMS EXTENSION: TEAM MANAGEMENT TABLE SETUP
-- ======================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  role TEXT,
  email TEXT
);

-- DISABLE RLS FOR DEV OR ADD PERMISSIVE POLICIES
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access" ON team_members;
CREATE POLICY "Public Access" ON team_members FOR ALL USING (true) WITH CHECK (true);

INSERT INTO team_members (name, role, email)
VALUES
('Rahul Sharma', 'Sales Rep', 'rahul@solidvis.com'),
('Priya Mehta', 'Account Manager', 'priya@solidvis.com')
ON CONFLICT (id) DO NOTHING;


-- Note: Ensure Row Level Security (RLS) is disabled or properly configured on this table for the frontend CRUD to work without authentication tokens.
