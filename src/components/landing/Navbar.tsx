"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { MessageSquare, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-b py-3 shadow-sm" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="container flex items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              ReplyEngine
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <Link href="#features" className="text-slate-600 transition-colors hover:text-primary">Features</Link>
          <Link href="#how-it-works" className="text-slate-600 transition-colors hover:text-primary">How it Works</Link>
          <Link href="#pricing" className="text-slate-600 transition-colors hover:text-primary">Pricing</Link>
          <Link href="/blog" className="text-slate-600 transition-colors hover:text-primary">Blog</Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="font-bold hover:bg-primary/5 hover:text-primary transition-all">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="font-bold shadow-lg shadow-primary/10 hover:scale-105 transition-all">
                Start Free Trial
              </Button>
            </Link>
          </div>
          
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-background border-b shadow-xl p-6 flex flex-col gap-4 z-40"
        >
          <Link href="#features" className="text-lg font-bold p-2" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link href="#how-it-works" className="text-lg font-bold p-2" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
          <Link href="#pricing" className="text-lg font-bold p-2" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link href="/blog" className="text-lg font-bold p-2" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
          <hr />
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full h-12 font-bold">Log In</Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-12 font-bold">Start Free Trial</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
