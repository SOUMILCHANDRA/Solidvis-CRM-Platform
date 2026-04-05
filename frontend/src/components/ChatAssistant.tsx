// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Greetings, I am the SolidVis AI Navigator. How can I assist your enterprise operations today?', sender: 'ai', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with enterprise logic
    setTimeout(async () => {
      let response = "I'm analyzing the database for that information...";
      const query = input.toLowerCase();

      if (query.includes('order') || query.includes('sales')) {
        const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        response = `Our network currently manages ${count?.toLocaleString()} active orders across all client nodes.`;
      } else if (query.includes('revenue') || query.includes('money')) {
        const { count } = await supabase.from('invoice').select('*', { count: 'exact', head: true });
        const revenue = (count || 0) * 118000;
        response = `Total projected revenue from across the ecosystem is approximately ₹ ${revenue.toLocaleString()}. (Calculated from ${count} invoices)`;
      } else if (query.includes('company') || query.includes('client')) {
        const { data } = await supabase.from('company').select('company_name').limit(3);
        const names = data?.map(d => d.company_name).join(', ');
        response = `I've identified top-tier partners including ${names} among others in our repository.`;
      } else {
        response = "Understood. I will monitor the background telemetry for any updates regarding your query. Is there anything else specific from the dashboard you need?";
      }

      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: response, sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      
      // Also trigger a notification if relevant
      if (window && (window as any).addNotification) {
          (window as any).addNotification('info', 'AI Insight', response.substring(0, 50) + '...');
      }

    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      className="chat-assistant"
    >
      {/* Header */}
      <div style={{ padding: '20px', background: 'linear-gradient(90deg, #00d2ff, #9b59b6)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} />
          <span style={{ fontWeight: 700, fontSize: '16px' }}>AI Navigator</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {messages.map(m => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, x: m.sender === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`message ${m.sender}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
               {m.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
               <span style={{ fontSize: '10px', opacity: 0.7 }}>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {m.text}
          </motion.div>
        ))}
        {isTyping && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="message ai"
             style={{ display: 'flex', gap: '4px', padding: '10px 15px' }}
           >
             <span className="dot-typing"></span>
             <span className="dot-typing"></span>
             <span className="dot-typing"></span>
           </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Query the AI Network..."
          />
          <button 
            onClick={handleSend}
            style={{ 
              background: '#00d2ff', border: 'none', borderRadius: '12px', width: '45px', height: '45px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'black'
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
