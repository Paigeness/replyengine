import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.organization_id) {
      return new NextResponse('No organization found', { status: 404 });
    }

    const { data: organization } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', userProfile.organization_id)
      .single();

    if (!organization?.stripe_customer_id) {
      return new NextResponse('No stripe customer found', { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripe_customer_id,
      return_url: `${request.headers.get('origin')}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(error.message, { status: 500 });
  }
}
