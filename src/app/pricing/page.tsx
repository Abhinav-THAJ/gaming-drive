'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Zap, Crown, Star } from 'lucide-react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const PLANS = [
  {
    name: 'Drop-In',
    tag: 'Pay as you go',
    icon: <Zap size={24} />,
    prices: { PC: '₹100', PS5: '₹150', VR: '₹200', SIM: '₹250' },
    features: ['1-Hour fixed slots', 'Extend if available', 'No commitment', 'All systems available'],
    cta: 'Book Now',
    href: '/booking',
    highlight: false,
  },
  {
    name: 'Elite',
    tag: 'Best Value',
    icon: <Star size={24} />,
    price: '₹1,999 / mo',
    features: ['10 hours / month', '10% loyalty bonus', 'Priority booking', 'Access all systems', 'Monthly leaderboard badge'],
    cta: 'Go Elite',
    href: '/auth/register',
    highlight: true,
  },
  {
    name: 'Pro Racer',
    tag: 'For Serious Sim Racers',
    icon: <Crown size={24} />,
    price: '₹4,999 / mo',
    features: ['Unlimited PC + SIM hours', 'Reserved time slot', 'Diamond tier status', 'Free session extension × 2/mo', 'Personal stats tracking'],
    cta: 'Go Pro',
    href: '/auth/register',
    highlight: false,
  },
];

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.pricing-header', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
    gsap.fromTo('.plan-card',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.plans-grid', start: 'top 80%' }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] pt-32 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.07)_0%,transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 max-w-6xl relative z-10">
        <div className="pricing-header text-center mb-20">
          <h1 className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">
            Choose Your <span className="text-[#E50914]">Level</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Whether you drop in for a quick session or train like a pro — we have a plan that fits your grind.
          </p>
        </div>

        <div className="plans-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`plan-card relative border p-8 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'border-[#E50914] bg-[#E50914]/5 shadow-[0_0_60px_rgba(229,9,20,0.2)]'
                  : 'border-white/10 bg-[#0a0a0a] hover:border-white/30'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent" />
              )}
              {plan.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E50914] text-white text-xs font-bold uppercase tracking-widest px-4 py-1">
                  Most Popular
                </span>
              )}

              <div className={`mb-6 ${plan.highlight ? 'text-[#E50914]' : 'text-white'}`}>{plan.icon}</div>
              <p className="text-neutral-400 text-xs uppercase tracking-widest mb-2">{plan.tag}</p>
              <h2 className="font-heading text-3xl font-black text-white uppercase tracking-tighter mb-4">{plan.name}</h2>

              {plan.price ? (
                <p className="text-4xl font-black text-white mb-1">{plan.price}</p>
              ) : (
                <div className="mb-1">
                  {Object.entries(plan.prices!).map(([k, v]) => (
                    <p key={k} className="text-sm text-neutral-300">{k}: <span className="text-white font-bold">{v}/hr</span></p>
                  ))}
                </div>
              )}

              <ul className="mt-8 mb-10 space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-neutral-300">
                    <Check size={14} className={plan.highlight ? 'text-[#E50914]' : 'text-white'} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-4 text-center font-bold tracking-widest uppercase text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-[#E50914] text-white hover:bg-[#b8000b]'
                    : 'border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
