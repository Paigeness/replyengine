"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FadeIn, StaggerContainer } from "./Animations"
import { CheckCircle2, MessageSquare, Star } from "lucide-react"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden bg-background">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container px-4 mx-auto relative">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-16 lg:mb-0 text-center lg:text-left">
            <StaggerContainer>
              <FadeIn direction="down" delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  AI-Powered Review Management
                </div>
              </FadeIn>
              
              <FadeIn direction="up" delay={0.2}>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                  Never miss a review again. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">AI that responds for you.</span>
                </h1>
              </FadeIn>
              
              <FadeIn direction="up" delay={0.3}>
                <p className="text-xl text-muted-foreground mb-12 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Automate your customer reputation. We monitor Google, Yelp, and TripAdvisor,
                  writing perfectly-toned responses so you can focus on running your business.
                </p>
              </FadeIn>
              
              <FadeIn direction="up" delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/signup" passHref>
                    <Button size="lg" className="px-8 text-lg h-14 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="#how-it-works" passHref>
                    <Button size="lg" variant="outline" className="px-8 text-lg h-14 font-bold hover:bg-muted/50 transition-colors">
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </FadeIn>
              
              <FadeIn direction="up" delay={0.5}>
                <div className="mt-16 pt-8 border-t border-muted flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-40 grayscale transition hover:grayscale-0 hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 fill-[#4285F4]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    <span className="font-bold text-xl tracking-tight text-slate-900">Google</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 fill-[#D32323]" viewBox="0 0 24 24"><path d="M19.14 15.11c-.53.11-1.09.2-1.63.26l.1.5c.29 1.48-.68 3.53-2.86 3.93l-.48.09.28.43c.96 1.48 1.4 3.25.1 3.51-.17.03-.35.03-.52.01-.84-.09-1.57-1.1-2.08-2.71l-.16-.5-.45.24c-1.39.73-3.6 1.48-4.8 0l-.25-.32-.2.35c-.7 1.25-1.96 2.51-3.34 2.22-.38-.08-.73-.34-.91-.7-.35-.74.1-2.11 1.23-3.73l.29-.42-.5-.07c-1.74-.23-3.87-1.28-3.71-3.56.02-.33.15-.65.37-.91.43-.5 1.5-.4 3.01-.2l.55.08.13-.53c.44-1.84.44-4.22 2.76-4.84l.5-.13-.39-.33C4.16 5.86 3.19 4.19 3.86 3.16c.09-.13.2-.24.32-.34.6-.47 1.83-.24 3.42.61l.46.25.17-.48C9.28 1.43 10.6 0 11.96 0c1.36 0 2.18 1.43 3 3.19l.21.48.45-.26c1.61-.92 2.83-1.18 3.43-.72.12.1.24.21.32.34.67 1.03-.3 2.71-2.4 4.1l-.39.26.5.11c2.32.5 2.45 2.88 2.89 4.7l.13.52.54-.08c1.5-.21 2.58-.31 3.01.2.22.25.35.58.37.9.16 2.29-1.97 3.33-3.71 3.56l-.5.07.29.42c1.13 1.62 1.58 3 1.23 3.73-.18.36-.53.62-.91.7-1.38.29-2.64-.97-3.34-2.22l-.2-.35-.25.32c-1.2 1.48-3.41.73-4.8 0l-.45-.24-.16.5c-.51 1.61-1.24 2.62-2.08 2.71-.17.02-.35.02-.52-.01-1.3-.26-.86-2.03.1-3.51l.28-.43-.48-.09c-2.18-.4-3.15-2.45-2.86-3.93l.1-.5c-.54-.06-1.1-.15-1.63-.26z"/></svg>
                    <span className="font-bold text-xl tracking-tight text-slate-900">Yelp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 fill-[#00AF87]" viewBox="0 0 24 24"><path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm0 4.138c-3.103 0-5.618 2.515-5.618 5.618 0 3.103 2.515 5.618 5.618 5.618 3.103 0 5.618-2.515 5.618-5.618 0-3.103-2.515-5.618-5.618-5.618zm0 1.942c2.03 0 3.676 1.646 3.676 3.676 0 2.03-1.646 3.676-3.676 3.676-2.03 0-3.676-1.646-3.676-3.676 0-2.03 1.646-3.676 3.676-3.676zm3.627 9.873c-1.144-.316-2.38-.485-3.627-.485-1.247 0-2.483.169-3.627.485-1.21.334-2.146.995-2.678 1.834C6.541 18.575 8.165 19.31 10 19.31h4c1.835 0 3.459-.735 4.305-1.525-.532-.839-1.468-1.5-2.678-1.834z"/></svg>
                    <span className="font-bold text-xl tracking-tight text-slate-900">TripAdvisor</span>
                  </div>
                </div>
              </FadeIn>
            </StaggerContainer>
          </div>
          
          <div className="w-full lg:w-1/2 px-4">
            <FadeIn direction="left" delay={0.3}>
              <div className="relative max-w-md mx-auto lg:mr-0 lg:ml-auto">
                {/* Decorative blobs */}
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                
                {/* Dashboard mock card */}
                <div className="relative bg-card border rounded-2xl shadow-2xl p-6 backdrop-blur-sm bg-white/80 overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">JD</div>
                    <div>
                      <div className="font-bold">John Doe</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Verified Customer
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                      Original Review
                    </div>
                    <p className="italic text-lg text-slate-700 leading-relaxed">
                      "The food was incredible and the service was top-notch! Best coffee in town."
                    </p>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="bg-primary/5 rounded-xl p-4 border border-primary/10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest flex items-center gap-2">
                      <motion.div 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                      />
                      AI Response Generated
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      Hi John! We're so glad you enjoyed your coffee and the atmosphere. 
                      Thanks for the 5-star review, see you again soon!
                    </p>
                    <div className="mt-4 flex gap-2">
                      <div className="h-6 w-16 bg-primary/20 rounded flex items-center justify-center text-[10px] font-bold text-primary">APPROVE</div>
                      <div className="h-6 w-16 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">EDIT</div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Floating stats card */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white border rounded-xl shadow-xl p-4 flex items-center gap-4 z-20"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Reputation Score</div>
                    <div className="text-lg font-bold">4.9 / 5.0</div>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
