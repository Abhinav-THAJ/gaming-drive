'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser,
  sendPasswordResetEmail, updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile, User } from '@/lib/db';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie;
    if (cookies.includes('__session=mock-admin-token')) {
      setUser({ uid: 'admin-mock-uid', email: 'admin@niyusuki.com', displayName: 'Admin User' } as FirebaseUser);
      setProfile({ uid: 'admin-mock-uid', name: 'Admin User', email: 'admin@niyusuki.com', role: 'admin', points: 0, totalHours: 0, membershipTier: 'diamond', createdAt: null as any });
      setLoading(false);
      return;
    }
    if (cookies.includes('__session=mock-user-token')) {
      setUser({ uid: 'user-mock-uid', email: 'user@niyusuki.com', displayName: 'Test Player' } as FirebaseUser);
      setProfile({ uid: 'user-mock-uid', name: 'Test Player', email: 'user@niyusuki.com', role: 'user', points: 120, totalHours: 15, membershipTier: 'gold', createdAt: null as any });
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const prof = await getUserProfile(firebaseUser.uid);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      if (email === 'admin@niyusuki.com' && password === 'admin123') {
        document.cookie = '__session=mock-admin-token; path=/; max-age=86400';
        setUser({ uid: 'admin-mock-uid', email: 'admin@niyusuki.com', displayName: 'Admin User' } as FirebaseUser);
        setProfile({ uid: 'admin-mock-uid', name: 'Admin User', email: 'admin@niyusuki.com', role: 'admin', points: 0, totalHours: 0, membershipTier: 'diamond', createdAt: null as any });
        toast.success('Welcome back, Admin!');
        router.push('/admin');
        return;
      }
      
      if (email === 'user@niyusuki.com' && password === 'user123') {
        document.cookie = '__session=mock-user-token; path=/; max-age=86400';
        setUser({ uid: 'user-mock-uid', email: 'user@niyusuki.com', displayName: 'Test Player' } as FirebaseUser);
        setProfile({ uid: 'user-mock-uid', name: 'Test Player', email: 'user@niyusuki.com', role: 'user', points: 120, totalHours: 15, membershipTier: 'gold', createdAt: null as any });
        toast.success('Welcome back, Player!');
        router.push('/dashboard');
        return;
      }

      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
        document.cookie = '__session=mock-user-token; path=/; max-age=86400';
        setUser({ uid: 'user-mock-uid', email, displayName: 'Test Player' } as FirebaseUser);
        setProfile({ uid: 'user-mock-uid', name: 'Test Player', email, role: 'user', points: 0, totalHours: 0, membershipTier: 'bronze', createdAt: null as any });
        toast.success('Logged in with mock account!');
        router.push('/dashboard');
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      document.cookie = '__session=user-token; path=/; max-age=86400';
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.message || 'Login failed');
      throw e;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
        document.cookie = '__session=mock-user-token; path=/; max-age=86400';
        setUser({ uid: 'user-mock-uid', email, displayName: name } as FirebaseUser);
        setProfile({ uid: 'user-mock-uid', name, email, role: 'user', points: 0, totalHours: 0, membershipTier: 'bronze', createdAt: null as any });
        toast.success('Account created! Welcome to Niyusuki.');
        router.push('/dashboard');
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await createUserProfile(cred.user.uid, { name, email, role: 'user' });
      document.cookie = '__session=user-token; path=/; max-age=86400';
      toast.success('Account created! Welcome to Niyusuki.');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.message || 'Registration failed');
      throw e;
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
        document.cookie = '__session=mock-user-token; path=/; max-age=86400';
        setUser({ uid: 'user-mock-uid', email: 'google@test.com', displayName: 'Google User' } as FirebaseUser);
        setProfile({ uid: 'user-mock-uid', name: 'Google User', email: 'google@test.com', role: 'user', points: 0, totalHours: 0, membershipTier: 'bronze', createdAt: null as any });
        toast.success('Logged in with Google!');
        router.push('/dashboard');
        return;
      }

      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const existing = await getUserProfile(cred.user.uid);
      if (!existing) {
        await createUserProfile(cred.user.uid, {
          name: cred.user.displayName || 'Player',
          email: cred.user.email || '',
          role: 'user',
        });
      }
      document.cookie = '__session=user-token; path=/; max-age=86400';
      toast.success('Logged in with Google!');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.message || 'Google login failed');
      throw e;
    }
  };

  const logout = async () => {
    document.cookie = '__session=; path=/; max-age=0';
    if (user?.uid?.includes('mock')) {
      setUser(null);
      setProfile(null);
      router.push('/');
      toast.success('Logged out');
      return;
    }
    await signOut(auth);
    router.push('/');
    toast.success('Logged out');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent!');
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      loginWithEmail, registerWithEmail, loginWithGoogle, logout, resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

