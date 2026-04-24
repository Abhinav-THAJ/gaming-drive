'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  watchAllActiveSessions, watchSystems, getSystems, getAllUsers, watchBookingsForDate,
  startSession, endSession, extendSession, blockSystem, updateBookingStatus,
  System, Booking, Session, User
} from '@/lib/db';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Play, Square, Zap, Lock, Unlock, Users, Calendar,
  TrendingUp, Clock, ChevronRight, RefreshCw, Loader2, Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

function LiveTimer({ endTime }: { endTime: number }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const calc = () => setLeft(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [endTime]);
  const m = Math.floor(left / 60), s = left % 60;
  return <span className={clsx('font-mono font-bold', left < 300 ? 'text-[#E50914] animate-pulse' : 'text-white')}>
    {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
  </span>;
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [systems, setSystems] = useState<System[]>([]);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Guard: admin only
  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (profile && profile.role !== 'admin') { router.push('/dashboard'); return; }
  }, [user, profile, router]);

  useEffect(() => {
    const unsub1 = watchSystems(setSystems);
    const unsub2 = watchAllActiveSessions(setSessions);
    return () => { unsub1(); unsub2(); };
  }, []);

  useEffect(() => {
    const unsub = watchBookingsForDate(selectedDate, setBookings);
    getAllUsers().then(setUsers);
    return unsub;
  }, [selectedDate]);

  useGSAP(() => {
    gsap.fromTo('.admin-el', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out' });
  }, { scope: containerRef });

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const activeCount = Object.values(sessions).filter(s => s.isActive).length;
  const todayRevenue = bookings.filter(b => ['confirmed', 'active', 'completed'].includes(b.status))
    .reduce((acc, b) => acc + (b.paymentAmount || 0), 0);

  const handleStart = async (booking: Booking) => {
    setLoading(booking.id);
    try {
      await startSession(booking);
      toast.success(`Session started for ${booking.systemName}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(null); }
  };

  const handleStop = async (bookingId: string, systemId: string) => {
    setLoading(bookingId);
    try {
      await endSession(bookingId, systemId);
      toast.success('Session ended');
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(null); }
  };

  const handleExtend = async (bookingId: string, systemId: string) => {
    setLoading(`ext-${bookingId}`);
    try {
      await extendSession(bookingId, systemId, 60);
      toast.success('Extended by 1 hour');
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(null); }
  };

  const handleBlock = async (system: System) => {
    const block = system.status !== 'blocked';
    await blockSystem(system.id, block);
    toast.success(`${system.name} ${block ? 'blocked' : 'unblocked'}`);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">

        {/* Header */}
        <div className="admin-el mb-10 flex items-center justify-between border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[#E50914] text-xs font-bold uppercase tracking-widest mb-2">
              <Shield size={14} /> Admin Control Panel
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Command <span className="text-[#E50914]">Center</span>
            </h1>
          </div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-white/5 border border-white/10 text-white px-4 py-2 text-sm focus:outline-none focus:border-[#E50914]/50" />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Active Sessions', value: activeCount, icon: <Play size={18} />, color: '#E50914' },
            { label: "Today's Bookings", value: bookings.length, icon: <Calendar size={18} />, color: '#3b82f6' },
            { label: "Today's Revenue", value: `₹${todayRevenue}`, icon: <TrendingUp size={18} />, color: '#22c55e' },
            { label: 'Total Members', value: users.length, icon: <Users size={18} />, color: '#a855f7' },
          ].map(stat => (
            <div key={stat.label} className="admin-el bg-[#0a0a0a] border border-white/10 p-6">
              <div className="mb-3" style={{ color: stat.color }}>{stat.icon}</div>
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-white font-heading font-bold text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* Systems Control */}
          <div className="xl:col-span-2">
            <h2 className="admin-el text-white font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-4 mb-6">
              System Management
            </h2>
            <div className="space-y-3">
              {systems.map(system => {
                const sysSession = Object.values(sessions).find(s => s.systemId === system.id && s.isActive);
                const sysBooking = confirmedBookings.find(b => b.systemId === system.id);

                return (
                  <div key={system.id} className="admin-el bg-[#0a0a0a] border border-white/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={clsx('w-3 h-3 rounded-full',
                        sysSession ? 'bg-[#E50914] animate-pulse shadow-[0_0_8px_rgba(229,9,20,0.8)]' :
                        system.status === 'available' ? 'bg-emerald-500' :
                        system.status === 'blocked' ? 'bg-yellow-500' : 'bg-neutral-500'
                      )} />
                      <div>
                        <p className="text-white font-bold">{system.name}</p>
                        <p className="text-neutral-500 text-xs uppercase">
                          {system.type} · ₹{system.pricePerHour}/hr
                          {(sysSession || sysBooking) && (
                            <span className="ml-2 text-[#E50914] font-bold">
                              · {sysSession ? confirmedBookings.find(b => b.id === sysSession.bookingId)?.userName : sysBooking?.userName}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {sysSession && (
                        <div className="text-sm text-neutral-300 mr-2">
                          <LiveTimer endTime={sysSession.endTime} />
                        </div>
                      )}

                      {sysSession ? (
                        <>
                          <button onClick={() => handleExtend(sysSession.bookingId, system.id)}
                            disabled={loading === `ext-${sysSession.bookingId}`}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-1">
                            {loading === `ext-${sysSession.bookingId}` ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Extend 60min
                          </button>
                          <button onClick={() => handleStop(sysSession.bookingId, system.id)}
                            disabled={loading === sysSession.bookingId}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-[#E50914]/30 text-[#E50914] hover:bg-[#E50914]/10 transition-colors flex items-center gap-1">
                            {loading === sysSession.bookingId ? <Loader2 size={12} className="animate-spin" /> : <Square size={12} />} End Session
                          </button>
                        </>
                      ) : sysBooking ? (
                        <button onClick={() => handleStart(sysBooking)}
                          disabled={loading === sysBooking.id}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-1">
                          {loading === sysBooking.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Start Session
                        </button>
                      ) : null}

                      <button onClick={() => handleBlock(system)}
                        className={clsx('px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors flex items-center gap-1',
                          system.status === 'blocked'
                            ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10'
                            : 'border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-400'
                        )}>
                        {system.status === 'blocked' ? <><Unlock size={12} /> Unblock</> : <><Lock size={12} /> Block</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-1 space-y-8">

            {/* Today's Bookings */}
            <div>
              <h2 className="admin-el text-white font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-4 mb-4">
                Today's Queue
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {bookings.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No bookings for this date</p>
                ) : bookings.map(b => (
                  <div key={b.id} className="admin-el bg-[#0a0a0a] border border-white/10 p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white text-sm font-medium">{b.systemName}</p>
                      <p className="text-neutral-500 text-xs">{b.userName} · {b.startSlot}–{b.endSlot}</p>
                    </div>
                    <span className={clsx('text-[10px] font-bold px-2 py-1 uppercase',
                      b.status === 'active' ? 'bg-[#E50914]/20 text-[#E50914]' :
                      b.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-neutral-500/20 text-neutral-400'
                    )}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Users */}
            <div>
              <h2 className="admin-el text-white font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-4 mb-4">
                Members ({users.length})
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {users.slice(0, 10).map(u => (
                  <div key={u.uid} className="admin-el bg-[#0a0a0a] border border-white/10 p-3 flex justify-between items-center">
                    <div>
                      <p className="text-white text-sm font-medium">{u.name}</p>
                      <p className="text-neutral-500 text-xs">{u.totalHours || 0}h · {u.points || 0} pts</p>
                    </div>
                    <span className="text-xs uppercase text-[#E50914] font-bold">{u.membershipTier}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
