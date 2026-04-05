import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table, Input, Select, Spin } from 'antd';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

const { Option } = Select;

export default function CompaniesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      
      // Fetch all companies
      const { data: companyData, error: companyError } = await supabase
        .from('company')
        .select('*');
        
      if (companyError) {
        console.error("Error fetching companies:", companyError);
      } else if (companyData) {
        setCompanies(companyData.map(c => ({
          key: c.company_id,
          name: c.company_name,
          gst: c.gst_number,
          city: c.city,
          postal: c.postal_code
        })));
      }

      // Fetch all contacts
      const { data: contactData, error: contactError } = await supabase
        .from('contact_person')
        .select('*');

      if (!contactError && contactData) {
        const contactMap: any = {};
        contactData.forEach(c => {
          if (!contactMap[c.company_id]) contactMap[c.company_id] = [];
          contactMap[c.company_id].push({
            name: c.contact_name,
            role: c.designation,
            email: c.email
          });
        });
        setContacts(contactMap);
      }

      setLoading(false);
    };

    fetchCompanies();
  }, []);

  const filteredData = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (cityFilter === 'All' || c.city === cityFilter)
  );

  const columns = [
    { title: 'Company ID', dataIndex: 'key', key: 'key' },
    { title: 'Company Name', dataIndex: 'name', key: 'name' },
    { title: 'GST Number', dataIndex: 'gst', key: 'gst' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Postal', dataIndex: 'postal', key: 'postal' },
  ];

  const expandedRowRender = (record: any) => {
    const companyContacts = contacts[record.key] || [];
    return (
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
        <h4 style={{ color: '#00d2ff', marginBottom: '10px' }}>Contact Persons</h4>
        {companyContacts.length > 0 ? (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {companyContacts.map((c: any, i: number) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ color: '#aaa', fontSize: '13px' }}>{c.role}</div>
                <div style={{ color: '#00d2ff', fontSize: '13px', marginTop: '5px' }}>{c.email}</div>
                </div>
            ))}
            </div>
        ) : (
            <div style={{ color: '#aaa', fontStyle: 'italic' }}>No contacts linked to this company yet.</div>
        )}
      </motion.div>
    );
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 className="glow-text" style={{ fontSize: '32px', marginBottom: '30px' }}>Companies & Contacts</h1>
      
      <motion.div className="glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <Input 
            prefix={<Search size={18} color="#aaa" />}
            placeholder="Search company by name..."
            style={{ width: '300px', background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select defaultValue="All" style={{ width: 150 }} onChange={setCityFilter} popupClassName="dark-dropdown">
            <Option value="All">All Cities</Option>
            <Option value="PUNE">PUNE</Option>
            <Option value="ALANDI RURAL">ALANDI RURAL</Option>
          </Select>
        </div>

        {loading ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#00d2ff' }}>
                <Spin size="large" /> <p style={{ marginTop: '15px' }}>Fetching Companies...</p>
            </div>
        ) : (
            <Table 
                columns={columns} 
                dataSource={filteredData} 
                expandable={{ expandedRowRender }}
                pagination={{ pageSize: 5 }}
                className="custom-table"
            />
        )}
      </motion.div>
    </div>
  );
}
