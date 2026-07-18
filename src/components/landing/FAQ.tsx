"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { FadeIn } from "./Animations"

const faqs = [
  {
    question: "How does the AI know how to respond to my specific business?",
    answer: "During onboarding, you provide your business details, tone preferences, and specific instructions. Our AI uses this data to ensure every response sounds authentic and matches your brand voice."
  },
  {
    question: "Does it automatically post to Google and Yelp?",
    answer: "Yes! You can choose between 'Draft Mode' (where you review responses before they go live) or 'Auto-Pilot Mode' (where the AI posts immediately)."
  },
  {
    question: "What if the AI makes a mistake?",
    answer: "Our AI is highly accurate, but you can always edit or delete any response through your dashboard. In 'Draft Mode', nothing goes live without your approval."
  },
  {
    question: "Can I manage multiple locations with one account?",
    answer: "Absolutely. Our Growth and Agency plans are designed specifically for businesses and agencies managing multiple locations from a single centralized dashboard."
  },
  {
    question: "Which platforms do you support?",
    answer: "We currently support Google Business Profile, Yelp, and TripAdvisor. We are constantly working on adding more platforms based on customer feedback."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about ReplyEngine.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05} direction="none">
              <div className="border rounded-2xl overflow-hidden bg-card">
                <button
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0 text-muted-foreground border-t bg-muted/20">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
