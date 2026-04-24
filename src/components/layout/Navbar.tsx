'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { Menu, X, User, ChevronDown, Trophy, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/components/providers/AuthProvider';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Book Now', href: '/booking' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const { user, profile, logout } = useAuth();

  // Navbar scroll transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        gsap.to(navRef.current, { backgroundColor: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)', duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.to(navRef.current, { backgroundColor: 'transparent', backdropFilter: 'blur(0px)', duration: 0.3, ease: 'power2.out' });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile menu animation
  useEffect(() => {
    if (!menuRef.current) return;
    if (isOpen) {
      gsap.to(menuRef.current, { clipPath: 'circle(150% at 95% 5%)', duration: 0.8, ease: 'power4.inOut' });
      gsap.fromTo(linksRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.35, ease: 'power3.out' });
    } else {
      gsap.to(menuRef.current, { clipPath: 'circle(0% at 95% 5%)', duration: 0.6, ease: 'power3.inOut' });
    }
  }, [isOpen]);

  const addToRefs = (el: HTMLAnchorElement | null) => {
    if (el && !linksRef.current.includes(el)) linksRef.current.push(el);
  };

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 transition-colors border-b border-white/0">
        {/* Logo */}
        <Link href="/" className="relative z-50 group flex-shrink-0">
          <h1 className="font-heading text-2xl font-bold tracking-tighter text-white">
            NIYUSUKI<span className="text-[#E50914]">.</span>
          </h1>
          <div className="absolute -inset-2 bg-[#E50914]/15 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {profile?.role === 'admin' ? (
            <Link href="/admin"
              className={clsx('relative text-xs uppercase tracking-widest font-medium transition-colors hover:text-white group',
                pathname === '/admin' ? 'text-[#E50914]' : 'text-neutral-400')}>
              Admin Panel
              <span className={clsx('absolute -bottom-1 left-0 h-[2px] bg-[#E50914] transition-all duration-300',
                pathname === '/admin' ? 'w-full' : 'w-0 group-hover:w-full')} />
            </Link>
          ) : (
            NAV_LINKS.map(link => (
              <Link key={link.name} href={link.href}
                className={clsx('relative text-xs uppercase tracking-widest font-medium transition-colors hover:text-white group',
                  pathname === link.href ? 'text-white' : 'text-neutral-400')}>
                {link.name}
                <span className={clsx('absolute -bottom-1 left-0 h-[2px] bg-[#E50914] transition-all duration-300',
                  pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full')} />
              </Link>
            ))
          )}
        </div>

        {/* Right Section */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-full border border-[#E50914]/40 bg-[#E50914]/10 flex items-center justify-center font-bold text-xs text-[#E50914]">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs uppercase tracking-widest">{profile?.name?.split(' ')[0] || 'Player'}</span>
                <ChevronDown size={14} className={clsx('transition-transform', userMenuOpen ? 'rotate-180' : '')} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 bg-[#0a0a0a] border border-white/10 shadow-2xl py-2 z-50">
                  {profile?.role === 'admin' ? (
                    <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[#E50914] hover:bg-[#E50914]/10 transition-colors text-xs uppercase tracking-widest">
                      <Settings size={14} /> Admin Panel
                    </Link>
                  ) : (
                    <>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors text-xs uppercase tracking-widest">
                        <User size={14} /> Dashboard
                      </Link>
                      <Link href="/leaderboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors text-xs uppercase tracking-widest">
                        <Trophy size={14} /> Leaderboard
                      </Link>
                    </>
                  )}
                  <hr className="border-white/10 my-2" />
                  <button onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-xs uppercase tracking-widest">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="flex items-center gap-2 text-xs text-neutral-300 hover:text-white transition-colors uppercase tracking-widest">
              <User size={16} /> Login
            </Link>
          )}
          
          {profile?.role !== 'admin' && (
            <Link href="/booking"
              className="group relative px-6 py-2.5 bg-[#E50914] text-white text-xs font-bold tracking-widest uppercase overflow-hidden">
              <span className="relative z-10">Book Now</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="absolute -inset-1 bg-[#E50914] blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300 z-0" />
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden relative z-50 text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <div ref={menuRef} className="fixed inset-0 z-40 bg-[#070707] flex flex-col justify-center items-center gap-6"
        style={{ clipPath: 'circle(0% at 95% 5%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        {profile?.role === 'admin' ? (
          <Link href="/admin" ref={addToRefs} onClick={() => setIsOpen(false)}
            className="text-4xl md:text-6xl font-heading font-black tracking-tighter text-[#E50914] uppercase hover:text-white transition-colors">
            Admin Panel
          </Link>
        ) : (
          NAV_LINKS.map(link => (
            <Link key={link.name} href={link.href} ref={addToRefs}
              onClick={() => setIsOpen(false)}
              className="text-4xl md:text-6xl font-heading font-black tracking-tighter text-white uppercase hover:text-[#E50914] transition-colors">
              {link.name}
            </Link>
          ))
        )}

        <div className="flex flex-col gap-4 mt-8 w-full max-w-xs px-6">
          {user ? (
            <button onClick={() => { logout(); setIsOpen(false); }}
              className="w-full py-4 text-center border border-white/10 text-white font-bold tracking-widest uppercase text-sm hover:bg-white/5 transition-colors">
              Sign Out
            </button>
          ) : (
            <Link href="/auth/login" onClick={() => setIsOpen(false)}
              className="w-full py-4 text-center border border-white/10 text-white font-bold tracking-widest uppercase text-sm">
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
