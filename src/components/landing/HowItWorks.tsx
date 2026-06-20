export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect Your Accounts",
      description: "Securely link your Google, Yelp, and TripAdvisor profiles with just a few clicks."
    },
    {
      number: "02",
      title: "Monitor in Real-Time",
      description: "Our engine scans for new reviews 24/7. You'll get notified as soon as feedback arrives."
    },
    {
      number: "03",
      title: "Automate Responses",
      description: "AI drafts a perfect response based on your tone. Approve it or let us auto-post it for you."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary mb-4 uppercase tracking-wider">Process</h2>
          <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
            Get set up in less than 5 minutes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="text-6xl font-black text-primary/5 absolute -top-8 -left-4">
                {step.number}
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
