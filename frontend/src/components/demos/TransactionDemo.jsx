import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const TransactionDemo = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState('00000000-0000-0000-0000-000000000000');
  const [amountInput, setAmountInput] = useState(5000);
  const [loading, setLoading] = useState(false);

  const runTransaction = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('create_order_transaction', {
        comp_id: selectedCompanyId,  // MUST EXIST IN DB
        amt: parseFloat(amountInput)
      });

      if (error) {
        console.error(error);
        alert("❌ Transaction Failed (Rollback Triggered)");
      } else {
        console.log(data);
        alert("✅ Transaction Successful");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Transaction Failed (Rollback Triggered)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>DBMS Transaction Demo</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        This module tests PostgreSQL ATOMICITY. If the transaction fails, no data is written to either the orders or invoices tables.
      </p>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Company ID (UUID):</label>
          <input
            type="text"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            placeholder="Enter valid company UUID"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <small style={{ color: '#666' }}>Must refer to an existing UUID in the companies table.</small>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Transaction Amount:</label>
          <input
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <small style={{ color: '#666' }}>Enter a negative number (e.g., -100) to trigger a manual rollback.</small>
        </div>

        <button
          onClick={runTransaction}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s'
          }}
        >
          {loading ? 'Processing...' : 'Run Transaction Test'}
        </button>

      </div>

      <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #eee' }}>
        <h3 style={{ color: '#333' }}>Academic Note: ACID Compliance</h3>
        <ul style={{ color: '#555' }}>
          <li><strong>Success:</strong> Order created + Invoice created atomically.</li>
          <li><strong>Failure:</strong> If Amount &lt;= 0, Exception is thrown! EVERYTHING aborts and rolls back.</li>
        </ul>
      </div>
    </div>
  );
};

export default TransactionDemo;
