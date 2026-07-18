"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FadeIn } from "./Animations"
import { Sparkles } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-primary -z-10" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 -z-10" />
      
      <div className="container mx-auto px-4 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-8 backdrop-blur-sm border border-white/20">
            <Sparkles className="w-4 h-4" />
            <span>Ready to scale your reputation?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
            Start automating your reviews today
          </h2>
          
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of local businesses saving time and improving their reputation with ReplyEngine. Start your 14-day free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-12 h-16 text-xl font-bold shadow-xl hover:scale-105 transition-transform">
                Get Started for Free
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="px-12 h-16 text-xl font-bold text-white border-white/20 hover:bg-white/10 backdrop-blur-sm">
                View Pricing
              </Button>
            </Link>
          </div>
          
          <p className="mt-8 text-white/60 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
