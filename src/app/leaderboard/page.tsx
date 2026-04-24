'use client';

import { useState, useEffect, useRef } from 'react';
import { getLeaderboard, User } from '@/lib/db';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, Zap, Clock } from 'lucide-react';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const TIER_COLORS: Record<string, string> = {
  diamond: '#b9f2ff', gold: '#FFD700', silver: '#C0C0C0', bronze: '#cd7f32'
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getLeaderboard().then(data => { setLeaders(data); setLoading(false); });
  }, []);

  useGSAP(() => {
    gsap.fromTo('.lb-header', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
    gsap.fromTo('.lb-row',
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.lb-table', start: 'top 80%' }
      }
    );
  }, { scope: containerRef, dependencies: [leaders] });

  const podiumOrder = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] pt-32 pb-24 relative overflow-hidden">
      {/* BG Image */}
      <div className="absolute inset-0 z-0 opacity-15">
        <Image src="/leaderboard_bg.png" alt="" fill className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505] pointer-events-none z-0" />

      <div className="container mx-auto px-6 md:px-12 max-w-5xl relative z-10">

        <div className="lb-header text-center mb-20">
          <div className="flex items-center justify-center gap-2 text-[#E50914] text-xs font-bold uppercase tracking-widest mb-6">
            <Trophy size={14} /> Season 1 Leaderboard
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            Elite <span className="text-[#E50914]">Racers</span>
          </h1>
          <p className="text-neutral-400 max-w-md mx-auto">Ranked by total hours on the rig. Every session counts.</p>
        </div>

        {/* Top 3 Podium */}
        {!loading && podiumOrder.length === 3 && (
          <div className="flex items-end justify-center gap-4 mb-16">
            {[podiumOrder[1], podiumOrder[0], podiumOrder[2]].map((u, idx) => {
              const rank = [2, 1, 3][idx];
              const heights = ['h-36', 'h-48', 'h-32'];
              const sizes = ['text-xl', 'text-3xl', 'text-xl'];
              return (
                <div key={u.uid} className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center font-heading font-black text-xl"
                    style={{ borderColor: TIER_COLORS[u.membershipTier], color: TIER_COLORS[u.membershipTier] }}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-bold text-sm text-center max-w-[80px] truncate">{u.name}</p>
                  <div className={`w-24 ${heights[idx]} bg-gradient-to-t from-white/5 to-white/10 border border-white/10 flex items-center justify-center`}>
                    <span className={`font-heading font-black ${sizes[idx]} text-white`}>#{rank}</span>
                  </div>
                  <p className="text-[#E50914] font-bold text-sm">{u.totalHours}h</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Table */}
        <div className="lb-table bg-[#0a0a0a] border border-white/10 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs uppercase tracking-widest text-neutral-500">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 hidden md:block">Tier</div>
            <div className="col-span-2 hidden md:block">Points</div>
            <div className="col-span-2 md:col-span-2">Hours</div>
          </div>

          {loading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="p-4 border-b border-white/5 animate-pulse">
                <div className="h-5 bg-white/5 rounded" />
              </div>
            ))
          ) : leaders.map((u, i) => (
            <div key={u.uid}
              className="lb-row grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center">
              <div className="col-span-1">
                <span className={`font-heading font-black ${i < 3 ? 'text-[#E50914]' : 'text-neutral-400'}`}>#{i + 1}</span>
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ borderColor: TIER_COLORS[u.membershipTier] + '60', color: TIER_COLORS[u.membershipTier] }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium text-sm truncate">{u.name}</span>
              </div>
              <div className="col-span-2 hidden md:block">
                <span className="text-xs uppercase font-bold" style={{ color: TIER_COLORS[u.membershipTier] }}>{u.membershipTier}</span>
              </div>
              <div className="col-span-2 hidden md:block text-neutral-300 text-sm">{u.points}</div>
              <div className="col-span-2 text-white font-bold text-sm flex items-center gap-1">
                <Clock size={12} className="text-[#E50914]" /> {u.totalHours}h
              </div>
            </div>
          ))}

          {!loading && leaders.length === 0 && (
            <div className="p-12 text-center text-neutral-500">
              No rankings yet. Be the first to hit the rig!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
