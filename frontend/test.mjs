import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://oglagxuogepqiwhvkebr.supabase.co', 'sb_publishable_uvm0210yAhSVpSKgjHJ4rQ_w2F5-WsC');
const { data, error } = await supabase.from('invoice').select('invoice_id, order_id, total_amount, invoice_date, payment(payment_status)').limit(2);
console.log('Error:', error);
console.log('Data:', data);
