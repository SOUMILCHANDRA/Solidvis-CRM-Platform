DO $$
DECLARE
  comp_arr BIGINT[] := ARRAY[200000000079457, 200000000442070, 200000000469165, 200000000596445, 200000000596471];
  prod_arr VARCHAR[] := ARRAY['CWXW', 'EPWW', 'SMTW', 'SMTW-O', 'SPTW', 'SWTW', 'TCXW', 'XWA-OC'];
BEGIN
  -- Synchronize sequences from the manual inserts
  PERFORM setval(pg_get_serial_sequence('order_details', 'order_detail_id'), coalesce(max(order_detail_id), 1), true) FROM order_details;
  PERFORM setval(pg_get_serial_sequence('payment', 'payment_id'), coalesce(max(payment_id), 1), true) FROM payment;

  -- Insert 500,000 Massive Dummy Orders (Takes about 3 seconds on Supabase)
  INSERT INTO ORDERS (order_id, company_id, employee_id, order_type, status, order_date)
  SELECT 
      'PO_M_' || i,
      comp_arr[1 + mod(i, array_length(comp_arr, 1))],
      (1 + mod(i, 7)),
      CASE WHEN random() > 0.5 THEN 'New' ELSE 'Renewal' END,
      'Active W/Support',
      CURRENT_DATE - (random() * 365 * 3)::integer
  FROM generate_series(1, 500000) AS i;

  -- Insert 500,000 Corresponding Order Details
  INSERT INTO ORDER_DETAILS (order_id, product_id, quantity, selling_price)
  SELECT 
      'PO_M_' || i,
      prod_arr[1 + mod(i, array_length(prod_arr, 1))],
      (random() * 20 + 1)::int,
      round((random() * 50000 + 10000)::numeric, 2)
  FROM generate_series(1, 500000) AS i;

  -- Insert 500,000 Corresponding Invoices
  INSERT INTO INVOICE (invoice_id, order_id, invoice_amount, tax_amount, total_amount, invoice_date)
  SELECT 
      'INV_M_' || i,
      'PO_M_' || i,
      round((random() * 100000)::numeric, 2),
      round((random() * 18000)::numeric, 2),
      round((random() * 118000)::numeric, 2),
      CURRENT_DATE - (random() * 365 * 3)::integer
  FROM generate_series(1, 500000) AS i;
  
  -- Insert 500,000 Corresponding Payments
  INSERT INTO PAYMENT (invoice_id, payment_date, payment_mode, amount_paid, payment_status)
  SELECT 
      'INV_M_' || i,
      CURRENT_DATE - (random() * 365 * 3)::integer,
      CASE WHEN random() > 0.5 THEN 'ONLINE' ELSE 'CHEQUE' END,
      round((random() * 118000)::numeric, 2),
      CASE WHEN random() > 0.3 THEN 'RECEIVED' ELSE 'PENDING' END
  FROM generate_series(1, 500000) AS i;

END $$;
