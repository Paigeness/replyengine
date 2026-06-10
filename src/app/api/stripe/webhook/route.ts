import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('Stripe-Signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        if (session.metadata?.organizationId) {
          await supabaseAdmin
            .from('organizations')
            .update({ stripe_customer_id: session.customer as string })
            .eq('id', session.metadata.organizationId);
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as any;
        
        // Find organization by stripe_customer_id
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single();

        if (org) {
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              organization_id: org.id,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan: ((subscription as any).metadata?.plan as string) || 'starter',
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            }, { onConflict: 'stripe_subscription_id' });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as any;
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', deletedSub.id);
        break;

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        const { data: invoiceOrg } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', invoice.customer as string)
          .single();

        if (invoiceOrg) {
          await supabaseAdmin
            .from('billing_history')
            .insert({
              organization_id: invoiceOrg.id,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_paid,
              status: 'paid',
              paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
            });
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        const { data: failedInvoiceOrg } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', failedInvoice.customer as string)
          .single();

        if (failedInvoiceOrg) {
          await supabaseAdmin
            .from('billing_history')
            .insert({
              organization_id: failedInvoiceOrg.id,
              stripe_invoice_id: failedInvoice.id,
              amount: failedInvoice.amount_due,
              status: 'failed',
              created_at: new Date().toISOString(),
            });
        }
        break;
    }
  } catch (error: any) {
    console.error(`Database Error: ${error.message}`);
    return new NextResponse('Database Error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
