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
      <h1 style={{ color: 'white' }}>Transaction Verification System</h1>
      <p style={{ color: '#aaa', marginBottom: '30px' }}>
        Verified system for testing PostgreSQL ATOMICITY. All operations are executed atomically to ensure data integrity.
      </p>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>

        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Company ID (UUID):</label>
          <input
            type="text"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            placeholder="Enter valid company UUID"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', color: 'black', background: '#f3f4f6' }}
          />
          <small style={{ color: '#666' }}>Must refer to an existing UUID in the companies table.</small>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Transaction Amount:</label>
          <input
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="e.g. 5000"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', color: 'black', background: '#f3f4f6' }}
          />
          <small style={{ color: '#666' }}>All operations are executed atomically.</small>
        </div>

        <button
          onClick={runTransaction}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#95a5a6' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s',
            fontWeight: '600'
          }}
        >
          {loading ? 'Processing...' : 'Run Transaction Test'}
        </button>

      </div>


    </div>
  );
};

export default TransactionDemo;
