# SQL vs. MongoDB: CRM Comparison

## Database Paradigm Comparison

| Feature | PostgreSQL (Relational) | MongoDB (Document) |
| :--- | :--- | :--- |
| **Data Model** | Tables with Fixed Rows/Columns | JSON-like Dynamic Documents |
| **Schema** | Rigid (Schema-on-Write) | Flexible (Schema-on-Read) |
| **Relationships** | JOINs (Normalised) | Embedding or Referencing (Denormalised) |
| **Transactions** | Full ACID (Highly Mature) | ACID (Multi-doc since 4.0) |
| **Scaling** | Vertical (Mostly) | Horizontal (Sharding) |

---

## Technical Trade-offs
- **Use PostgreSQL when**: You have complex relationships, require strict data integrity, and complex multi-table joins are common.
- **Use MongoDB when**: Your data structure is evolving rapidly, you need to handle massive volumes of "unstructured" or semi-structured data, and horizontal scaling is a priority.

---

## Equivalent Query Examples

### 1. Simple Filter
**SQL**:
```sql
SELECT * FROM orders WHERE status = 'shipped' AND total_amount > 500;
```
**MongoDB**:
```javascript
db.orders.find({ status: "shipped", totalAmount: { $gt: 500 } });
```

### 2. Joining Data
**SQL**:
```sql
SELECT c.name, o.total_amount 
FROM companies c
JOIN customers cust ON c.id = cust.company_id
JOIN orders o ON cust.id = o.customer_id;
```
**MongoDB**:
```javascript
db.companies.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "_id",
      foreignField: "companyId",
      as: "customerList"
    }
  },
  { $unwind: "$customerList" },
  {
    $lookup: {
      from: "orders",
      localField: "customerList._id",
      foreignField: "customerId",
      as: "orderList"
    }
  }
]);
```
---
*Conclusion: While SQL excels at relational integrity via JOINs, MongoDB offers superior developer velocity for hierarchical data via nesting.*
