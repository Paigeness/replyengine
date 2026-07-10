const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://obzkfwgxedgsaxbqvkef.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iemtmd2d4ZWRnc2F4YnF2a2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MDM4OCwiZXhwIjoyMDk2MjM2Mzg4fQ.EHqF2dxNCfaZuBmKF9UqC_IpgA9rB6MnnhHNdxaFcb4';
const supabase = createClient(SUPABASE_URL, KEY);

async function testPipeline() {
  const { data: orgs } = await supabase.from('organizations').select('*').limit(1);
  if (!orgs || orgs.length === 0) return;
  const orgId = orgs[0].id;

  console.log('Testing pipeline for org:', orgId);
  
  // 1. Manually trigger the cron logic (simulated)
  // We can't easily call the API route here without the CRON_SECRET and URL
  // But we can check if there are any pending reviews
  const { data: reviews } = await supabase.from('reviews').select('*').eq('responded', false);
  console.log(`Found ${reviews?.length || 0} unresponded reviews`);

  if (reviews && reviews.length > 0) {
    console.log('Sample review:', reviews[0].content);
  }
}

testPipeline();
