import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const TransactionDemo = () => {
  const [amount, setAmount] = useState(100);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTransaction = async (amt) => {
    setLoading(true);
    setStatus(null);
    try {
      // Academic Test: Calling the Supabase RPC Transaction
      // comp_id is hardcoded to a valid one from the setup script for demo
      const { data, error } = await supabase.rpc('create_order_transaction', {
        comp_id: 200000000079457,
        amt: parseFloat(amt)
      });

      if (error) throw error;

      setStatus({ type: 'success', message: '✓ Transaction Complete: Order and Invoice created successfully.' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: `✗ Transaction Failed: ${err.message || 'Unknown error. Rollback triggered.'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>DBMS Transaction Demo</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
        This module tests PostgreSQL ATOMICITY. If the transaction fails, no data is written to either the ORDERS or INVOICE tables.
      </p>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Transaction Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <small style={{ color: '#666' }}>Enter a negative number to trigger a manual rollback.</small>
        </div>

        <button
          onClick={() => runTransaction(amount)}
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

        {status && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da',
            color: status.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {status.message}
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #eee' }}>
        <h3>Academic Note: ACID Compliance</h3>
        <ul>
          <li><strong>Success:</strong> Order record created + Invoice record created.</li>
          <li><strong>Failure:</strong> If Amount &lt; 0, exception is thrown, rolling back the Order creation.</li>
        </ul>
      </div>
    </div>
  );
};

export default TransactionDemo;
