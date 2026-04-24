'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { watchUserBookings, watchSession, extendSession, Booking, Session } from '@/lib/db';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, Trophy, History, Zap, AlertTriangle, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

function CountdownTimer({ session }: { session: Session }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calc = () => {
      const remaining = Math.max(0, session.endTime - Date.now());
      setTimeLeft(Math.floor(remaining / 1000));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [session.endTime]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const isWarning = timeLeft < 300;

  return (
    <div className={clsx(
      'font-mono text-6xl md:text-8xl font-black tracking-tighter',
      isWarning ? 'text-[#E50914] animate-pulse' : 'text-white'
    )}>
      {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
    </div>
  );
}

export default function UserDashboard() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [extending, setExtending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const unsub = watchUserBookings(user.uid, (bkgs) => {
      setBookings(bkgs);
      const active = bkgs.find(b => b.status === 'active');
      setActiveBooking(active || null);
    });
    return unsub;
  }, [user, router]);

  // Watch active session in real-time
  useEffect(() => {
    if (!activeBooking) { setActiveSession(null); return; }
    return watchSession(activeBooking.id, setActiveSession);
  }, [activeBooking?.id]);

  useGSAP(() => {
    gsap.fromTo('.dash-el', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
  }, { scope: containerRef, dependencies: [bookings] });

  const handleExtend = async () => {
    if (!activeBooking || !activeSession) return;
    setExtending(true);
    try {
      await extendSession(activeBooking.id, activeBooking.systemId, 60);
      toast.success('Session extended by 1 hour!');
    } catch {
      toast.error('Could not extend. Next slot may be taken.');
    } finally {
      setExtending(false);
    }
  };

  const tierColors: Record<string, string> = {
    bronze: '#cd7f32', silver: '#C0C0C0', gold: '#FFD700', diamond: '#b9f2ff'
  };

  if (!user) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">

        {/* Header */}
        <div className="dash-el mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-8">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Hey, <span className="text-[#E50914]">{profile?.name?.split(' ')[0] || 'Player'}</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs uppercase tracking-widest font-bold px-3 py-1 border"
                style={{ color: tierColors[profile?.membershipTier || 'bronze'], borderColor: tierColors[profile?.membershipTier || 'bronze'] + '40' }}>
                {profile?.membershipTier || 'Bronze'} Tier
              </span>
              <span className="text-neutral-500 text-xs">{profile?.points || 0} pts</span>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-neutral-400 hover:text-white text-xs uppercase tracking-widest transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Active Session Card */}
        {activeSession && activeBooking ? (
          <div className="dash-el mb-10 relative bg-[#0a0a0a] border border-[#E50914]/30 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#E50914] shadow-[0_0_30px_rgba(229,9,20,0.8)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#E50914]/10 to-transparent pointer-events-none" />

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <div className="flex items-center gap-2 text-[#E50914] text-xs font-bold uppercase tracking-widest mb-4 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#E50914]" /> Live Session
                </div>
                <h2 className="font-heading text-3xl font-bold text-white uppercase">{activeBooking.systemName}</h2>
                <p className="text-neutral-400 mt-1 text-sm">{activeBooking.startSlot} – {activeBooking.endSlot}</p>

                <button
                  onClick={handleExtend}
                  disabled={extending}
                  className="mt-6 flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white text-sm font-bold uppercase tracking-widest hover:bg-[#E50914] hover:border-[#E50914] transition-colors"
                >
                  {extending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  Extend +1 Hour
                </button>
              </div>

              <div className="flex flex-col items-center md:items-end">
                <CountdownTimer session={activeSession} />
                <span className="text-neutral-500 text-xs uppercase tracking-widest mt-2">Time Remaining</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="dash-el mb-10 bg-[#0a0a0a] border border-white/10 p-8 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">No Active Session</h3>
              <p className="text-neutral-400 text-sm mt-1">Book a slot and we'll sync your timer here in real-time.</p>
            </div>
            <a href="/booking" className="flex items-center gap-2 px-6 py-3 bg-[#E50914] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#b8000b] transition-colors">
              Book Now <ChevronRight size={16} />
            </a>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Hours', value: `${profile?.totalHours || 0}h`, icon: <Clock size={18} /> },
            { label: 'Loyalty Points', value: `${profile?.points || 0}`, icon: <Trophy size={18} /> },
            { label: 'Total Bookings', value: `${bookings.length}`, icon: <History size={18} /> },
            { label: 'Membership', value: profile?.membershipTier?.toUpperCase() || 'BRONZE', icon: <Zap size={18} /> },
          ].map(stat => (
            <div key={stat.label} className="dash-el bg-[#0a0a0a] border border-white/10 p-6">
              <div className="text-[#E50914] mb-3">{stat.icon}</div>
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-white font-heading font-bold text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Bookings History */}
        <div className="dash-el">
          <h2 className="text-white font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-4 mb-6">Booking History</h2>
          <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden">
            {bookings.length === 0 ? (
              <div className="p-12 text-center text-neutral-500">No bookings yet. Book your first session!</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-widest text-neutral-400">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">System</th>
                    <th className="p-4 hidden md:table-cell">Time</th>
                    <th className="p-4 hidden md:table-cell">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-neutral-300">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">{b.date}</td>
                      <td className="p-4 text-white font-medium">{b.systemName}</td>
                      <td className="p-4 hidden md:table-cell">{b.startSlot} – {b.endSlot}</td>
                      <td className="p-4 hidden md:table-cell">₹{b.paymentAmount}</td>
                      <td className="p-4">
                        <span className={clsx('text-xs font-bold uppercase px-2 py-1',
                          b.status === 'active' ? 'bg-[#E50914]/20 text-[#E50914]' :
                          b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          b.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-500/20 text-neutral-400'
                        )}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
