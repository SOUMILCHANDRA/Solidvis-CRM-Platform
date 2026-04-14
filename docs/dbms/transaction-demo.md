# DBMS Transaction Demonstration

This module demonstrates the implementation of Database Transactions (PostgreSQL via Supabase RPC) and maps them to the ACID properties.

## 1. Transaction Flow

The `create_order_transaction` function performs two atomic operations:
1.  **Insert Order**: Creates a new record in the `ORDERS` table.
2.  **Insert Invoice**: Creates a corresponding record in the `INVOICE` table linked to the order.

### ACID Properties Mapping

-   **Atomicity**: Either both the Order and Invoice are inserted, or neither are. If the invoice insert fails (e.g., due to a constraint or manual validation error), the order insert is rolled back automatically.
-   **Consistency**: The database remains in a consistent state by enforcing schema constraints (foreign keys, check constraints) during the transaction.
-   **Isolation**: The transaction runs in isolation; other concurrent transactions cannot see the temporary state of the database before the commit.
-   **Durability**: Once successfully committed, the data is stored permanently in the database and will survive system failures.

## 2. Screenshot Demonstrations

### ✓ Success Case
*Insert successful for both ORDERS and INVOICE tables.*

![Success Screenshot Placeholder](./mongodb/screenshots/success_case.png)

### ✗ Failure (Rollback) Case
*Triggered when amount < 0. Neither record exists in the database after the crash.*

![Rollback Screenshot Placeholder](./mongodb/screenshots/rollback_case.png)

## 3. Implementation Details

### Supabase RPC (SQL)
```sql
CREATE OR REPLACE FUNCTION create_order_transaction(comp_id BIGINT, amt DECIMAL)
RETURNS void AS $$
DECLARE
    new_order_id TEXT;
    new_invoice_id TEXT;
BEGIN
    -- Validation: Business Level Rollback Trigger
    IF amt < 0 THEN
        RAISE EXCEPTION 'Amount cannot be negative! Rollback triggered.';
    END IF;

    -- Generate Unique IDs
    new_order_id := 'TXN_ORD_' || floor(random() * 1000000)::text;
    new_invoice_id := 'TXN_INV_' || floor(random() * 1000000)::text;

    -- Step 1: Insert into ORDERS
    INSERT INTO ORDERS (order_id, company_id, employee_id, order_type, status, order_date)
    VALUES (new_order_id, comp_id, 1, 'Transaction Test', 'Pending', CURRENT_DATE);

    -- Step 2: Insert into INVOICE
    INSERT INTO INVOICE (invoice_id, order_id, invoice_amount, tax_amount, total_amount, invoice_date)
    VALUES (new_invoice_id, new_order_id, amt, amt * 0.18, amt * 1.18, CURRENT_DATE);

END;
$$ LANGUAGE plpgsql;
```
