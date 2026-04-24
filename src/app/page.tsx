'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Monitor, Gamepad2, Headset, Zap, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Initial Loader Animation
  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => setLoading(false)
    });

    tl.to('.loader-logo', {
      scale: 1.1,
      textShadow: '0 0 40px rgba(229, 9, 20, 0.8)',
      duration: 1.5,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    })
    .to('.loader-bg', {
      yPercent: -100,
      duration: 1,
      ease: 'power4.inOut'
    }, '+=0.2')
    .fromTo(
      heroTextRef.current?.children ? Array.from(heroTextRef.current.children) : [],
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power4.out' },
      '-=0.5'
    );
  }, { scope: containerRef });

  // Scroll Animations
  useGSAP(() => {
    if (loading) return;

    // Parallax Hero Background
    gsap.to('.hero-bg', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });

    // Showcase Cards Reveal
    const cards = gsap.utils.toArray('.showcase-card');
    cards.forEach((card: any, i) => {
      gsap.fromTo(card, 
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
          }
        }
      );
    });

    // Features Section Scroll
    gsap.fromTo('.feature-text',
      { opacity: 0, x: -50 },
      {
        opacity: 1, x: 0, duration: 1, stagger: 0.2,
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 70%'
        }
      }
    );

  }, { scope: containerRef, dependencies: [loading] });

  return (
    <div ref={containerRef} className="relative bg-brand-black min-h-screen">
      
      {/* Cinematic Loader */}
      {loading && (
        <div className="loader-bg fixed inset-0 z-[100] bg-brand-black flex items-center justify-center">
          <h1 className="loader-logo font-heading text-5xl md:text-7xl font-black tracking-tighter text-white">
            NIYUSUKI<span className="text-[#E50914]">.</span>
          </h1>
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden -mt-20">
        <div className="absolute inset-0 z-0 hero-bg">
          <Image 
            src="/hero_bg.png"
            alt="Sim Racing Background"
            fill
            className="object-cover opacity-40 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.15)_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center" ref={heroTextRef}>
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="text-[#E50914] text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
              Next-Gen Gaming Experience
            </span>
          </div>
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-8 uppercase">
            Redefine<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#E50914]">Reality</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            Immerse yourself in ultra-premium simulation racing, professional esports setups, and next-level VR. Your journey to the top starts here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/booking" className="group relative px-8 py-4 bg-[#E50914] text-white font-bold tracking-widest uppercase overflow-hidden w-full sm:w-auto">
              <span className="relative z-10 flex items-center gap-2 justify-center">
                Book Your Setup <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <Link href="#showcase" className="px-8 py-4 bg-transparent text-white font-bold tracking-widest uppercase border border-white/20 hover:bg-white/5 transition-colors w-full sm:w-auto">
              Explore Systems
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs uppercase tracking-[0.3em] font-medium rotate-90 mb-6">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Systems Showcase */}
      <section id="showcase" ref={showcaseRef} className="py-32 relative z-10 bg-brand-black">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20">
            <div>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                Elite <span className="text-[#E50914]">Arsenal</span>
              </h2>
              <p className="text-neutral-400 max-w-md">Engineered for competitive superiority. We provide zero-compromise hardware for maximum performance.</p>
            </div>
            <Link href="/setup" className="text-white uppercase tracking-widest text-sm font-bold border-b border-[#E50914] pb-1 hover:text-[#E50914] transition-colors hidden md:block">
              View All Specs
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="showcase-card group relative h-[500px] overflow-hidden bg-brand-dark border border-white/5">
              <Image src="/pc_setup.png" alt="Pro PC Gaming" fill className="object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <Monitor className="w-10 h-10 text-[#E50914] mb-4" />
                <h3 className="font-heading text-3xl font-bold text-white uppercase tracking-tight mb-2">10x Pro PCs</h3>
                <p className="text-neutral-400 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">RTX 4090 • 240Hz OLED Monitors • Custom loop cooling.</p>
                <Link href="/booking" className="inline-block border border-white/20 px-6 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors">
                  Book Slot
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="showcase-card group relative h-[500px] overflow-hidden bg-brand-dark border border-white/5 lg:-translate-y-12">
              <Image src="/sim_rig.png" alt="Sim Racing" fill className="object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <Gamepad2 className="w-10 h-10 text-[#E50914] mb-4" />
                <h3 className="font-heading text-3xl font-bold text-white uppercase tracking-tight mb-2">Driving Sim</h3>
                <p className="text-neutral-400 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Direct Drive Wheels • Motion Platforms • Triple 4K setup.</p>
                <Link href="/booking" className="inline-block border border-white/20 px-6 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#E50914] hover:border-[#E50914] transition-colors">
                  Book Slot
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="showcase-card group relative h-[500px] overflow-hidden bg-brand-dark border border-white/5">
              <Image src="/vr_station.png" alt="VR Station" fill className="object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <Headset className="w-10 h-10 text-[#E50914] mb-4" />
                <h3 className="font-heading text-3xl font-bold text-white uppercase tracking-tight mb-2">VR & PS5</h3>
                <p className="text-neutral-400 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Meta Quest 3 • PSVR 2 • 4K HDR TVs.</p>
                <Link href="/booking" className="inline-block border border-white/20 px-6 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors">
                  Book Slot
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Text Section */}
      <section className="features-section py-32 relative bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[500px] h-[500px] bg-[#E50914]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <div className="feature-text text-[#E50914] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Precision Engineered
            </div>
            <h2 className="feature-text font-heading text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-[1.1]">
              Zero Latency.<br/>Infinite Glory.
            </h2>
            <p className="feature-text text-neutral-400 text-lg mb-8 max-w-lg leading-relaxed">
              Every detail in our center is optimized for peak performance. From fiber-optic internet routing to ergonomically perfected seating, we eliminate excuses so you can focus on winning.
            </p>
            <ul className="feature-text space-y-4 mb-10">
              {['Real-time slot locking', 'Seamless 1-hour extensions', 'Live leaderboard integration', 'Pro-grade peripherals'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white">
                  <div className="w-1.5 h-1.5 bg-[#E50914]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full lg:w-1/2 relative h-[600px] bg-brand-dark border border-white/10 rounded-sm overflow-hidden flex items-center justify-center group feature-text">
            {/* Fake Dashboard UI for visual flair */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
            <div className="relative z-10 w-3/4 max-w-md bg-[#050505] border border-white/10 p-6 shadow-2xl box-glow">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <span className="text-white font-heading font-bold">LIVE STATUS</span>
                <span className="flex items-center gap-2 text-xs text-[#E50914] animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#E50914]" /> SYNCED
                </span>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((pc) => (
                  <div key={pc} className="flex justify-between items-center bg-white/5 p-3">
                    <span className="text-sm text-neutral-300">PC Station 0{pc}</span>
                    <span className={pc === 2 ? 'text-[#E50914] text-xs font-bold' : 'text-green-500 text-xs font-bold'}>
                      {pc === 2 ? 'IN USE (14:32)' : 'AVAILABLE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
