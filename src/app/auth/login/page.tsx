'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/providers/AuthProvider';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useGSAP(() => {
    gsap.fromTo('.auth-el',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
    );
  }, { scope: containerRef });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await loginWithEmail(data.email, data.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.1)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E50914]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="auth-el text-center mb-10">
          <Link href="/">
            <h1 className="font-heading text-4xl font-black tracking-tighter text-white">
              NIYUSUKI<span className="text-[#E50914]">.</span>
            </h1>
          </Link>
          <p className="text-neutral-400 mt-2 text-sm tracking-widest uppercase">Enter the Arena</p>
        </div>

        <div className="auth-el bg-[#0a0a0a] border border-white/10 p-8">
          <h2 className="auth-el text-xl font-heading font-bold text-white uppercase tracking-wider mb-8">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="auth-el">
              <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#E50914]/60 transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-[#E50914] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="auth-el">
              <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-2">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#E50914]/60 transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[#E50914] text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="auth-el">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#E50914] text-white font-bold tracking-widest uppercase text-sm hover:bg-[#b8000b] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="auth-el flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-neutral-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={() => loginWithGoogle()}
            className="auth-el w-full py-4 bg-white/5 border border-white/10 text-white font-medium tracking-wider text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-el text-center text-neutral-500 text-sm mt-6">
            No account?{' '}
            <Link href="/auth/register" className="text-[#E50914] hover:text-white transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
