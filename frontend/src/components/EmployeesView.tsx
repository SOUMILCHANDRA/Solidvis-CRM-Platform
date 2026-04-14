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
                .from('team_members')
                .select('*')
                .order('name', { ascending: true });
            
            if (error) {
                console.error("Team fetch error:", error);
                message.error(`Failed to load sales representatives: ${error.message} (${error.code})`);
                throw error;
            }
            setEmployees(data || []);
        } catch (error) {
            // Error already logged and messaged
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
                .from('team_members')
                .insert([
                    { 
                        name: values.name, 
                        role: values.role, 
                        email: values.email 
                    }
                ]);

            if (error) {
                console.error("Employee add error:", error);
                throw error;
            }

            message.success('New Sales Representative added successfully!');
            setIsModalVisible(false);
            form.resetFields();
            fetchEmployees();
        } catch (error: any) {
            message.error(error.message || 'Failed to add sales representative');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const { error } = await supabase.from('team_members').delete().eq('id', id);
            if (error) throw error;
            message.success('Member removed');
            fetchEmployees();
        } catch (err: any) {
            message.error(err.message || 'Delete failed');
        }
    };

    const columns = [
        {
            title: 'Rep Name',
            dataIndex: 'name',
            key: 'name',
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
            dataIndex: 'id',
            key: 'id',
            render: (id: string) => <Tag color="#333">REP-{id.slice(0, 8)}...</Tag>
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
               <Button danger type="text" onClick={() => handleDelete(record.id)}>Delete</Button>
            )
        }
    ];

    const filteredEmployees = employees.filter(emp => 
        (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                    rowKey="id"
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
                        name="name" 
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
