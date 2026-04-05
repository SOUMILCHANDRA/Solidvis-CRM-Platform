-- INSERT COMPANIES
INSERT INTO COMPANY (company_id, company_name, gst_number, address, city, postal_code) VALUES
(200000000079457, 'BELRISE INDUSTRIES LIMITED', '27AAACB9378F1ZG', 'MIDC Chakan Phase II', 'PUNE', 410501),
(200000000442070, 'GCENTRI FORCE ENGINEERING PRIVATE LIMITED', '27AAECG7697J1ZW', 'MIDC Pimpri', 'PUNE', 411018),
(200000000469165, 'CHHEDA ELECTRICALS AND ELECTRONICS PVT LTD', '27AAACC7268D1ZQ', 'ICS Colony Ganeshkhind Rd', 'PUNE', 411007),
(200000000596445, 'SDTORK CONTROLS PVT LTD', '27AAJCS6006Q1ZS', 'Taluka Khed', 'ALANDI RURAL', 412105),
(200000000596471, 'SUDE ENGINEERING CORP', '27ABMCS4842C1Z8', 'Taluka Khed', 'PUNE', 412105),
(200000000703025, 'CHALLENGER SWEEPERS PRIVATE LIMITED', '27AAGCC4389P1ZV', 'Alandi Road', 'PUNE', 411015),
(200000000747050, 'DUNCAN ENGINEERING LIMITED', '27AAACS0769H1ZA', 'MIDC Karegaon Shirur', 'PUNE', 412220),
(200000000880064, 'INTEGRATED EQUIPMENT INDIA PVT LTD', '27AAACW6150A1ZP', 'Kondhapuri Nagar Road Shirur', 'PUNE', 412208);

-- INSERT EMPLOYEES
INSERT INTO EMPLOYEE (employee_id, employee_name, role, email) VALUES
(1, 'DEVENDRA PATIL', 'Sr. Sales Engineer', 'devendra@cadotech.in'),
(2, 'PRATIK SONAJE', 'Sr. Sales Engineer', 'pratik@cadotech.in'),
(3, 'LALIT KILASKAR', 'Manager', 'lalik@cadotech.com'),
(4, 'MANTHAN LADKE', 'Jr. Sales Engineer', 'manthan@cadotech.in'),
(5, 'GAURAV JAYBHAYE', 'Sr. Sales Engineer', 'gaurav@cadotech.in'),
(6, 'SAURABH RASAL', 'Jr. Sales Engineer', 'saurabh@cadotech.in'),
(7, 'DNAYESHWAR K', 'Jr. Sales Engineer', 'dnayeshwar@cadotech.in');

-- INSERT PRODUCTS
INSERT INTO PRODUCT (product_id, product_name, license_type, version_year) VALUES
('CWXW', 'SOLIDWORKS Simulation Standard', 'ADD ON', 'SOLIDWORKS 2026'),
('EPWW', 'SOLIDWORKS Electrical Professional', 'STAND ALONE', 'SOLIDWORKS 2025'),
('SMTW', 'SOLIDWORKS Premium Technical Product', 'STAND ALONE', 'SOLIDWORKS 2025'),
('SMTW-O', 'SOLIDWORKS Premium Network Technical Product', 'NETWORK FLOATING', 'SOLIDWORKS 2025'),
('SPTW', 'SOLIDWORKS Professional Technical Product', 'STAND ALONE', 'SOLIDWORKS 2025'),
('SWTW', 'SOLIDWORKS Standard Technical Product', 'STAND ALONE', 'SOLIDWORKS 2025'),
('TCXW', 'SOLIDWORKS Composer', 'STAND ALONE', 'SOLIDWORKS 2026'),
('XWA-OC', '3DEXPERIENCE SOLIDWORKS Standard', 'USER BASED LICENSE', '3DEXPERIENCE R2025x');

-- INSERT ORDERS
INSERT INTO ORDERS (order_id, company_id, employee_id, order_type, status, order_date) VALUES
('PO_AIN0002934', 200000000596471, 4, 'New', 'Active W/Support', '2025-11-19'),
('PO_AIN0004625', 200000000079457, 3, 'New', 'Active W/Support', '2025-08-27'),
('PO_AIN0007393', 200000000442070, 2, 'TOS Reinstatement', 'Active W/Support', '2025-09-30'),
('PO_AIN0033137', 200000000747050, 7, 'Termination Of Support', 'Active Wo/Support', '2024-11-26');

-- INSERT ORDER DETAILS
INSERT INTO ORDER_DETAILS (order_detail_id, order_id, product_id, quantity, selling_price) VALUES
(21, 'PO_AIN0002934', 'SPTW', 2, 1020900.00),
(7, 'PO_AIN0004625', 'XWA-OC', 16, 1476000.00),
(22, 'PO_AIN0007393', 'SWTW', 1, 553500.00),
(13, 'PO_AIN0033137', 'SPTW', 11, 2152500.00);

-- INSERT INVOICES
INSERT INTO INVOICE (invoice_id, order_id, invoice_amount, tax_amount, total_amount, invoice_date) VALUES
('2025-26/078', 'PO_AIN0002934', 830000, 149400, 979400, '2025-11-28'),
('2025-26/015', 'PO_AIN0004625', 1200000, 216000, 1416000, '2025-08-29'),
('2024-25/150', 'PO_AIN0007393', 450000, 81000, 531000, '2025-10-04'),
('2025-26/050', 'PO_AIN0033137', 1750000, 315000, 2065000, '2024-12-03');

-- INSERT PAYMENTS
INSERT INTO PAYMENT (invoice_id, payment_date, payment_mode, amount_paid, payment_status) VALUES
('2025-26/078', '2025-12-02', 'ONLINE', 979400, 'RECEIVED'),
('2025-26/015', '2025-09-02', 'ONLINE', 1416000, 'PENDING'),
('2024-25/150', '2025-10-06', 'ONLINE', 531000, 'RECEIVED'),
('2025-26/050', '2024-12-08', 'ONLINE', 2065000, 'PENDING');

-- RBAC Initial Data (Assuming some user IDs from auth.users exist or using the current user if possible)
-- For demonstration, we create a trigger or a function to assign roles automatically if not present
-- But for a simple insert, we can use a placeholder
INSERT INTO USER_ROLE (user_id, role, full_name)
SELECT id, 'Admin', 'Master Admin' FROM auth.users LIMIT 1;

