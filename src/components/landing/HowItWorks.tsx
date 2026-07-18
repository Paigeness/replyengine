"use client"

import { FadeIn, StaggerContainer } from "./Animations"
import { CheckCircle2, MessageSquare, Search, Zap } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Connect Your Accounts",
    description: "Securely link your Google, Yelp, and TripAdvisor profiles with just a few clicks. No complex setup required.",
    icon: Search
  },
  {
    number: "02",
    title: "Monitor in Real-Time",
    description: "Our engine scans for new reviews 24/7. You'll get notified as soon as feedback arrives on any platform.",
    icon: Zap
  },
  {
    number: "03",
    title: "Automate Responses",
    description: "AI drafts a perfect response based on your tone. Approve it or let us auto-post it for you while you sleep.",
    icon: MessageSquare
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background lines */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none -z-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <FadeIn>
            <h2 className="text-sm font-semibold leading-7 text-primary mb-4 uppercase tracking-[0.2em]">Process</h2>
            <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
              Get set up in less than 5 minutes
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We've simplified reputation management into three easy steps. Focus on your customers, we'll handle the reviews.
            </p>
          </FadeIn>
        </div>
        
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-muted to-transparent -translate-y-1/2 -z-10" />
            
            {steps.map((step, i) => (
              <FadeIn key={step.number} direction="up" delay={i * 0.1}>
                <div className="relative group">
                  {/* Number background */}
                  <div className="text-8xl font-black text-primary/5 absolute -top-12 -left-4 transition-transform group-hover:scale-110 group-hover:-translate-y-2 duration-500">
                    {step.number}
                  </div>
                  
                  <div className="relative z-10 bg-card border rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-6 text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                      <step.icon className="w-7 h-7" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      {step.title}
                      <CheckCircle2 className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </section>
  )
}
