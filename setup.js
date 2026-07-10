const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://obzkfwgxedgsaxbqvkef.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iemtmd2d4ZWRnc2F4YnF2a2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MDM4OCwiZXhwIjoyMDk2MjM2Mzg4fQ.EHqF2dxNCfaZuBmKF9UqC_IpgA9rB6MnnhHNdxaFcb4';
const supabase = createClient(SUPABASE_URL, KEY);

async function main() {
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  const user = users?.find(u => u.email === 'paigehmattke@yahoo.com');
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'paigehmattke@yahoo.com', password: 'Apple2026$$',
      email_confirm: true, user_metadata: { role: 'owner' }
    });
    if (error) { console.log('ERROR:', error.message); return; }
    console.log('Created user:', data.user.id);
  } else {
    console.log('User exists:', user.id);
    await supabase.auth.admin.updateUserById(user.id, { password: 'Apple2026$$' });
  }
  const { data: org } = await supabase.from('organizations').upsert({
    name: 'My Business', slug: 'my-business'
  }, { onConflict: 'slug' }).select().single();
  if (org) {
    await supabase.from('users').upsert({
      id: user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === 'paigehmattke@yahoo.com').id,
      email: 'paigehmattke@yahoo.com', organization_id: org.id, role: 'owner'
    }, { onConflict: 'id' });
    console.log('Linked to org:', org.id);
  }
  console.log('DONE! Login at replyengine.net with paigehmattke@yahoo.com / Apple2026$$');
}
main();