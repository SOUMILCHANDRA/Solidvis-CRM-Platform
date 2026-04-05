import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  ShoppingCart, 
  Receipt,
  Mic,
  MicOff 
} from 'lucide-react';
import './index.css';

// Importing views (to be created)
import DashboardView from './components/DashboardView';
import CompaniesView from './components/CompaniesView';
import OrdersView from './components/OrdersView';
import InvoicesView from './components/InvoicesView';
import AuthView from './components/AuthView';
import { supabase } from './lib/supabase';

const FloatingParticles = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth, opacity: Math.random() * 0.5 + 0.1 }}
        animate={{ y: [null, Math.random() * window.innerHeight], x: [null, Math.random() * window.innerWidth] }}
        transition={{ duration: Math.random() * 20 + 10, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: Math.random() * 4 + 2 + 'px',
          height: Math.random() * 4 + 2 + 'px',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(255,255,255,0.5)'
        }}
      />
    ))}
  </div>
);

const MouseAura = () => {
    useEffect(() => {
        const aura = document.getElementById('mouse-aura');
        if (!aura) return;
        const handleMouseMove = (e: MouseEvent) => {
            aura.style.left = `${e.clientX}px`;
            aura.style.top = `${e.clientY}px`;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    return <div id="mouse-aura" style={{ left: '-1000px', top: '-1000px' }} />;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isListening, setIsListening] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Web Speech API for AI commands
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      let command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Voice Command:', command);
      
      const searchMatch = command.match(/^(?:search for|find|search)\s+(.*)/i);
      
      if (searchMatch) {
          let term = searchMatch[1].trim();
          if (term.includes('order')) {
            setActiveTab('orders');
            term = term.replace(/orders?/g, '').trim();
          } else if (term.includes('compan') || term.includes('client')) {
            setActiveTab('companies');
            term = term.replace(/compan(?:y|ies)?|clients?/g, '').trim();
          } else if (term.includes('invoice')) {
            setActiveTab('invoices');
            term = term.replace(/invoices?/g, '').trim();
          }
          
          // If searching an ID, usually it's upper case in CRM
          if (term.length > 0) term = term.toUpperCase();
          
          // Auto-inject into the target tab's Native React Input
          setTimeout(() => {
              const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
              if (searchInput) {
                  const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                  nativeInputSetter?.call(searchInput, term);
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
          }, 400); // 400ms delay ensures Framer Route Transition has finished mounting the target view

      } else if (command.includes('show pending invoices') || command.includes('invoices')) {
        setActiveTab('invoices');
      } else if (command.includes('top clients') || command.includes('companies')) {
        setActiveTab('companies');
      } else if (command.includes('dashboard') || command.includes('home')) {
        setActiveTab('dashboard');
      } else if (command.includes('orders')) {
        setActiveTab('orders');
      }
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [isListening]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'companies', label: 'CRM / Companies', icon: <Building2 size={20} /> },
    { id: 'orders', label: 'Orders & Products', icon: <ShoppingCart size={20} /> },
    { id: 'invoices', label: 'Invoices & Payments', icon: <Receipt size={20} /> },
  ];

  if (!session) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        <FloatingParticles />
        <MouseAura />
        <AuthView setSession={setSession} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <FloatingParticles />
      <MouseAura />
      
      {/* Sidebar */}
      <motion.div 
        className="sidebar-glass"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        style={{ width: '260px', padding: '30px 20px', position: 'fixed', height: '100vh', zIndex: 50, display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ marginBottom: '40px', padding: '0 10px' }}>
          <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: '2px', color: '#fff' }}>
            SOLID<span style={{ color: '#00d2ff' }}>VIS</span>
          </h2>
          <p style={{ color: '#aaa', margin: 0, fontSize: '12px' }}>Next-Gen CRM</p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map(item => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === item.id ? '#fff' : '#888',
                boxShadow: activeTab === item.id ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
                fontWeight: activeTab === item.id ? 600 : 400,
                transition: 'all 0.3s'
              }}
            >
              {item.icon}
              {item.label}
            </motion.div>
          ))}
        </nav>

        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            className={`glass-panel ${isListening ? 'voice-btn-active' : ''}`}
            onClick={() => setIsListening(!isListening)}
            style={{ 
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              width: '100%', color: isListening ? '#1ed760' : 'white', background: isListening ? 'rgba(30, 215, 96, 0.1)' : 'rgba(255,255,255,0.05)'
            }}
          >
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            {isListening ? 'Listening...' : 'Voice Assistant'}
          </button>
          <button 
            className="glass-panel"
            onClick={() => supabase.auth.signOut()}
            style={{ 
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              width: '100%', color: '#ffb84d', background: 'rgba(243, 156, 18, 0.1)', marginTop: '15px'
            }}
          >
            Logout Network
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div style={{ marginLeft: '260px', padding: '30px', flex: 1, zIndex: 10, position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '100%' }}
          >
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'companies' && <CompaniesView />}
            {activeTab === 'orders' && <OrdersView />}
            {activeTab === 'invoices' && <InvoicesView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
