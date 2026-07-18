"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn, StaggerContainer } from "./Animations"
import { motion } from "framer-motion"

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
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50/50 relative overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <FadeIn>
            <h2 className="text-sm font-semibold leading-7 text-primary mb-4 uppercase tracking-[0.2em]">Pricing</h2>
            <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
              Simple, transparent pricing
            </p>
            <p className="text-lg leading-relaxed text-slate-600">
              Choose the plan that fits your business needs. All plans include a 14-day free trial. No hidden fees.
            </p>
          </FadeIn>
        </div>
        
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {plans.map((plan, i) => (
              <FadeIn key={plan.name} direction="up" delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`relative flex flex-col h-full border-2 transition-all duration-300 overflow-hidden ${
                    plan.popular 
                      ? 'border-primary shadow-2xl scale-105 z-10 bg-background' 
                      : 'border-muted hover:border-primary/50'
                  }`}>
                    {plan.popular && (
                      <div className="absolute top-0 right-0 p-0">
                        <div className="bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="pb-8">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <div className="mb-8 flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                        <span className="text-muted-foreground font-medium">/month</span>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">What's included:</p>
                        <ul className="space-y-4">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 group">
                              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                              }`}>
                                <Check className="w-3 h-3" />
                              </div>
                              <span className="text-slate-600 transition-colors group-hover:text-slate-900">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-8">
                      <Link href="/signup" className="w-full">
                        <Button 
                          className={`w-full h-14 text-lg font-bold transition-all ${
                            plan.popular 
                              ? 'shadow-lg shadow-primary/20' 
                              : ''
                          }`} 
                          variant={plan.popular ? "default" : "outline"} 
                          size="lg"
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </StaggerContainer>
        
        <FadeIn delay={0.5}>
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              Need a custom plan? <Link href="/contact" className="text-primary font-bold hover:underline">Contact our sales team</Link>
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
