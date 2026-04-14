# Database Transactions: Order & Invoice Management

## Transaction Scenarios
In a CRM/ERP system, a transaction ensures that related operations succeed or fail as a single unit (ACID properties).

### Scenario: Order and Invoice Atomic Creation
When a customer places an order, the system must:
1.  **Insert an Order Record**: Create the main order entry.
2.  **Insert Order Items**: Add individual items associated with the order.
3.  **Generate an Invoice**: Create a financial record for the order.

**Failure Case**: If the Order Item insertion fails but the Invoice is created, the system has a "ghost" invoice with no record of what was purchased. Transactions prevent this inconsistency.

---

## Transaction Schedules

### Serial Schedule (S1)
Transactions are executed one after another.
- **T1**: Create Order A -> Create Invoice A
- **T2**: Create Order B -> Create Invoice B

### Interleaved Schedule (Concurrency)
Operations from T1 and T2 overlap to maximize CPU usage.
- **T1**: Create Order A
- **T2**: Create Order B
- **T1**: Create Invoice A
- **T2**: Create Invoice B

---

## The Lost Update Problem
Occurs when two transactions read the same value, modify it, and write it back, resulting in one update overwriting the other.

| Time | Transaction 1 (T1) | Transaction 2 (T2) | Balance Value |
| :--- | :--- | :--- | :--- |
| t1 | Read(Balance) | | 1000 |
| t2 | | Read(Balance) | 1000 |
| t3 | Balance = Balance - 200 | | 1000 |
| t4 | | Balance = Balance + 500 | 1000 |
| t5 | Write(Balance) | | 800 |
| t6 | | Write(Balance) | 1500 |

**Result**: T1's update (-200) is completely lost. The final balance should have been 1300.

---

## SQL Implementation Examples

### Success Sequence
```sql
BEGIN;

-- 1. Create Order
INSERT INTO orders (customer_id, order_date, status) 
VALUES (101, NOW(), 'pending') 
RETURNING id;

-- 2. Create Invoice Linked to Order
INSERT INTO invoices (order_id, amount, status) 
VALUES (5001, 250.00, 'unpaid');

COMMIT;
```

### Failure & Recovery
```sql
BEGIN;

-- Update Inventory
UPDATE products SET stock = stock - 5 WHERE id = 12;

-- Check if stock went negative (Error logic happens here)
-- If error:
ROLLBACK;
-- Stock returns to original state.
```
