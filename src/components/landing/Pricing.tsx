import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "$149",
    description: "Perfect for single-location businesses just getting started.",
    features: [
      "1 Business Location",
      "Google & Yelp Support",
      "AI Review Drafting",
      "Manual Approval Flow",
      "Basic Analytics",
      "Email Support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "$299",
    description: "For expanding businesses that need more power and locations.",
    features: [
      "Up to 5 Business Locations",
      "All Integration Support",
      "Auto-Posting Mode",
      "Custom Brand Tone",
      "Advanced Analytics",
      "Priority Email Support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Agency",
    price: "$499",
    description: "Ideal for marketing agencies managing multiple clients.",
    features: [
      "Unlimited Locations",
      "White-label Reports",
      "Team Access Control",
      "API Access",
      "Dedicated Account Manager",
      "Phone Support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary mb-4 uppercase tracking-wider">Pricing</h2>
          <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
            Simple, transparent pricing
          </p>
          <p className="text-lg leading-8 text-slate-600">
            Choose the plan that fits your business needs. All plans include a 14-day free trial.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-xl scale-105 z-10' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mx-6">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
