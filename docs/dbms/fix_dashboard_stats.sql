-- Fix for Dashboard Revenue accurately reflecting transaction data
-- This RPC calculates real-time metrics from the database instead of using estimations.

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
SECURITY DEFINER -- Runs with owner privileges to bypass RLS if needed for global stats
LANGUAGE plpgsql
AS $$
DECLARE
    company_count BIGINT;
    order_count BIGINT;
    invoice_count BIGINT;
    total_rev NUMERIC;
BEGIN
    -- 1. Get exact counts (optimized by Postgres for large tables)
    SELECT count(*) INTO company_count FROM company;
    SELECT count(*) INTO order_count FROM orders;
    SELECT count(*) INTO invoice_count FROM invoice;
    
    -- 2. Calculate REAL total revenue from invoices
    SELECT COALESCE(sum(total_amount), 0) INTO total_rev FROM invoice;

    RETURN json_build_object(
        'company_count', company_count,
        'order_count', order_count,
        'invoice_count', invoice_count,
        'total_revenue', ROUND(total_rev, 2)
    );
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon, authenticated, service_role;
