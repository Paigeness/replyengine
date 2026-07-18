"use client"

import { Star } from "lucide-react"
import { FadeIn, StaggerContainer } from "./Animations"

const testimonials = [
  {
    content: "Since using ReplyEngine, my response rate jumped to 100%. Our Google Business Profile ranking has never been higher, and it literally takes zero of my time.",
    author: "Sarah Brown",
    role: "Owner, Coastal Cafe",
    avatar: "SB",
    rating: 5
  },
  {
    content: "The AI perfectly matches our friendly neighborhood vibe. I was worried it would sound robotic, but our customers can't even tell the difference.",
    author: "Mark Davis",
    role: "Manager, The Local Pub",
    avatar: "MD",
    rating: 5
  },
  {
    content: "We manage 4 different locations and responding to reviews used to be a full-time job. ReplyEngine saved us at least 15 hours a week.",
    author: "Elena Rodriguez",
    role: "Director, Sunshine Dental",
    avatar: "ER",
    rating: 5
  }
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-background border-y">
      <div className="container mx-auto px-4 text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold mb-4">Trusted by local businesses</h2>
          <p className="text-muted-foreground mb-16 max-w-2xl mx-auto">
            Join hundreds of business owners who have automated their reputation management.
          </p>
        </FadeIn>
        
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {testimonials.map((testimonial, i) => (
              <FadeIn key={i} direction="up" delay={i * 0.1}>
                <div className="p-8 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="mb-6 italic text-muted-foreground flex-grow">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
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
