'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!footerRef.current || !contentRef.current) return;

    gsap.fromTo(
      contentRef.current.children,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
        },
      }
    );
  }, { scope: footerRef });

  return (
    <footer ref={footerRef} className="relative bg-[#050505] pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Top Gradient Separator */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E50914]/50 to-transparent" />
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-[#E50914]/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Section */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <h2 className="font-heading text-3xl font-bold tracking-tighter text-white">
                NIYUSUKI<span className="text-[#E50914]">.</span>
              </h2>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              The ultimate premium gaming center. Experience top-tier simulation racing, VR, and high-end console gaming in a luxury environment.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              {['Booking', 'Pricing', 'Gaming Setup', 'About Us', 'Leaderboard'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center group">
                    <span className="relative overflow-hidden">
                      {item}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#E50914] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm">Contact</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-neutral-400 text-sm group">
                <MapPin className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>123 Gaming Street, Cyber City, CC 10293</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm group">
                <Phone className="w-5 h-5 text-[#E50914] shrink-0 group-hover:scale-110 transition-transform" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm group">
                <Mail className="w-5 h-5 text-[#E50914] shrink-0 group-hover:scale-110 transition-transform" />
                <span>hello@niyusuki.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter & Socials */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm">Stay Updated</h3>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors"
              />
              <button className="absolute right-0 top-0 bottom-0 px-4 bg-[#E50914] text-white hover:bg-[#b8000b] transition-colors flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#E50914] hover:border-[#E50914] transition-all duration-300 font-bold text-xs">
                IG
              </a>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-300">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-xs">
            © {new Date().getFullYear()} Niyusuki Sim Racers. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-neutral-500 hover:text-white text-xs transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-neutral-500 hover:text-white text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
