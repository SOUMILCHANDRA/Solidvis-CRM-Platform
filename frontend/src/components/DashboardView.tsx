// @ts-nocheck
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// @ts-ignore
import { DollarSign, ShoppingCart, Users, FileText, TrendingUp, Clock, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Skeleton, Timeline } from 'antd';

// Animated Counter Component
const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let totalMiliseconds = 1500;
    let incrementTime = (totalMiliseconds / end) * 5;
    let timer = setInterval(() => {
      start += 5;
      setCount(start);
      if (start > end) {
        clearInterval(timer);
        setCount(end);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count.toLocaleString()}</span>;
};

export default function DashboardView() {
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: 0, icon: <DollarSign size={24} color="#00d2ff" />, prefix: '₹' },
    { title: 'Total Orders', value: 0, icon: <ShoppingCart size={24} color="#9b59b6" />, prefix: '' },
    { title: 'Registered Companies', value: 0, icon: <Users size={24} color="#2ecc71" />, prefix: '' },
    { title: 'Total Invoices', value: 0, icon: <FileText size={24} color="#f1c40f" />, prefix: '' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const { count: companyCount } = await supabase.from('company').select('*', { count: 'exact', head: true });
        const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count: invoiceCount } = await supabase.from('invoice').select('*', { count: 'exact', head: true });
        
        const estimatedRevenue = (invoiceCount || 0) * 118000;

        setStats([
          { title: 'Total Revenue', value: estimatedRevenue, icon: <DollarSign size={24} color="#00d2ff" />, prefix: '₹' },
          { title: 'Total Orders', value: ordersCount || 0, icon: <ShoppingCart size={24} color="#9b59b6" />, prefix: '' },
          { title: 'Registered Companies', value: companyCount || 0, icon: <Users size={24} color="#2ecc71" />, prefix: '' },
          { title: 'Total Invoices', value: invoiceCount || 0, icon: <FileText size={24} color="#f1c40f" />, prefix: '' },
        ]);
      } catch (error) {
        console.error("Error fetching live data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStats();
  }, []);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="glow-text" style={{ fontSize: '32px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity color="#00d2ff" /> SolidVis Command Center
        </h1>
        <p style={{ color: '#aaa', margin: '5px 0 0 0' }}>Real-time telemetry from across the enterprise network.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px', perspective: '1000px' }}>
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel"
            whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color: '#aaa', fontSize: '14px', fontWeight: 500 }}>{stat.title}</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>
              {loading ? <Skeleton.Input active size="small" style={{ width: 100 }} /> : 
                <>
                  <span style={{ fontSize: '18px', color: '#00d2ff', marginRight: '4px' }}>{stat.prefix}</span>
                  <AnimatedCounter value={stat.value} />
                </>
              }
            </div>
            <div style={{ fontSize: '12px', color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> +12.5% vs last month
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="glass-panel" 
           style={{ padding: '24px', minHeight: '300px' }}
        >
          <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp color="#00d2ff" size={20} /> Revenue Trajectory Analysis
          </h3>
          {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dataForChart}>
                <XAxis dataKey="name" stroke="#555" fontSize={12} />
                <YAxis stroke="#555" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="revenue" stroke="#00d2ff" strokeWidth={3} dot={{ r: 4, fill: '#00d2ff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3 }}
           className="glass-panel" 
           style={{ padding: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h3 style={{ margin: 0, color: '#ccc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock color="#9b59b6" size={20} /> Operations Timeline
             </h3>
             <span style={{ padding: '2px 8px', fontSize: '10px', color: '#00d2ff', border: '1px solid #00d2ff', borderRadius: '4px' }}>LIVE</span>
          </div>
          {loading ? <Skeleton active /> : (
            <Timeline 
              theme="dark"
              items={[
                { children: 'Order PO_X9282 Processed', label: '10:45 AM' },
                { children: 'Payment RECEIVED from BELRISE IND', label: '09:30 AM' },
                { children: 'Manual Audit Required for INV_892', color: 'red', label: 'Yesterday' },
              ]}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

const dataForChart = [
  { name: 'Jan', revenue: 4200 },
  { name: 'Feb', revenue: 5100 },
  { name: 'Mar', revenue: 4800 },
  { name: 'Apr', revenue: 6300 },
  { name: 'May', revenue: 7500 },
  { name: 'Jun', revenue: 9200 },
];
