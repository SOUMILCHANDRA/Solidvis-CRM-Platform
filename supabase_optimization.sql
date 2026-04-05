-- Performance Optimization for 500,000+ Records
-- 1. Indexing COMPANY table for fast name lookups and joins
CREATE INDEX IF NOT EXISTS idx_company_name ON COMPANY(company_name);

-- 2. Indexing ORDERS table for status filtering and date-based trajectory
CREATE INDEX IF NOT EXISTS idx_orders_status ON ORDERS(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON ORDERS(order_date);

-- 3. Indexing INVOICE table for revenue calculations and date trajectory
CREATE INDEX IF NOT EXISTS idx_invoice_date ON INVOICE(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_total ON INVOICE(total_amount);

-- 4. Indexing PAYMENT table for status counts and timeline feed
CREATE INDEX IF NOT EXISTS idx_payment_status ON PAYMENT(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_date ON PAYMENT(payment_date);

-- 5. Creating a High-Performance View for Revenue Stats (Optional but recommended)
-- Note: Requires DB access to execute. Client SDK cannot create views.
