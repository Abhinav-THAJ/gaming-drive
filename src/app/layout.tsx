import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  title: 'Niyusuki Sim Racers | Premium Gaming Center',
  description: 'Experience the ultimate luxury gaming center. Book PCs, PS5s, VR, and Driving Simulators with ultra-premium setups.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased bg-[#050505] text-white">
        <AuthProvider>
          <SmoothScrollProvider>
            <Navbar />
            <main className="min-h-screen pt-20">
              {children}
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#111',
                  color: '#fff',
                  border: '1px solid rgba(229,9,20,0.3)',
                  borderRadius: 0,
                  fontFamily: 'var(--font-outfit)',
                },
                success: { iconTheme: { primary: '#E50914', secondary: '#fff' } },
              }}
            />
          </SmoothScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
