// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, Check, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
}

export default function NotificationSystem() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Expose addNotification to window for global access (AI Assistant context)
    useEffect(() => {
        (window as any).addNotification = (type: any, title: string, message: string) => {
            const id = Math.random().toString(36).substring(7);
            setNotifications(prev => [{ id, type, title, message, timestamp: new Date() }, ...prev]);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 5000);
        };
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} color="#2ecc71" />;
            case 'warning': return <AlertTriangle size={20} color="#f1c40f" />;
            case 'error': return <X size={20} color="#e74c3c" />;
            default: return <Info size={20} color="#00d2ff" />;
        }
    };

    return (
        <div className="notification-panel">
            <AnimatePresence>
                {notifications.map(n => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        className="notification-item"
                    >
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '2px' }}>{n.title}</div>
                                <div style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.4 }}>{n.message}</div>
                            </div>
                            <button 
                                onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0 }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
