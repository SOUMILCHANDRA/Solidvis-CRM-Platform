import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, message, Tag, Space } from 'antd';
import { UserPlus, Users, Mail, Briefcase, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EmployeesView = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('EMPLOYEE')
                .select('*')
                .order('employee_id', { ascending: false });
            
            if (error) throw error;
            setEmployees(data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            message.error('Failed to load sales representatives');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAddEmployee = async (values: any) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('EMPLOYEE')
                .insert([
                    { 
                        employee_name: values.employee_name, 
                        role: values.role, 
                        email: values.email 
                    }
                ]);

            if (error) throw error;

            message.success('New Sales Representative added successfully!');
            setIsModalVisible(false);
            form.resetFields();
            fetchEmployees();
        } catch (error: any) {
            console.error('Error adding employee:', error);
            message.error(error.message || 'Failed to add sales representative');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Rep Name',
            dataIndex: 'employee_name',
            key: 'employee_name',
            render: (text: string) => <span style={{ fontWeight: 600, color: '#00d2ff' }}>{text}</span>,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role?.includes('Sr') ? 'gold' : 'blue'}>
                    {role || 'Sales Rep'}
                </Tag>
            ),
        },
        {
            title: 'Email Address',
            dataIndex: 'email',
            key: 'email',
            render: (email: string) => (
                <Space>
                    <Mail size={14} color="#888" />
                    <span>{email}</span>
                </Space>
            ),
        },
        {
            title: 'Internal ID',
            dataIndex: 'employee_id',
            key: 'employee_id',
            render: (id: number) => <Tag color="#333">REP-{id}</Tag>
        }
    ];

    const filteredEmployees = employees.filter(emp => 
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '0 0 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ color: 'white', margin: 0, fontSize: '28px', fontWeight: 800 }}>Team Management</h1>
                    <p style={{ color: '#888', margin: 0 }}>Manage enterprise sales representatives and roles</p>
                </div>
                <Button 
                    type="primary" 
                    icon={<UserPlus size={18} style={{ marginRight: '8px' }} />}
                    onClick={() => setIsModalVisible(true)}
                    style={{ 
                        height: '45px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)'
                    }}
                >
                    Add New Representative
                </Button>
            </div>

            <Card className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
                    <Input 
                        prefix={<Search size={18} color="#555" />}
                        placeholder="Search representatives..."
                        style={{ 
                            background: 'rgba(0,0,0,0.2)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'white',
                            borderRadius: '10px'
                        }}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <Table 
                    dataSource={filteredEmployees} 
                    columns={columns} 
                    loading={loading}
                    rowKey="employee_id"
                    pagination={{ pageSize: 8 }}
                    className="custom-table"
                />
            </Card>

            <Modal
                title={<div style={{ color: 'white' }}>Add New Sales Representative</div>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
                className="glass-modal"
                bodyStyle={{ paddingTop: '20px' }}
            >
                <Form form={form} layout="vertical" onFinish={handleAddEmployee}>
                    <Form.Item 
                        name="employee_name" 
                        label="Full Name" 
                        rules={[{ required: true, message: 'Please enter name' }]}
                    >
                        <Input placeholder="John Doe" prefix={<Users size={16} />} />
                    </Form.Item>
                    
                    <Form.Item 
                        name="email" 
                        label="Email Address" 
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="john@enterprise.com" prefix={<Mail size={16} />} />
                    </Form.Item>

                    <Form.Item 
                        name="role" 
                        label="Designation / Role" 
                        initialValue="Jr. Sales Engineer"
                    >
                        <Input placeholder="e.g. Sr. Sales Manager" prefix={<Briefcase size={16} />} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeesView;
