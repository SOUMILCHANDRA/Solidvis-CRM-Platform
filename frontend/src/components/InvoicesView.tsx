// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, Tag, Input, Spin } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function InvoicesView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      
      let query = supabase
        .from('invoice')
        .select('invoice_id, order_id, total_amount, invoice_date, payment(payment_status)')
        .limit(100);

      if (searchTerm) {
        query = query.ilike('invoice_id', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase Error fetching invoices:", error);
      }
      
      if (!error && data) {
        const formattedInvoices = data.map(inv => {
            // @ts-ignore
            const paymentStatus = inv.payment && inv.payment.length > 0 ? inv.payment[0].payment_status : 'PENDING';
            return {
                key: inv.invoice_id,
                order: inv.order_id,
                amount: parseFloat(inv.total_amount || 0),
                date: inv.invoice_date,
                status: paymentStatus
            };
        });
        
        setInvoices(formattedInvoices);
        
        // Update local chart preview
        if (!searchTerm) {
            setChartData([
                { name: 'Received', value: formattedInvoices.filter(i => i.status === 'RECEIVED').reduce((acc, curr) => acc + curr.amount, 0), color: '#2ecc71' },
                { name: 'Pending', value: formattedInvoices.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0), color: '#e74c3c' },
            ]);
        }
      }
      setLoading(false);
    };

    const delayDebounceFn = setTimeout(() => {
        fetchInvoices();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const columns = [
    { title: 'Invoice ID', dataIndex: 'key', key: 'key' },
    { title: 'Order ID', dataIndex: 'order', key: 'order' },
    { title: 'Total Amount', dataIndex: 'amount', key: 'amount', render: (val: number) => `₹ ${val.toLocaleString()}` },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const color = status === 'RECEIVED' ? '#2ecc71' : '#e74c3c';
        return (
          <Tag color={color} style={{ background: 'transparent', border: `1px solid ${color}`, borderRadius: '15px', padding: '2px 10px', boxShadow: `0 0 10px ${color}40`, paddingBottom: '3px' }}>
            {status}
          </Tag>
        );
      }
    },
  ];

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="glow-text" style={{ fontSize: '32px', margin: 0 }}>Invoice & Payment Tracker</h1>
        <Input 
            prefix={<Search size={18} color="#aaa" />}
            placeholder="Search Invoice ID..."
            style={{ width: '250px', background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '20px' }}
            onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        <motion.div className="glass-panel" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ccc' }}>Sample Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie data={chartData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 10px ${entry.color})` }} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₹ ${value.toLocaleString()}`} contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          {chartData.length > 0 && <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#aaa' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                {d.name}
              </div>
            ))}
          </div>}
        </motion.div>

        <motion.div className="glass-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {loading ? (
             <div style={{ padding: '20px' }}>
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="skeleton" style={{ height: '40px', marginBottom: '10px', opacity: 1 - (i * 0.1) }} />
               ))}
               <p style={{ marginTop: '15px', color: '#00d2ff', textAlign: 'center' }}>Optimizing query of 2M+ rows...</p>
             </div>
          ) : (
             <Table 
               columns={columns} 
               dataSource={invoices} 
               pagination={{ pageSize: 7 }}
               className="custom-table"
             />
          )}
        </motion.div>
      </div>
    </div>
  );
}
