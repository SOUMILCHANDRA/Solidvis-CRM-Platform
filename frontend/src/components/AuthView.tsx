import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { Input, Button, Form, message } from 'antd';
import { supabase } from '../lib/supabase';

export default function AuthView({ setSession }: { setSession: any }) {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    
    const handleAuth = async (values: any) => {
        setLoading(true);
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password
            });
            if (error) message.error(error.message);
            else message.success('Provisioning sequence completed. You may now login securely.');
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password
            });
            if (error) message.error(error.message);
            else {
                message.success('Authorization confirmed. Accessing Secure Dashboard.');
                setSession(data.session);
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
            <motion.div 
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '400px', padding: '40px', borderRadius: '25px', textAlign: 'center', zIndex: 100 }}
            >
                <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 5px' }}>
                    SOLID<span style={{ color: '#00d2ff' }}>VIS</span>
                </h2>
                <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '14px' }}>
                    {isSignUp ? 'Create a secure enterprise account' : 'Authenticate to access the dashboard'}
                </p>

                <Form layout="vertical" onFinish={handleAuth}>
                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
                        <Input prefix={<Mail size={16} color="#aaa" />} placeholder="Enterprise Email" size="large" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '15px' }} />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Minimum 6 characters' }]}>
                        <Input.Password prefix={<Lock size={16} color="#aaa" />} placeholder="••••••••" size="large" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '15px' }} />
                    </Form.Item>
                    <Form.Item style={{ marginTop: '30px' }}>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '45px', borderRadius: '15px', background: 'linear-gradient(90deg, #00d2ff, #9b59b6)', border: 'none', fontWeight: 600, fontSize: '16px' }} icon={isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}>
                            {isSignUp ? 'Register Network' : 'Secure Login'}
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ marginTop: '20px', cursor: 'pointer', color: '#888', fontSize: '13px', transition: 'color 0.3s' }} 
                     onMouseOver={(e: any) => e.target.style.color = '#00d2ff'} 
                     onMouseOut={(e: any) => e.target.style.color = '#888'}
                     onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Already authorized? Click here to login' : 'Need an invite? Create Account'}
                </div>
            </motion.div>
        </div>
    );
}
