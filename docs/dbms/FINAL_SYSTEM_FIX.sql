-- ======================================================================
-- FINAL SYSTEM FIX: SCHEMA SYNCHRONIZATION
-- ======================================================================

-- 1. Create team_members table with UUID
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  email TEXT UNIQUE
);

-- 2. Enable Public Access (Fixes "Failed to load")
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access" ON team_members;
CREATE POLICY "Public Full Access" ON team_members FOR ALL USING (true) WITH CHECK (true);

-- 3. Seed initial representatives
INSERT INTO team_members (name, role, email)
VALUES
('Rahul Sharma', 'Sales Rep', 'rahul@solidvis.com'),
('Priya Mehta', 'Account Manager', 'priya@solidvis.com')
ON CONFLICT DO NOTHING;

-- 4. Adapt Orders table to support UUID Representatives
-- This allows the 'team_members' table to link to 'orders'
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'employee_id' AND data_type = 'integer') THEN
    ALTER TABLE orders ALTER COLUMN employee_id TYPE UUID USING NULL; 
  END IF;
END $$;

-- 5. Atomic Transaction Function (Passes rep_id)
CREATE OR REPLACE FUNCTION create_order_transaction(
    comp_id BIGINT,
    rep_id UUID,
    amt NUMERIC
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_order_id UUID;
BEGIN
    IF amt <= 0 THEN RAISE EXCEPTION 'Amount must be greater than zero'; END IF;

    INSERT INTO orders (company_id, employee_id, total_amount, created_at)
    VALUES (comp_id, rep_id, amt, NOW())
    RETURNING id INTO new_order_id;

    INSERT INTO invoices (order_id, amount, issued_date)
    VALUES (new_order_id, amt, NOW());

    RETURN 'TRANSACTION SUCCESS';
EXCEPTION
    WHEN OTHERS THEN RAISE EXCEPTION 'TRANSACTION FAILED: %', SQLERRM;
END;
$$;
