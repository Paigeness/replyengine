import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden bg-background">
      <div className="container px-4 mx-auto relative">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
              Never miss a review again. <span className="text-primary">AI that responds for you.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-lg mx-auto lg:mx-0">
              Automate your customer reputation. We monitor Google, Yelp, and TripAdvisor, 
              writing perfectly-toned responses so you can focus on running your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/signup" passHref>
                <Button size="lg" className="px-8 text-lg h-14">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#how-it-works" passHref>
                <Button size="lg" variant="outline" className="px-8 text-lg h-14">
                  See How It Works
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale transition hover:grayscale-0">
              {/* These would be logos */}
              <span className="font-bold text-xl">Google</span>
              <span className="font-bold text-xl">Yelp</span>
              <span className="font-bold text-xl">TripAdvisor</span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <div className="relative max-w-md mx-auto lg:mr-0 lg:ml-auto">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative bg-card border rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">JD</div>
                  <div>
                    <div className="font-bold">John Doe</div>
                    <div className="text-sm text-muted-foreground">5 stars on Google</div>
                  </div>
                </div>
                <p className="italic text-lg mb-8">
                  "The food was incredible and the service was top-notch! Best coffee in town."
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">AI Response (Drafted)</div>
                  <p className="text-sm">
                    Hi John! We're so glad you enjoyed your coffee and the atmosphere. 
                    Thanks for the 5-star review, see you again soon!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
