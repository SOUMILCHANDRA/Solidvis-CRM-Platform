# MongoDB Schema Design: CRM Extension

## Design Philosophy: Embedding vs. Referencing
In NoSQL, we optimize for **Read patterns**.
- **Embedding**: Use when data is "owned" by the parent and rarely queried independently (e.g., Order Line Items). Improves performance by reducing JOIN overhead.
- **Referencing**: Use for "One-to-Many" or "Many-to-Many" relationships where the child data is large or shared (e.g., Companies and Customers). Prevents data duplication/inconsistency.

---

## Collections & Examples

### 1. Companies (Referencing Customers)
```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c001",
  "name": "Global Tech Solutions",
  "industry": "Software",
  "contactInfo": {
    "email": "contact@globaltech.com",
    "phone": "+1-555-0101"
  },
  "address": {
    "street": "123 Innovation Way",
    "city": "San Francisco",
    "country": "USA"
  }
}
```

### 2. Customers
```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c002",
  "companyId": "65f1a2b3c4d5e6f7a8b9c001",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CTO",
  "tags": ["VIP", "Early Adopter"]
}
```

### 3. Orders (Embedding Line Items)
```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c003",
  "customerId": "65f1a2b3c4d5e6f7a8b9c002",
  "orderDate": "2024-03-12T10:00:00Z",
  "totalAmount": 1250.00,
  "status": "shipped",
  "items": [
    {
      "productId": "PROD-001",
      "name": "Cloud Subscription",
      "quantity": 1,
      "price": 1000.00
    },
    {
      "productId": "PROD-099",
      "name": "Support Pack",
      "quantity": 5,
      "price": 50.00
    }
  ]
}
```

### 4. Invoices
```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c004",
  "orderId": "65f1a2b3c4d5e6f7a8b9c003",
  "invoiceNumber": "INV-2024-001",
  "dueDate": "2024-04-12T23:59:59Z",
  "paymentStatus": "pending"
}
```
