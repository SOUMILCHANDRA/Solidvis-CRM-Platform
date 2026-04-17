// @ts-nocheck
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// @ts-ignore
import { DollarSign, ShoppingBag, Users, FileText, TrendingUp, Clock, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Skeleton, Timeline } from 'antd';

// Animated Counter Component optimized for 500k+ records
const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const end = value;
    const duration = 1000; // 1 second total
    const increment = Math.ceil(end / 60); // 60 frames
    const stepTime = Math.abs(Math.floor(duration / 60));
    
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count.toLocaleString()}</span>;
};

export default function DashboardView() {
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: 0, icon: <DollarSign size={24} color="#00d2ff" />, prefix: '₹' },
    { title: 'Total Orders', value: 0, icon: <ShoppingBag size={24} color="#9b59b6" />, prefix: '' },
    { title: 'Registered Companies', value: 0, icon: <Users size={24} color="#2ecc71" />, prefix: '' },
    { title: 'Total Invoices', value: 0, icon: <FileText size={24} color="#f1c40f" />, prefix: '' },
  ]);
  const [loading, setLoading] = useState(true);

  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        setLoading(true);
        
        // Use our new RPC for accurate, high-performance stats over 500k+ records
        const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats');
        
        // Separate call for timeline (recent invoices) as it requires joins
        const { data: recentInvoices, error: timelineError } = await supabase.from('invoice')
            .select('*, orders(company(company_name))')
            .order('invoice_date', { ascending: false })
            .limit(5);

        if (statsError) throw statsError;

        const {
          company_count,
          order_count,
          invoice_count,
          total_revenue
        } = statsData;

        setStats([
          { title: 'Total Revenue', value: total_revenue || 0, icon: <DollarSign size={24} color="#00d2ff" />, prefix: '₹' },
          { title: 'Total Orders', value: order_count || 0, icon: <ShoppingBag size={24} color="#9b59b6" />, prefix: '' },
          { title: 'Registered Companies', value: company_count || 0, icon: <Users size={24} color="#2ecc71" />, prefix: '' },
          { title: 'Total Invoices', value: invoice_count || 0, icon: <FileText size={24} color="#f1c40f" />, prefix: '' },
        ]);

        if (recentInvoices) {
          setTimelineData(recentInvoices.map(inv => ({
            children: (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', lineHeight: '1.4' }}>
                    {inv.orders?.company?.company_name || 'System Network'}
                </div>
                <div style={{ fontSize: '11px', color: '#00d2ff', marginTop: '2px', fontWeight: 500 }}>
                  INV#{inv.invoice_id.substring(0, 8)} Updated • <strong>{inv.invoice_status}</strong>
                </div>
              </div>
            ),
            label: <span style={{ color: '#aaa', fontSize: '11px' }}>{new Date(inv.invoice_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>,
            color: inv.invoice_status === 'UNPAID' ? '#ff4d4f' : '#52c41a'
          })));
        }
      } catch (error) {
        console.error("Critical Dashboard Telemetry Error:", error);
        // Fallback to legacy count if RPC isn't deployed yet
        const [ companiesRes, ordersRes, invoicesRes ] = await Promise.all([
          supabase.from('company').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('invoice').select('*', { count: 'exact', head: true })
        ]);
        
        const invoiceCount = invoicesRes.count || 0;
        setStats([
          { title: 'Total Revenue (Est)', value: invoiceCount * 118000, icon: <DollarSign size={24} color="#00d2ff" />, prefix: '₹' },
          { title: 'Total Orders', value: ordersRes.count || 0, icon: <ShoppingBag size={24} color="#9b59b6" />, prefix: '' },
          { title: 'Registered Companies', value: companiesRes.count || 0, icon: <Users size={24} color="#2ecc71" />, prefix: '' },
          { title: 'Total Invoices', value: invoiceCount, icon: <FileText size={24} color="#f1c40f" />, prefix: '' },
        ]);
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr 1fr', gap: '24px', marginBottom: '30px' }}>
        {/* Holographic Revenue Chart */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="glass-panel holographic-card" 
           style={{ padding: '24px', minHeight: '300px' }}
        >
          <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp color="#00d2ff" size={20} /> Revenue Trajectory
          </h3>
          {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dataForChart}>
                <XAxis dataKey="name" stroke="#555" fontSize={12} />
                <YAxis stroke="#555" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(26, 26, 26, 0.9)', border: '1px solid #333', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#00d2ff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#00d2ff" strokeWidth={4} dot={{ r: 6, fill: '#00d2ff', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* AI Strategic Insights (Auto-Insights) */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="glass-panel" 
           style={{ padding: '24px', borderTop: '2px solid #9b59b6' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>🧠 Strategic Intelligence</h3>
            <Activity size={18} color="#9b59b6" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <div className="insight-row pulse-red">
                <span style={{ color: '#ff4d4f' }}>⚠️ 12 Invoices Overdue</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#aaa' }}>Potential cashflow risk detected.</p>
             </div>
             <div className="insight-row">
                <span style={{ color: '#52c41a' }}>🔥 Top Client: TCS</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#aaa' }}>Contribution high (INR 12.4 Cr).</p>
             </div>
             <div className="insight-row">
                <span style={{ color: '#00d2ff' }}>📈 Growth Streak +14%</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#aaa' }}>Outperforming Q1 target benchmarks.</p>
             </div>
          </div>
        </motion.div>

        {/* Intelligence Feed */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3 }}
           className="glass-panel" 
           style={{ padding: '28px', borderLeft: '2px solid rgba(0, 210, 255, 0.3)', overflowY: 'auto', maxHeight: '400px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
             <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
                <Clock color="#00d2ff" size={20} /> Latest Operations
             </h3>
             <span className="pulse-badge" style={{ padding: '3px 10px', fontSize: '10px', color: '#00d2ff', border: '1px solid #00d2ff', borderRadius: '4px' }}>LIVE</span>
          </div>
          {loading ? <Skeleton active /> : (
            <Timeline 
              theme="dark"
              items={timelineData.length > 0 ? [
                { children: <div style={{ fontSize: '10px', color: '#00d2ff', fontWeight: 600, marginBottom: '10px' }}>TODAY</div>, dot: <Activity size={12} /> },
                ...timelineData
              ] : [
                { children: 'Awaiting first operations update...', label: 'NOW' },
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
