export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">ReplyEngine</h1>
        <p className="text-lg text-muted-foreground">
          AI-automated review response platform. Monitor, write, and post responses to customer reviews across Google, Yelp, and TripAdvisor.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/login" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">Log In</a>
          <a href="/signup" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent">Sign Up</a>
        </div>
      </div>
    </div>
  )
}
