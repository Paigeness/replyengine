import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        
        {/* Social Proof Stats */}
        <section className="py-12 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2">1M+</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Response Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2">4.9/5</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Avg Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 max-w-4xl mx-auto leading-tight">
              1 in 3 customers choose businesses that respond to reviews.
            </h2>
            <p className="text-xl opacity-80 max-w-2xl mx-auto mb-12 leading-relaxed">
              But most business owners simply don't have the time to reply to every Google, Yelp, and TripAdvisor review.
              Ignoring them is costing you money.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-10 h-16 text-xl font-bold shadow-2xl hover:scale-105 transition-transform">
                Fix Your Reputation Now
              </Button>
            </Link>
          </div>
        </section>

        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
