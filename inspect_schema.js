const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://obzkfwgxedgsaxbqvkef.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iemtmd2d4ZWRnc2F4YnF2a2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MDM4OCwiZXhwIjoyMDk2MjM2Mzg4fQ.EHqF2dxNCfaZuBmKF9UqC_IpgA9rB6MnnhHNdxaFcb4';
const supabase = createClient(SUPABASE_URL, KEY);

async function inspect() {
  const { data: reviews, error: rErr } = await supabase.from('reviews').select('*').limit(1);
  console.log('Reviews columns:', reviews && reviews.length > 0 ? Object.keys(reviews[0]) : 'EMPTY');
  
  const { data: responses, error: rsErr } = await supabase.from('responses').select('*').limit(1);
  console.log('Responses columns:', responses && responses.length > 0 ? Object.keys(responses[0]) : 'EMPTY');
}

inspect();
