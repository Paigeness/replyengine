import { createClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', userProfile?.organization_id)
    .maybeSingle();

  const plans = [
    {
      name: 'Starter',
      price: '$149',
      description: '1 Location, AI-automated responses.',
      priceId: process.env.STRIPE_PRICE_ID_STARTER,
    },
    {
      name: 'Growth',
      price: '$399',
      description: 'Up to 5 Locations, priority support.',
      priceId: process.env.STRIPE_PRICE_ID_GROWTH,
    },
    {
      name: 'Agency',
      price: '$999',
      description: 'Unlimited Locations, white-labeling.',
      priceId: process.env.STRIPE_PRICE_ID_AGENCY,
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and billing details.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {subscription 
                ? `You are currently on the ${subscription.plan} plan.` 
                : 'You do not have an active subscription.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription && (
              <div className="text-sm space-y-1">
                <p><strong>Status:</strong> <span className="capitalize">{subscription.status}</span></p>
                <p><strong>Current Period Ends:</strong> {new Date(subscription.current_period_end).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {subscription ? (
              <form action="/api/stripe/portal" method="POST">
                <Button variant="outline">Manage Billing in Stripe</Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Select a plan below to get started.</p>
            )}
          </CardFooter>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={subscription?.plan === plan.name.toLowerCase() ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardContent>
              <CardFooter>
                <form action="/api/stripe/checkout" method="POST" className="w-full">
                  <input type="hidden" name="priceId" value={plan.priceId} />
                  <input type="hidden" name="organizationId" value={userProfile?.organization_id} />
                  <Button 
                    className="w-full" 
                    disabled={subscription?.plan === plan.name.toLowerCase()}
                  >
                    {subscription?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
