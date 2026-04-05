// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, Tag, Input, Spin, Button, Select, InputNumber } from 'antd';
const { Option } = Select;
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Search, Download, FileText, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function InvoicesView() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filter States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('invoice')
          .select(`
            invoice_id,
            total_amount,
            invoice_date,
            order_id,
            payment (
                payment_status
            )
          `)
          .order('invoice_date', { ascending: false })
          .limit(100);

        if (searchTerm) {
          query = query.ilike('invoice_id', `%${searchTerm}%`);
        }

        if (minAmount) query = query.gte('total_amount', minAmount);
        if (maxAmount) query = query.lte('total_amount', maxAmount);
        if (dateRange) {
            query = query.gte('invoice_date', dateRange[0]).lte('invoice_date', dateRange[1]);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Supabase Error fetching invoices:", error);
        }
        
        let formattedInvoices = [];
        if (data) {
          formattedInvoices = data.map(inv => {
              const paymentObj = Array.isArray(inv.payment) ? inv.payment[0] : inv.payment;
              const paymentStatus = paymentObj?.payment_status || 'PENDING';
              
              return {
                  key: inv.invoice_id,
                  order: inv.order_id,
                  amount: parseFloat(inv.total_amount || 0),
                  date: inv.invoice_date,
                  status: paymentStatus
              };
          });
        }
        
        // Handle the status filter client-side for consistent behavior across joins
        let finalInvoices = formattedInvoices;
        if (statusFilter !== 'ALL') {
            finalInvoices = formattedInvoices.filter(i => i.status === statusFilter);
        }
        
        setInvoices(finalInvoices);
        
        // Update local chart preview
        if (!searchTerm && statusFilter === 'ALL') {
            setChartData([
                { name: 'Received', value: formattedInvoices.filter(i => i.status === 'RECEIVED').reduce((acc, curr) => acc + curr.amount, 0), color: '#2ecc71' },
                { name: 'Pending', value: formattedInvoices.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0), color: '#e74c3c' },
            ]);
        }
      } catch (err) {
        console.error("Critical error in fetchInvoices:", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
        fetchInvoices();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, minAmount, maxAmount, dateRange]);

  const exportCSV = () => {
    const headers = ['Invoice ID', 'Order ID', 'Amount', 'Date', 'Status'];
    const rows = invoices.map(i => [i.key, i.order, i.amount, i.date, i.status]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoices_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    // @ts-ignore
    const doc = new jsPDF();
    doc.text("SolidVis Enterprise CRM - Invoices Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    // @ts-ignore
    doc.autoTable({
      startY: 30,
      head: [['Invoice ID', 'Order ID', 'Amount (INR)', 'Date', 'Status']],
      body: invoices.map(i => [i.key, i.order, `INR ${i.amount.toLocaleString()}`, i.date, i.status]),
      theme: 'grid',
      headStyles: { fillStyle: '#9b59b6' }
    });
    
    doc.save(`invoices_report_${new Date().getTime()}.pdf`);
  };

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
        <div style={{ display: 'flex', gap: '15px' }}>
            <Button icon={<FileText size={16} />} onClick={exportCSV} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CSV</Button>
            <Button icon={<Download size={16} />} onClick={exportPDF} style={{ background: 'rgba(255,255,255,0.05)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.1)' }}>Export PDF</Button>
            <Input 
                prefix={<Search size={18} color="#aaa" />}
                placeholder="Search Invoice ID..."
                style={{ width: '250px', background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '20px' }}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '25px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '12px' }}>
              <Filter size={14} /> FILTERS:
          </div>
          <Select 
            defaultValue="ALL" 
            style={{ width: 150 }} 
            onChange={setStatusFilter}
            popupClassName="dark-dropdown"
          >
              <Option value="ALL">All Statuses</Option>
              <Option value="RECEIVED">Received Only</Option>
              <Option value="PENDING">Pending Only</Option>
          </Select>
          
          <div style={{ display: 'flex', gap: '10px' }}>
              <InputNumber 
                placeholder="Min Amount" 
                onChange={val => setMinAmount(val || undefined)} 
                style={{ width: '120px' }}
              />
              <InputNumber 
                placeholder="Max Amount" 
                onChange={val => setMaxAmount(val || undefined)} 
                style={{ width: '120px' }}
              />
          </div>
          
          <div style={{ color: '#00d2ff', fontSize: '11px', flex: 1, textAlign: 'right' }}>
              {invoices.length} Enterprise Records Filtered
          </div>
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
