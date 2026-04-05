-- Clean up existing tables safely
DROP TABLE IF EXISTS LICENSE CASCADE;
DROP TABLE IF EXISTS PAYMENT CASCADE;
DROP TABLE IF EXISTS INVOICE CASCADE;
DROP TABLE IF EXISTS ORDER_DETAILS CASCADE;
DROP TABLE IF EXISTS ORDERS CASCADE;
DROP TABLE IF EXISTS CONTACT_PERSON CASCADE;
DROP TABLE IF EXISTS EMPLOYEE CASCADE;
DROP TABLE IF EXISTS PRODUCT CASCADE;
DROP TABLE IF EXISTS COMPANY CASCADE;

-- 1. Master Tables
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

-- 2. Dependent Tables
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
