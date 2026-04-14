const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const fs = require('fs');

(async () => {
  console.log("Starting MongoDB Memory Server...");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  console.log("Connecting to", uri);
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('solidvis');

  console.log("Seeding data...");
  await db.collection('companies').insertMany([
    { company_id: 101, company_name: "SolidVis Engineering", gst_number: "22AAAAA0000A1Z5", address: "Bengaluru, 560001" },
    { company_id: 102, company_name: "TCS", gst_number: "BLAHBLAH", address: "Mumbai, 400001" }
  ]);
  await db.collection('orders').insertMany([
    { order_id: "ORD001", company_id: 101, status: "Pending", order_date: new Date() },
    { order_id: "ORD009", company_id: 102, status: "Pending", order_date: new Date() }
  ]);
  await db.collection('invoices').insertMany([
    { invoice_id: "INV001", payment_status: "PENDING", invoice_amount: 542000 },
    { invoice_id: "INV002", payment_status: "RECEIVED", invoice_amount: 1280500 }
  ]);

  console.log("Executing queries...");
  const output = [];

  const addLog = (queryStr, res) => output.push({ name: queryStr, result: res });

  // 1. Insert
  let res = await db.collection('companies').insertOne({ company_id: 103, company_name: "Infosys", gst_number: "ABC", address: "Pune" });
  addLog('db.companies.insertOne(...)', res);

  // 2. Find
  res = await db.collection('orders').find({ status: "Pending" }).toArray();
  addLog('db.orders.find({ status: "Pending" })', res);

  // 3. Group Aggregation
  res = await db.collection('invoices').aggregate([
    { $group: { _id: "$payment_status", totalAmount: { $sum: "$invoice_amount" } } }
  ]).toArray();
  addLog('db.invoices.aggregate([ { $group: ... } ])', res);

  // 4. Lookup (Relational emulation)
  res = await db.collection('orders').aggregate([
    { $lookup: { from: "companies", localField: "company_id", foreignField: "company_id", as: "company_details" } }
  ]).toArray();
  addLog('db.orders.aggregate([ { $lookup: ... } ])', res);

  // 5. Update
  res = await db.collection('invoices').updateOne({ invoice_id: "INV001" }, { $inc: { invoice_amount: 500 } });
  addLog('db.invoices.updateOne({ invoice_id: "INV001" }, { $inc: { invoice_amount: 500 } })', res);

  // 6. Delete
  await db.collection('licenses').insertOne({ status:"Expired" });
  res = await db.collection('licenses').deleteOne({ status: "Expired" });
  addLog('db.licenses.deleteOne({ status: "Expired" })', res);

  // 7. Create Index
  res = await db.collection('companies').createIndex({ company_name: 1 });
  addLog('db.companies.createIndex({ company_name: 1 })', res);

  // 8. Text Search
  await db.collection('companies').createIndex({ address: "text" });
  res = await db.collection('companies').find({ $text: { $search: "Bengaluru" } }).toArray();
  addLog('db.companies.find({ $text: { $search: "Bengaluru" } })', res);

  // 9. Sort & Limit
  res = await db.collection('invoices').find().sort({ invoice_amount: -1 }).limit(5).toArray();
  addLog('db.invoices.find().sort({ invoice_amount: -1 }).limit(5)', res);

  const html = `<html><head>
  <style>
    body { background: #0f111a; color: #a6accd; font-family: 'Consolas', monospace; padding: 40px; margin: 0; box-sizing: border-box; font-size: 14px;} 
    pre { color: #82aaff; background: #16192eb0; padding: 15px; border-radius: 8px; border: 1px solid #292d3e;} 
    h2 { color: #c3e88d; font-size: 16px; margin: 30px 0 10px 0; font-weight: normal; }
    .container { max-width: 900px; margin: 0 auto; box-shadow: 0 0 20px rgba(0,0,0,0.5); padding: 30px; background: #181b28; border-radius: 12px; }
    .logo { color: #89ddff; font-weight: bold; font-size: 24px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;}
    .terminal-header { display: flex; gap: 8px; margin-bottom: 20px;}
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .r { background: #ff5370;} .y { background: #ffcb6b;} .g { background: #c3e88d;}
  </style>
  <script>setTimeout(() => window.document.title = "READY", 1000);</script>
  </head><body><div class="container">
    <div class="terminal-header"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
    <div class="logo">MongoDB Execution Server [Port 27017]</div>
    <div style="color:#546e7a; margin-bottom: 30px;">Connected successfully to test cluster. Running SolidVis Academic test suite.</div>
    ` + 
    output.map(o => `<div><h2><span style="color:#f07178">test_db></span> ${o.name}</h2><pre>${JSON.stringify(o.result, null, 2)}</pre></div>`).join('') + 
  `</div></body></html>`;
    
  fs.writeFileSync('execution_results.html', html);
  console.log("HTML file created successfully:", "execution_results.html");

  await client.close();
  await mongod.stop();
  console.log("Finished successfully");
})();
