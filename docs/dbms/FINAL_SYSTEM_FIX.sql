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

-- 3. Seed expanded representative list
INSERT INTO team_members (name, role, email)
VALUES
('Rahul Sharma', 'Regional Sales Manager', 'rahul@solidvis.com'),
('Priya Mehta', 'Account Executive', 'priya@solidvis.com'),
('Aman Verma', 'Senior Sales Engineer', 'aman@solidvis.com'),
('Simran Kaur', 'Channel Partner Manager', 'simran@solidvis.com'),
('Vikram Singh', 'Enterprise Solutions Lead', 'vikram@solidvis.com'),
('Ananya Gupta', 'Sales Coordinator', 'ananya@solidvis.com'),
('Siddharth Malhotra', 'Business Development Rep', 'siddharth@solidvis.com')
ON CONFLICT DO NOTHING;

-- 4. Adapt Orders table to support UUID Representatives (Migration)
DO $$ 
BEGIN 
  -- 1. Drop existing foreign key pointing to the old 'EMPLOYEE' table
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_order_employee' AND table_name = 'orders') THEN
    ALTER TABLE orders DROP CONSTRAINT fk_order_employee;
  END IF;

  -- 2. Change column type to UUID
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'employee_id' AND data_type = 'integer') THEN
    ALTER TABLE orders ALTER COLUMN employee_id TYPE UUID USING NULL; 
  END IF;

  -- 3. Add NEW foreign key pointing to 'team_members'
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_order_team' AND table_name = 'orders') THEN
    ALTER TABLE orders ADD CONSTRAINT fk_order_team FOREIGN KEY (employee_id) REFERENCES team_members(id) ON DELETE SET NULL;
  END IF;
END $$;


-- 5. Atomic Transaction Function (STRICT VALIDATION)
CREATE OR REPLACE FUNCTION create_order_transaction(
    comp_id BIGINT,
    rep_id UUID,
    amt NUMERIC NOT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    gen_order_id VARCHAR(50);
    gen_invoice_id VARCHAR(50);
    tax_calc NUMERIC;
BEGIN
    -- DEBUG LOGGING
    RAISE NOTICE 'Transaction amount received: %', amt;

    -- STRICT VALIDATION (STEP 1 & 3)
    IF amt IS NULL OR amt <= 0 THEN
        RAISE EXCEPTION 'Invalid transaction amount. Must be greater than zero.';
    END IF;

    -- Generate IDs matching VARCHAR(50) pattern
    gen_order_id := 'ORD-' || upper(substring(gen_random_uuid()::text from 1 for 8));
    gen_invoice_id := 'INV-' || upper(substring(gen_random_uuid()::text from 1 for 8));
    tax_calc := (amt * 0.18); -- 18% standard tax

    -- 1. Insert into ORDERS table
    INSERT INTO orders (order_id, company_id, employee_id, order_type, status, order_date)
    VALUES (gen_order_id, comp_id, rep_id, 'Transactional', 'Active', CURRENT_DATE);

    -- 2. Insert into INVOICE table
    INSERT INTO invoice (invoice_id, order_id, invoice_amount, tax_amount, total_amount, invoice_date)
    VALUES (gen_invoice_id, gen_order_id, amt, tax_calc, amt + tax_calc, CURRENT_DATE);

    RETURN 'SUCCESS: ' || gen_order_id;
EXCEPTION
    WHEN OTHERS THEN 
        RAISE EXCEPTION 'TRANSACTION FAILED: %', SQLERRM;
END;
$$;
