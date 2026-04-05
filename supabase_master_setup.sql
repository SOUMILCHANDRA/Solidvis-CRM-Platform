-- 1. CLEAN UP EXISTING TABLES
DROP TABLE IF EXISTS LICENSE CASCADE;
DROP TABLE IF EXISTS PAYMENT CASCADE;
DROP TABLE IF EXISTS INVOICE CASCADE;
DROP TABLE IF EXISTS ORDER_DETAILS CASCADE;
DROP TABLE IF EXISTS ORDERS CASCADE;
DROP TABLE IF EXISTS CONTACT_PERSON CASCADE;
DROP TABLE IF EXISTS EMPLOYEE CASCADE;
DROP TABLE IF EXISTS PRODUCT CASCADE;
DROP TABLE IF EXISTS COMPANY CASCADE;

-- 2. CREATE SCHEMAS
CREATE TABLE COMPANY (
    company_id BIGINT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(15) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    postal_code INT
);

CREATE TABLE EMPLOYEE (
    employee_id SERIAL PRIMARY KEY,
    employee_name VARCHAR(150) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE PRODUCT (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    license_type VARCHAR(100),
    version_year VARCHAR(50)
);

CREATE TABLE CONTACT_PERSON (
    contact_id SERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    CONSTRAINT fk_contact_company FOREIGN KEY (company_id) 
        REFERENCES COMPANY(company_id) ON DELETE CASCADE
);

CREATE TABLE ORDERS (
    order_id VARCHAR(50) PRIMARY KEY,
    company_id BIGINT NOT NULL,
    employee_id INT,
    order_type VARCHAR(100),
    status VARCHAR(50),
    order_date DATE,
    CONSTRAINT fk_order_company FOREIGN KEY (company_id) 
        REFERENCES COMPANY(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_employee FOREIGN KEY (employee_id) 
        REFERENCES EMPLOYEE(employee_id) ON DELETE SET NULL
);

CREATE TABLE ORDER_DETAILS (
    order_detail_id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    selling_price DECIMAL(15,2) NOT NULL CHECK (selling_price >= 0),
    CONSTRAINT fk_od_order FOREIGN KEY (order_id) 
        REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_od_product FOREIGN KEY (product_id) 
        REFERENCES PRODUCT(product_id)
);

CREATE TABLE INVOICE (
    invoice_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    invoice_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    invoice_date DATE,
    CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) 
        REFERENCES ORDERS(order_id) ON DELETE CASCADE
);

CREATE TABLE PAYMENT (
    payment_id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode VARCHAR(50),
    amount_paid DECIMAL(15,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) 
        REFERENCES INVOICE(invoice_id) ON DELETE CASCADE
);

CREATE TABLE LICENSE (
    license_id VARCHAR(50) PRIMARY KEY,
    order_detail_id INT, 
    license_key VARCHAR(255) UNIQUE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    CONSTRAINT fk_license_order_detail FOREIGN KEY (order_detail_id) 
        REFERENCES ORDER_DETAILS(order_detail_id) ON DELETE CASCADE
);

-- 3. ENTERPRISE TABLES (RBAC & AUDIT)
CREATE TABLE USER_ROLE (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'Sales', -- Admin, Sales, Finance
    full_name VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE AUDIT_LOG (
    log_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. INSERT BASE DATA
INSERT INTO COMPANY (company_id, company_name, gst_number, address, city, postal_code) VALUES
(200000000079457, 'BELRISE INDUSTRIES LIMITED', '27AAACB9378F1ZG', 'MIDC Chakan Phase II', 'PUNE', 410501),
(200000000442070, 'GCENTRI FORCE ENGINEERING PRIVATE LIMITED', '27AAECG7697J1ZW', 'MIDC Pimpri', 'PUNE', 411018),
(200000000469165, 'CHHEDA ELECTRICALS AND ELECTRONICS PVT LTD', '27AAACC7268D1ZQ', 'ICS Colony Ganeshkhind Rd', 'PUNE', 411007),
(200000000596445, 'SDTORK CONTROLS PVT LTD', '27AAJCS6006Q1ZS', 'Taluka Khed', 'ALANDI RURAL', 412105),
(200000000596471, 'SUDE ENGINEERING CORP', '27ABMCS4842C1Z8', 'Taluka Khed', 'PUNE', 412105),
(200000000703025, 'CHALLENGER SWEEPERS PRIVATE LIMITED', '27AAGCC4389P1ZV', 'Alandi Road', 'PUNE', 411015),
(200000000747050, 'DUNCAN ENGINEERING LIMITED', '27AAACS0769H1ZA', 'MIDC Karegaon Shirur', 'PUNE', 412220),
(200000000880064, 'INTEGRATED EQUIPMENT INDIA PVT LTD', '27AAACW6150A1ZP', 'Kondhapuri Nagar Road Shirur', 'PUNE', 412208);

INSERT INTO EMPLOYEE (employee_id, employee_name, role, email) VALUES
(1, 'DEVENDRA PATIL', 'Sr. Sales Engineer', 'devendra@cadotech.in'),
(2, 'PRATIK SONAJE', 'Sr. Sales Engineer', 'pratik@cadotech.in'),
(3, 'LALIT KILASKAR', 'Manager', 'lalik@cadotech.com'),
(4, 'MANTHAN LADKE', 'Jr. Sales Engineer', 'manthan@cadotech.in'),
(5, 'GAURAV JAYBHAYE', 'Sr. Sales Engineer', 'gaurav@cadotech.in'),
(6, 'SAURABH RASAL', 'Jr. Sales Engineer', 'saurabh@cadotech.in'),
(7, 'DNAYESHWAR K', 'Jr. Sales Engineer', 'dnayeshwar@cadotech.in');

INSERT INTO PRODUCT (product_id, product_name, license_type, version_year) VALUES
('CWXW', 'SOLIDWORKS Simulation Standard', 'ADD ON', 'SOLIDWORKS 2026'),
('EPWW', 'SOLIDWORKS Electrical Professional', 'STAND ALONE', 'SOLIDWORKS 2025'),
('SMTW', 'SOLIDWORKS Premium Technical Product', 'STAND ALONE', 'SOLIDWORKS 2025'),
('SMTW-O', 'SOLIDWORKS Premium Network Technical Product', 'NETWORK FLOATING', 'SOLIDWORKS 2025'),
('SPTW', 'SOLIDWORKS Professional Technical Product', 'STAND ALONE', 'SOLIDWORKS 2025'),
('SWTW', 'SOLIDWORKS Standard Technical Product', 'STAND ALONE', 'SOLIDWORKS 2025'),
('TCXW', 'SOLIDWORKS Composer', 'STAND ALONE', 'SOLIDWORKS 2026'),
('XWA-OC', '3DEXPERIENCE SOLIDWORKS Standard', 'USER BASED LICENSE', '3DEXPERIENCE R2025x');

INSERT INTO ORDERS (order_id, company_id, employee_id, order_type, status, order_date) VALUES
('PO_AIN0002934', 200000000596471, 4, 'New', 'Active W/Support', '2025-11-19'),
('PO_AIN0004625', 200000000079457, 3, 'New', 'Active W/Support', '2025-08-27'),
('PO_AIN0007393', 200000000442070, 2, 'TOS Reinstatement', 'Active W/Support', '2025-09-30'),
('PO_AIN0033137', 200000000747050, 7, 'Termination Of Support', 'Active Wo/Support', '2024-11-26');

INSERT INTO ORDER_DETAILS (order_detail_id, order_id, product_id, quantity, selling_price) VALUES
(21, 'PO_AIN0002934', 'SPTW', 2, 1020900.00),
(7, 'PO_AIN0004625', 'XWA-OC', 16, 1476000.00),
(22, 'PO_AIN0007393', 'SWTW', 1, 553500.00),
(13, 'PO_AIN0033137', 'SPTW', 11, 2152500.00);

-- Sync sequences so the massive data generator doesn't crash into the IDs we just inserted!
SELECT setval(pg_get_serial_sequence('order_details', 'order_detail_id'), coalesce(max(order_detail_id), 1), true) FROM order_details;
SELECT setval(pg_get_serial_sequence('employee', 'employee_id'), coalesce(max(employee_id), 1), true) FROM employee;

-- 4. MASSIVE DATA GENERATION (~300MB of Data)
DO $$
DECLARE
  comp_arr BIGINT[] := ARRAY[200000000079457, 200000000442070, 200000000469165, 200000000596445, 200000000596471];
  prod_arr VARCHAR[] := ARRAY['CWXW', 'EPWW', 'SMTW', 'SMTW-O', 'SPTW', 'SWTW', 'TCXW', 'XWA-OC'];
BEGIN
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
