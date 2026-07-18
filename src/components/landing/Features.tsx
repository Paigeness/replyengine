"use client"

import { CheckCircle2, Globe, MessageSquare, ShieldCheck, Zap, BarChart3, Clock, Layout, Sparkles } from "lucide-react"
import { FadeIn, StaggerContainer } from "./Animations"

const features = [
  {
    name: "Multi-Platform Monitoring",
    description: "Connect your Google Business Profile, Yelp, and TripAdvisor pages to see everything in one place.",
    icon: Globe,
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    name: "AI-Powered Responses",
    description: "Our advanced AI drafts high-quality, professional responses for every review in seconds using GPT-4o.",
    icon: Sparkles,
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    name: "Brand Tone Customization",
    description: "Train the AI to match your specific brand voice—whether you're friendly, formal, or witty.",
    icon: MessageSquare,
    color: "bg-green-500/10 text-green-500"
  },
  {
    name: "Automated Scheduling",
    description: "Set it to auto-post responses or review drafts before they go live. You stay in full control.",
    icon: Clock,
    color: "bg-orange-500/10 text-orange-500"
  },
  {
    name: "Reputation Analytics",
    description: "Track your average rating, response rate, and sentiment trends across all platforms in real-time.",
    icon: BarChart3,
    color: "bg-red-500/10 text-red-500"
  },
  {
    name: "Centralized Dashboard",
    description: "Manage multiple business locations from a single, intuitive interface designed for efficiency.",
    icon: Layout,
    color: "bg-indigo-500/10 text-indigo-500"
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <FadeIn>
            <h2 className="text-sm font-semibold leading-7 text-primary mb-4 uppercase tracking-[0.2em]">Features</h2>
            <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
              Everything you need to manage your reputation
            </p>
            <p className="text-lg leading-relaxed text-slate-600">
              Stop wasting hours manually responding to reviews. ReplyEngine handles the heavy lifting so you can focus on your customers.
            </p>
          </FadeIn>
        </div>
        
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <FadeIn key={feature.name} direction="up" delay={i * 0.05}>
                <div className="group bg-background/80 backdrop-blur-sm p-8 rounded-2xl border border-muted transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 h-full">
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.name}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </section>
  )
}
