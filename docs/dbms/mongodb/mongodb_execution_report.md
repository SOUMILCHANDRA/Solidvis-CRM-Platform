# 🍃 MongoDB Execution Report & Query Results

> **Note:** This academic report details the execution output of the 10 core MongoDB queries implemented for the SolidVis Extension. The results simulate execution via MongoDB Compass/Atlas.

## 1. Insert & Read Operations

### 1.1 Insert One (New Company)
**Query:**
```javascript
db.companies.insertOne({
    company_id: 101,
    company_name: "SolidVis Engineering",
    gst_number: "22AAAAA0000A1Z5",
    address: { city: "Bengaluru", postal_code: 560001 }
});
```

**Execution Result:**
```json
{
  "acknowledged": true,
  "insertedId": ObjectId("652a1b2c9d8e7f6a5b4c3d2e")
}
```

### 1.2 Find (Status Filter)
**Query:**
```javascript
db.orders.find({ status: "Pending" });
```

**Execution Result:**
<details>
<summary>View 2 Documents Returned</summary>

```json
[
  {
    "_id": ObjectId("..."),
    "order_id": "ORD001",
    "company_id": 101,
    "status": "Pending",
    "order_date": "2026-04-14T00:00:00.000Z"
  },
  {
    "_id": ObjectId("..."),
    "order_id": "ORD009",
    "company_id": 102,
    "status": "Pending",
    "order_date": "2026-04-14T00:00:00.000Z"
  }
]
```
</details>

---

## 2. Advanced Aggregations

### 2.1 Group Aggregation ($group)
**Query:**
```javascript
db.invoices.aggregate([
    { $group: { _id: "$payment_status", totalAmount: { $sum: "$invoice_amount" } } }
]);
```

> **Tip:** This returns the total sum grouped by payment status, efficiently replicating a `GROUP BY` SQL clause.

**Execution Result:**
| _id (payment_status) | totalAmount (INR) |
| :------------------- | :---------------- |
| `PENDING`            | 542,000.00        |
| `RECEIVED`           | 1,280,500.00      |


### 2.2 Relational Lookup ($lookup)
**Query:**
```javascript
db.orders.aggregate([
    {
       $lookup: {
          from: "companies",
          localField: "company_id",
          foreignField: "company_id",
          as: "company_details"
       }
    }
]);
```

**Execution Result Structure:**
```json
[
  {
    "order_id": "ORD001",
    "company_id": 101,
    "order_date": "2026-04-14",
    "company_details": [
      {
        "company_name": "SolidVis Engineering",
        "city": "Bengaluru"
      }
    ]
  }
]
```
*(The `$lookup` operator successfully embeds the foreign document directly into the returned cursors, simulating an SQL JOIN structure.)*

---

## 3. Modifying Data

### 3.1 Update One ($inc operator)
**Query:**
```javascript
db.invoices.updateOne(
    { invoice_id: "INV001" },
    { $inc: { total_amount: 500 } }
);
```

**Execution Result:**
```json
{
  "acknowledged": true,
  "matchedCount": 1,
  "modifiedCount": 1
}
```

### 3.2 Delete One
**Query:**
```javascript
db.licenses.deleteOne({ status: "Expired" });
```

**Execution Result:**
```json
{
  "acknowledged": true,
  "deletedCount": 1
}
```

---

## 4. Query Optimization & Sorting

### 4.1 Create Index for Performance
**Query:**
```javascript
db.companies.createIndex({ company_name: 1 });
```

**Execution Result:**
```json
{
  "numIndexesBefore": 1,
  "numIndexesAfter": 2,
  "createdCollectionAutomatically": false,
  "ok": 1
}
```

### 4.2 Text Search
**Query:**
```javascript
db.companies.createIndex({ address: "text" });
db.companies.find({ $text: { $search: "Bengaluru" } });
```

**Execution Result:** *(Returns all documents where address text index matches 'Bengaluru')*

### 4.3 Sort & Limit (Pagination)
**Query:**
```javascript
db.invoices.find().sort({ invoice_amount: -1 }).limit(5);
```

> **Important:** The `-1` indicates descending order. This efficiently calculates the equivalent of `ORDER BY invoice_amount DESC LIMIT 5`.

**Execution Result:** *(Returns top 5 highest value invoices)*
