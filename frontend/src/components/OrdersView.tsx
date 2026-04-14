// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, Search, Plus, Trash2 } from 'lucide-react';
import { Spin, Input, Button, Modal, Form, Select, InputNumber, message, Space } from 'antd';
import { supabase } from '../lib/supabase';

const { Option } = Select;

export default function OrdersView() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Order Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*, employee(employee_name)').limit(100).order('order_date', { ascending: false });

    if (searchTerm) {
      query = query.ilike('order_id', `%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setOrders(data.map(o => ({
        id: o.order_id,
        type: o.order_type,
        status: o.status,
        date: o.order_date,
        emp: o.employee?.employee_name || 'System'
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadOrderDetails = async (orderId: string) => {
    if (selectedOrder === orderId) {
        setSelectedOrder(null);
        return;
    }
    setSelectedOrder(orderId);
    
    if (!orderDetails[orderId]) {
        const { data, error } = await supabase
            .from('order_details')
            .select('*, product(product_name)')
            .eq('order_id', orderId);
            
        if (!error && data) {
            setOrderDetails((prev: any) => ({
                ...prev,
                [orderId]: data.map(d => ({
                    product: d.product?.product_name || 'Unknown Product',
                    code: d.product_id,
                    qty: d.quantity,
                    price: parseFloat(d.selling_price)
                }))
            }));
        }
    }
  };

  const openNewOrderModal = async () => {
    setIsModalVisible(true);
    if (companies.length === 0) {
        const { data: cData } = await supabase.from('company').select('company_id, company_name');
        if (cData) setCompanies(cData);
        
        const { data: eData } = await supabase.from('employee').select('employee_id, employee_name');
        if (eData) setEmployees(eData);
        
        const { data: pData } = await supabase.from('product').select('product_id, product_name');
        if (pData) setProducts(pData);
    }
  };

  const handleCreateOrder = async (values: any) => {
    setFormLoading(true);
    
    // Calculate total amount from products
    const currentProductsList = values.products || [];
    const totalBill = currentProductsList.reduce((sum: number, p: any) => sum + (Number(p?.price) || 0), 0);

    // Replace direct insert with RPC
    const { data, error } = await supabase.rpc('create_order_transaction', {
        comp_id: values.company_id,
        amt: totalBill > 0 ? totalBill : 0
    });

    if (error) {
        message.error(`Transaction failed, rollback triggered: ${error.message}`);
        setFormLoading(false);
        return;
    }

    message.success(`Order + Invoice created successfully via Atomic Transaction!`);
    setIsModalVisible(false);
    form.resetFields();
    fetchOrders(); // Refresh table instantly
    setFormLoading(false);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="glow-text" style={{ fontSize: '32px', margin: 0 }}>Orders & Products</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
            <Input 
                prefix={<Search size={18} color="#aaa" />}
                placeholder="Search Order ID..."
                style={{ width: '250px', background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '20px' }}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <Button 
                id="create-order-btn"
                type="primary" 
                icon={<Plus size={16} />} 
                onClick={openNewOrderModal}
                style={{ background: 'linear-gradient(90deg, #00d2ff, #9b59b6)', border: 'none', borderRadius: '20px', fontWeight: 600 }}
            >
                Create Order
            </Button>
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: '100px', textAlign: 'center', color: '#00d2ff' }}>
            <Spin size="large" /> <p style={{ marginTop: '15px' }}>Fetching Latest Orders from 500k+ Database...</p>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {orders.length === 0 ? <p style={{ color: '#aaa' }}>No orders found matching '{searchTerm}'.</p> : orders.map((order, i) => (
          <motion.div
            key={order.id}
            layoutId={`card-${order.id}`}
            className="glass-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ 
              y: -5, 
              scale: 1.03, 
              cursor: 'pointer', 
              boxShadow: '0 20px 40px rgba(0,210,255,0.25)',
              rotateX: 4,
              rotateY: 4
            }}
            onClick={() => loadOrderDetails(order.id)}
            style={{ position: 'relative', overflow: 'hidden', border: selectedOrder === order.id ? '1px solid #00d2ff' : '' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{
                background: order.status.includes('Wo/Support') ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)',
                color: order.status.includes('Wo/Support') ? '#e74c3c' : '#2ecc71',
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600
              }}>
                {order.status}
              </div>
              <Calendar size={18} color="#aaa" />
            </div>
            
            <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{order.id}</h3>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 15px 0' }}>{order.type} • Rep: {order.emp}</p>

            <AnimatePresence>
              {selectedOrder === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', overflow: 'hidden' }}
                >
                  <h4 style={{ color: '#00d2ff', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} /> Order Line Items
                  </h4>
                  {orderDetails[order.id] ? orderDetails[order.id].map((detail: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span>{detail.product} ({detail.code})</span>
                        <span style={{ color: '#00d2ff' }}>₹{detail.price.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(detail.qty * 5, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #9b59b6, #00d2ff)' }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', color: '#ccc' }}>Qty: {detail.qty}</span>
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '10px', textAlign: 'center' }}><Spin size="small" /></div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      )}

      {/* New Order Modal */}
      <Modal 
        title="Create Order & Attach Products (Bifurcation)" 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="glass-modal"
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrder} style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <Form.Item name="company_id" label="Linked Client Company" rules={[{ required: true }]}>
                    <Select placeholder="Fetch Client Network...">
                        {companies.map(c => <Option key={c.company_id} value={c.company_id}>{c.company_name}</Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name="employee_id" label="Sales Representative" rules={[{ required: true }]} >
                    <Select placeholder="Assign Representative...">
                        {employees.map(e => <Option key={e.employee_id} value={e.employee_id}>{e.employee_name}</Option>)}
                    </Select>
                </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <Form.Item name="order_type" label="Contract Target" rules={[{ required: true }]}>
                    <Select>
                        <Option value="New">New Standard Frame</Option>
                        <Option value="Renewal">Renewal Protocol</Option>
                        <Option value="TOS Reinstatement">TOS Reinstatement</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="status" label="Support Configuration" rules={[{ required: true }]}>
                    <Select>
                        <Option value="Active W/Support">Active (With Support Tier)</Option>
                        <Option value="Active Wo/Support">Active (No Support)</Option>
                    </Select>
                </Form.Item>
            </div>

            <div style={{ marginTop: '10px', marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#00d2ff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} /> Products Bifurcation
                </h4>
                <Form.List name="products">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'product_id']}
                                        rules={[{ required: true, message: 'Missing product' }]}
                                        style={{ width: '250px' }}
                                    >
                                        <Select 
                                            placeholder="Select Product" 
                                            onChange={(val) => {
                                                const prices: Record<string, number> = { 'SPTW': 1020900, 'XWA-OC': 1476000, 'SWTW': 553500 };
                                                const basePrice = prices[val] || 450000;
                                                const currentProducts = form.getFieldValue('products') || [];
                                                const currentQty = currentProducts[name]?.quantity || 1;
                                                currentProducts[name] = { ...currentProducts[name], quantity: currentQty, price: basePrice * currentQty };
                                                form.setFieldsValue({ products: currentProducts });
                                            }}
                                        >
                                            {products.map(p => <Option key={p.product_id} value={p.product_id}>{p.product_name}</Option>)}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'quantity']}
                                        rules={[{ required: true, message: 'Missing qty' }]}
                                    >
                                        <InputNumber 
                                            placeholder="Qty" 
                                            min={1} 
                                            onChange={(qtyValue) => {
                                                const currentProducts = form.getFieldValue('products') || [];
                                                const prodId = currentProducts[name]?.product_id;
                                                if (prodId) {
                                                    const prices: Record<string, number> = { 'SPTW': 1020900, 'XWA-OC': 1476000, 'SWTW': 553500 };
                                                    const basePrice = prices[prodId] || 450000;
                                                    currentProducts[name] = { ...currentProducts[name], quantity: qtyValue, price: basePrice * (qtyValue || 1) };
                                                    form.setFieldsValue({ products: currentProducts });
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'price']}
                                        rules={[{ required: true, message: 'Missing price' }]}
                                    >
                                        <InputNumber placeholder="₹ Price" min={0} style={{ width: '120px' }} />
                                    </Form.Item>
                                    <Trash2 size={18} color="#e74c3c" style={{ cursor: 'pointer', marginTop: '8px' }} onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} />}>
                                    Add Product Line Item
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </div>
            
            <Form.Item shouldUpdate>
                {() => {
                    const currentProductsList = form.getFieldValue('products') || [];
                    const totalBill = currentProductsList.reduce((sum: number, p: any) => sum + (Number(p?.price) || 0), 0);
                    return (
                        <div style={{ margin: '15px 0 25px', padding: '15px', background: 'rgba(0, 210, 255, 0.05)', borderRadius: '10px', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#ccc', fontSize: '16px' }}>Total Projected Invoice Value:</span>
                            <span style={{ fontSize: '24px', fontWeight: 800, color: '#00d2ff' }}>₹ {totalBill.toLocaleString()}</span>
                        </div>
                    );
                }}
            </Form.Item>
            
            <Form.Item style={{ marginTop: '20px' }}>
                <Button type="primary" htmlType="submit" loading={formLoading} style={{ width: '100%', background: 'linear-gradient(90deg, #00d2ff, #9b59b6)', border: 'none', height: '40px', fontSize: '16px' }}>
                    Push Native Order + Products
                </Button>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
