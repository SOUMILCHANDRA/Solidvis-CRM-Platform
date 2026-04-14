-- ======================================================================
-- DBMS EXTENSION: STRICT ATOMIC TRANSACTION RPC
-- ======================================================================

-- STEP 1: DROP BROKEN FUNCTION
DROP FUNCTION IF EXISTS create_order_transaction;

-- STEP 2: CREATE BULLETPROOF FUNCTION
CREATE OR REPLACE FUNCTION create_order_transaction(
    comp_id UUID,
    amt NUMERIC
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_order_id UUID;
BEGIN
    -- FORCE FAILURE CONDITION
    IF amt <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    -- INSERT ORDER
    INSERT INTO orders (company_id, total_amount, created_at)
    VALUES (comp_id, amt, NOW())
    RETURNING id INTO new_order_id;

    -- VERIFY ORDER INSERTED
    IF new_order_id IS NULL THEN
        RAISE EXCEPTION 'Order insertion failed';
    END IF;

    -- INSERT INVOICE (linked)
    INSERT INTO invoices (order_id, amount, issued_date)
    VALUES (new_order_id, amt, NOW());

    -- SUCCESS
    RETURN 'TRANSACTION SUCCESS';

EXCEPTION
    WHEN OTHERS THEN
        -- THIS FORCES ROLLBACK
        RAISE EXCEPTION 'TRANSACTION FAILED: %', SQLERRM;
END;
$$;
