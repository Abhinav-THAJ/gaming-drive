'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { watchSystems, watchBookingsForDate, System, Booking } from '@/lib/db';
import { format, addHours } from 'date-fns';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Monitor, Gamepad2, Headset, ChevronRight, Lock, Calendar, Clock, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

declare global {
  interface Window { Razorpay: any; }
}

function SystemIcon({ type }: { type: string }) {
  if (type === 'PC') return <Monitor className="w-5 h-5" />;
  if (type === 'SIM') return <Gamepad2 className="w-5 h-5" />;
  if (type === 'VR') return <Headset className="w-5 h-5" />;
  return <Gamepad2 className="w-5 h-5" />;
}

export default function BookingPage() {
  const { user, profile } = useAuth();
  const [systems, setSystems] = useState<System[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Real-time systems watch
  useEffect(() => {
    const unsub = watchSystems(setSystems);
    return unsub;
  }, []);

  // Real-time bookings for selected date
  useEffect(() => {
    const unsub = watchBookingsForDate(selectedDate, setBookings);
    return unsub;
  }, [selectedDate]);

  useGSAP(() => {
    gsap.fromTo('.book-header', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    gsap.fromTo('.sys-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.3 });
  }, { scope: containerRef, dependencies: [systems] });

  const isSlotTaken = (systemId: string, slot: string) =>
    bookings.some(b => b.systemId === systemId && b.startSlot === slot);

  const getSystemPrice = (system: System) => system.pricePerHour || 100;

  const handleBook = async () => {
    if (!user || !profile || !selectedSystem || !selectedSlot) return;

    setPaying(true);
    try {
      const endSlot = format(addHours(new Date(`${selectedDate}T${selectedSlot}:00`), 1), 'HH:mm');

      // Simulate network request for booking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Booking confirmed! See you at the arena.');
      setSelectedSlot(null);
      setSelectedSystem(null);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">

        {/* Header */}
        <div className="book-header mb-12">
          <div className="flex items-center gap-2 text-[#E50914] text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" /> Live Availability
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            Book Your <span className="text-[#E50914]">Arena</span>
          </h1>
          <p className="text-neutral-400 max-w-xl">Real-time slot reservations. Slots lock instantly on payment. No double bookings, guaranteed.</p>
        </div>

        {/* Date Selector */}
        <div className="book-header mb-10 flex items-center gap-4">
          <Calendar className="text-[#E50914] w-5 h-5" />
          <input
            type="date"
            value={selectedDate}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-white/5 border border-white/10 text-white px-4 py-2 text-sm focus:outline-none focus:border-[#E50914]/60 transition-colors"
          />
          <span className="text-neutral-500 text-sm">Select date to view live availability</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* Systems Grid */}
          <div className="xl:col-span-2">
            <h2 className="text-white font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#E50914] text-white text-xs flex items-center justify-center">1</span>
              Choose System
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {systems.length === 0 ? (
                // Skeleton loading
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-white/5 border border-white/5 animate-pulse" />
                ))
              ) : systems.map(system => (
                <button
                  key={system.id}
                  disabled={system.status !== 'available'}
                  onClick={() => { setSelectedSystem(system); setSelectedSlot(null); }}
                  className={clsx(
                    'sys-card text-left p-6 border transition-all duration-300 relative group',
                    selectedSystem?.id === system.id
                      ? 'border-[#E50914] bg-[#E50914]/5'
                      : 'border-white/10 bg-[#0a0a0a] hover:border-white/30',
                    system.status !== 'available' && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={clsx('transition-colors', selectedSystem?.id === system.id ? 'text-[#E50914]' : 'text-white')}>
                      <SystemIcon type={system.type} />
                    </div>
                    <span className={clsx('text-[10px] font-bold px-2 py-1 uppercase tracking-wider',
                      system.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                      system.status === 'in-use' ? 'bg-[#E50914]/20 text-[#E50914]' : 'bg-yellow-500/20 text-yellow-500'
                    )}>{system.status}</span>
                  </div>
                  <h3 className="text-white font-bold">{system.name}</h3>
                  <p className="text-neutral-500 text-xs mt-1">₹{system.pricePerHour || 100} / hour</p>
                  {selectedSystem?.id === system.id && (
                    <div className="absolute right-4 bottom-4 w-2 h-2 rounded-full bg-[#E50914]" />
                  )}
                </button>
              ))}
            </div>

            {/* Time Slots Grid */}
            {selectedSystem && (
              <div>
                <h2 className="text-white font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E50914] text-white text-xs flex items-center justify-center">2</span>
                  Select Time Slot — <span className="text-[#E50914]">{selectedSystem.name}</span>
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {TIME_SLOTS.map(slot => {
                    const taken = isSlotTaken(selectedSystem.id, slot);
                    return (
                      <button
                        key={slot}
                        disabled={taken}
                        onClick={() => setSelectedSlot(slot)}
                        className={clsx(
                          'py-4 border text-sm font-bold flex flex-col items-center gap-1 transition-all duration-200',
                          selectedSlot === slot ? 'border-[#E50914] bg-[#E50914] text-white' :
                          taken ? 'border-white/5 bg-white/5 text-neutral-600 cursor-not-allowed' :
                          'border-white/10 text-neutral-300 hover:border-white/30 hover:text-white'
                        )}
                      >
                        {taken && <Lock className="w-3 h-3" />}
                        <span>{slot}</span>
                        {taken && <span className="text-[10px]">Taken</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Summary Panel */}
          <div className="xl:col-span-1">
            <div className="sticky top-28">
              <h2 className="text-white font-bold uppercase tracking-widest text-sm border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E50914] text-white text-xs flex items-center justify-center">3</span>
                Summary
              </h2>

              <div className="bg-[#0a0a0a] border border-white/10 p-6">
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">System</span>
                    <span className="text-white font-medium">{selectedSystem?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Date</span>
                    <span className="text-white font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Time</span>
                    <span className="text-white font-medium">{selectedSlot ? `${selectedSlot} – ${format(addHours(new Date(`${selectedDate}T${selectedSlot}:00`), 1), 'HH:mm')}` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Duration</span>
                    <span className="text-white font-medium">1 Hour</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center mb-6">
                  <span className="text-white font-bold uppercase tracking-widest text-xs">Total</span>
                  <span className="text-3xl font-black text-[#E50914]">₹{selectedSystem ? getSystemPrice(selectedSystem) : '0'}</span>
                </div>

                {!user ? (
                  <a href="/auth/login" className="block w-full py-4 text-center bg-[#E50914] text-white font-bold tracking-widest uppercase text-sm hover:bg-[#b8000b] transition-colors">
                    Login to Book
                  </a>
                ) : (
                  <button
                    onClick={handleBook}
                    disabled={!selectedSystem || !selectedSlot || paying}
                    className="w-full py-4 bg-[#E50914] text-white font-bold tracking-widest uppercase text-sm hover:bg-[#b8000b] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {paying ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Booking <ChevronRight size={16} /></>}
                  </button>
                )}

                <p className="text-neutral-600 text-xs text-center mt-4">Free booking mode enabled</p>
              </div>

              {/* Live Booking Feed */}
              {bookings.length > 0 && (
                <div className="mt-6 bg-[#0a0a0a] border border-white/10 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-[#E50914]" /> Active Bookings Today
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {bookings.slice(0, 8).map(b => (
                      <div key={b.id} className="flex justify-between items-center text-xs text-neutral-400 py-1.5 border-b border-white/5">
                        <span>{b.systemName}</span>
                        <span className="text-white">{b.startSlot}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
