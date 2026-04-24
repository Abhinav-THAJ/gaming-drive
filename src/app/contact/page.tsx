'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, MessageCircle, Clock, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.contact-header', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    gsap.fromTo('.contact-grid > *',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }
      }
    );
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending (connect to email API in production)
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Message sent! We'll get back within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] pt-32 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 max-w-6xl relative z-10">

        <div className="contact-header mb-20">
          <h1 className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            Get In <span className="text-[#E50914]">Touch</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl">Questions, partnerships, or just want to know more? We're here.</p>
        </div>

        <div className="contact-grid grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left: Info */}
          <div className="space-y-8">
            {[
              { icon: <MapPin size={20} />, label: 'Location', value: '123 Gaming Street, Cyber City — CC 10293' },
              { icon: <Phone size={20} />, label: 'Phone', value: '+1 (555) 123-4567' },
              { icon: <Mail size={20} />, label: 'Email', value: 'hello@niyusuki.com' },
              { icon: <Clock size={20} />, label: 'Hours', value: 'Mon–Sun: 10:00 AM – 11:00 PM' },
            ].map(info => (
              <div key={info.label} className="flex items-start gap-5 group">
                <div className="w-12 h-12 border border-white/10 bg-[#0a0a0a] flex items-center justify-center text-[#E50914] shrink-0 group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                  {info.icon}
                </div>
                <div>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">{info.label}</p>
                  <p className="text-white">{info.value}</p>
                </div>
              </div>
            ))}

            <div className="pt-4 flex gap-4">
              <a href="https://wa.me/15551234567" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 border border-[#25D366]/30 text-[#25D366] text-sm font-bold uppercase tracking-widest hover:bg-[#25D366]/10 transition-colors">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 border border-white/10 text-white text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                Instagram
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-[#0a0a0a] border border-white/10 p-8">
            <h2 className="font-heading text-2xl font-bold text-white uppercase tracking-tighter mb-8">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: 'Your Name', key: 'name', type: 'text' },
                { label: 'Email Address', key: 'email', type: 'email' },
                { label: 'Subject', key: 'subject', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#E50914]/60 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-2">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#E50914]/60 transition-colors resize-none"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-[#E50914] text-white font-bold tracking-widest uppercase text-sm hover:bg-[#b8000b] transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Message <ChevronRight size={16} /></>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
