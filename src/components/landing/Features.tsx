import { CheckCircle2, Globe, MessageSquare, ShieldCheck, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    name: "Multi-Platform Monitoring",
    description: "Connect your Google Business Profile, Yelp, and TripAdvisor pages to see everything in one place.",
    icon: Globe,
  },
  {
    name: "AI-Powered Responses",
    description: "Our advanced AI drafts high-quality, professional responses for every review in seconds.",
    icon: Zap,
  },
  {
    name: "Brand Tone Customization",
    description: "Train the AI to match your specific brand voice—whether you're friendly, formal, or witty.",
    icon: MessageSquare,
  },
  {
    name: "Automated Scheduling",
    description: "Set it to auto-post responses or review drafts before they go live. You stay in control.",
    icon: ShieldCheck,
  },
  {
    name: "Reputation Analytics",
    description: "Track your average rating, response rate, and sentiment trends across all platforms.",
    icon: BarChart3,
  },
  {
    name: "Spam & Abuse Protection",
    description: "Automatically flag suspicious or inappropriate reviews that violate platform policies.",
    icon: CheckCircle2,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary mb-4 uppercase tracking-wider">Features</h2>
          <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
            Everything you need to manage your reputation
          </p>
          <p className="text-lg leading-8 text-slate-600">
            Stop wasting hours manually responding to reviews. ReplyEngine handles the heavy lifting so you can focus on your customers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.name} className="bg-background p-8 rounded-2xl border transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.name}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
