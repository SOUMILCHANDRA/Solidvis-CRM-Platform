/**
 * DBMS Extension: MongoDB Query Execution Suite
 * This module demonstrates 10 essential MongoDB operations for academic purposes.
 */

// 1. insertOne: Add a new client document
db.clients.insertOne({
    name: "Acme Corp",
    industry: "Manufacturing",
    status: "Active",
    revenue: 5000000,
    tags: ["premium", "b2b"]
});

// 2. find: Retrieve all active clients in the Manufacturing industry
db.clients.find({
    status: "Active",
    industry: "Manufacturing"
});

// 3. updateOne ($inc): Increment the revenue for a specific client
db.clients.updateOne(
    { name: "Acme Corp" },
    { $inc: { revenue: 250000 } }
);

// 4. deleteOne: Remove a client document by ID
db.clients.deleteOne({ _id: ObjectId("60d5f9b4f1d2c34a5b6c7d8e") });

// 5. aggregate ($group): Calculate total revenue by industry
db.clients.aggregate([
    { $group: { _id: "$industry", totalRevenue: { $sum: "$revenue" } } }
]);

// 6. lookup (join): Join clients with their respective project documents
db.clients.aggregate([
    {
        $lookup: {
            from: "projects",
            localField: "_id",
            foreignField: "clientId",
            as: "clientProjects"
        }
    }
]);

// 7. createIndex: Create an index on the revenue field to optimize queries
db.clients.createIndex({ revenue: -1 });

// 8. text search: Search for clients with specific terms in indexed fields
// Note: Requires a text index (e.g., db.clients.createIndex({ name: "text" }))
db.clients.find({ $text: { $search: "technical engineering" } });

// 9. sort: Retrieve clients sorted by revenue in descending order
db.clients.find().sort({ revenue: -1 });

// 10. limit: Retrieve the top 5 highest revenue clients
db.clients.find().sort({ revenue: -1 }).limit(5);
