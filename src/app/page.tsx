import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        
        {/* Agitation Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 max-w-3xl mx-auto">
              1 in 3 customers choose businesses that respond to reviews.
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10">
              But most business owners simply don't have the time to reply to every Google, Yelp, and TripAdvisor review. 
              Ignoring them is costing you money.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-10 h-14 text-lg">
                Fix Your Reputation Now
              </Button>
            </Link>
          </div>
        </section>

        <HowItWorks />
        <Features />
        
        {/* Testimonials Placeholder */}
        <section className="py-24 bg-background border-y">
          <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-bold mb-16">Trusted by local businesses</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-8 border rounded-2xl bg-card shadow-sm">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mb-6 italic text-muted-foreground">
                      "Since using ReplyEngine, my response rate jumped to 100%. Our Google Business Profile ranking has never been higher, and it literally takes zero of my time."
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">SB</div>
                      <div>
                        <div className="font-bold">Sarah Brown</div>
                        <div className="text-xs text-muted-foreground">Owner, Coastal Cafe</div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        <Pricing />
        
        {/* FAQ Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>
            <div className="space-y-8">
              {[
                {
                  q: "How does the AI know how to respond to my specific business?",
                  a: "During onboarding, you provide your business details, tone preferences, and specific instructions. Our AI uses this data to ensure every response sounds authentic and matches your brand voice."
                },
                {
                  q: "Does it automatically post to Google and Yelp?",
                  a: "Yes! You can choose between 'Draft Mode' (where you review responses before they go live) or 'Auto-Pilot Mode' (where the AI posts immediately)."
                },
                {
                  q: "What if the AI makes a mistake?",
                  a: "Our AI is highly accurate, but you can always edit or delete any response through your dashboard. In 'Draft Mode', nothing goes live without your approval."
                }
              ].map((faq) => (
                <div key={faq.q} className="border-b pb-8">
                  <h3 className="text-xl font-bold mb-4">{faq.q}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8">Start automating your reviews today</h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Join hundreds of local businesses saving time and improving their reputation with ReplyEngine.
            </p>
            <Link href="/signup">
              <Button size="lg" className="px-12 h-16 text-xl">
                Start Your 14-Day Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
