// Firestore helper functions
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, runTransaction, serverTimestamp,
  Timestamp, addDoc, limit
} from 'firebase/firestore';
import { ref, onValue, set, update, off } from 'firebase/database';
import { db, rtdb } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SystemType = 'PC' | 'PS5' | 'PS4' | 'VR' | 'SIM';
export type SystemStatus = 'available' | 'in-use' | 'maintenance' | 'blocked';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface System {
  id: string;
  name: string;
  type: SystemType;
  status: SystemStatus;
  pricePerHour: number;
  specs?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  systemId: string;
  systemName: string;
  systemType: SystemType;
  date: string; // YYYY-MM-DD
  startSlot: string; // e.g. "14:00"
  endSlot: string;   // e.g. "15:00"
  status: BookingStatus;
  paymentId?: string;
  paymentAmount: number;
  createdAt: Timestamp;
}

export interface Session {
  bookingId: string;
  userId: string;
  systemId: string;
  startTime: number;   // epoch ms
  endTime: number;     // epoch ms
  isActive: boolean;
  extendedBy: number;  // minutes
}

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  points: number;       // loyalty points
  totalHours: number;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'diamond';
  createdAt: Timestamp;
}

// ─── Systems ──────────────────────────────────────────────────────────────────

const MOCK_SYSTEMS: System[] = [
  { id: 'pc1', name: 'PC Station 01', type: 'PC', status: 'available', pricePerHour: 50 },
  { id: 'pc2', name: 'PC Station 02', type: 'PC', status: 'in-use', pricePerHour: 50 },
  { id: 'sim1', name: 'Pro Sim Rig 1', type: 'SIM', status: 'available', pricePerHour: 120 },
  { id: 'ps5_1', name: 'PS5 Lounge A', type: 'PS5', status: 'available', pricePerHour: 80 },
  { id: 'vr1', name: 'VR Arena 1', type: 'VR', status: 'maintenance', pricePerHour: 100 },
];

export async function getSystems(): Promise<System[]> {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
    return MOCK_SYSTEMS;
  }
  const snap = await getDocs(collection(db, 'systems'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as System));
}

export function watchSystems(cb: (systems: System[]) => void) {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
    cb(MOCK_SYSTEMS);
    return () => {};
  }
  const q = collection(db, 'systems');
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as System)));
  });
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bkg1', userId: 'user1', userName: 'Player 1', userEmail: 'p1@test.com',
    systemId: 'pc2', systemName: 'PC Station 02', systemType: 'PC',
    date: new Date().toISOString().split('T')[0],
    startSlot: '14:00', endSlot: '15:00', status: 'active', paymentAmount: 50,
    createdAt: null as any
  },
  {
    id: 'bkg2', userId: 'user2', userName: 'Player 2', userEmail: 'p2@test.com',
    systemId: 'sim1', systemName: 'Pro Sim Rig 1', systemType: 'SIM',
    date: new Date().toISOString().split('T')[0],
    startSlot: '16:00', endSlot: '17:00', status: 'confirmed', paymentAmount: 120,
    createdAt: null as any
  }
];

export async function getBookingsForDate(date: string): Promise<Booking[]> {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
    return MOCK_BOOKINGS.filter(b => b.date === date);
  }
  const q = query(
    collection(db, 'bookings'),
    where('date', '==', date),
    where('status', 'in', ['confirmed', 'active', 'pending'])
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
}

export function watchBookingsForDate(date: string, cb: (bookings: Booking[]) => void) {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
    cb(MOCK_BOOKINGS.filter(b => b.date === date));
    return () => {};
  }
  const q = query(
    collection(db, 'bookings'),
    where('date', '==', date),
    where('status', 'in', ['confirmed', 'active', 'pending'])
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
  });
}

export function watchUserBookings(userId: string, cb: (bookings: Booking[]) => void) {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
    cb(MOCK_BOOKINGS.filter(b => b.userId === userId));
    return () => {};
  }
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
  });
}

// Atomic booking — prevents double booking with a transaction
export async function createBookingAtomically(booking: Omit<Booking, 'id' | 'createdAt'>) {
  return runTransaction(db, async (tx) => {
    // Check if this slot is already taken
    const conflictQ = query(
      collection(db, 'bookings'),
      where('systemId', '==', booking.systemId),
      where('date', '==', booking.date),
      where('startSlot', '==', booking.startSlot),
      where('status', 'in', ['confirmed', 'active', 'pending'])
    );
    const conflictSnap = await getDocs(conflictQ);
    if (!conflictSnap.empty) {
      throw new Error('SLOT_TAKEN');
    }

    const bookingRef = doc(collection(db, 'bookings'));
    tx.set(bookingRef, {
      ...booking,
      createdAt: serverTimestamp(),
    });
    return bookingRef.id;
  });
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  await updateDoc(doc(db, 'bookings', bookingId), { status });
}

// ─── Sessions (Realtime DB for live timer sync) ───────────────────────────────

export function watchSession(bookingId: string, cb: (session: Session | null) => void) {
  const sessionRef = ref(rtdb, `sessions/${bookingId}`);
  const handler = onValue(sessionRef, (snap) => {
    cb(snap.val() as Session | null);
  });
  return () => off(sessionRef, 'value', handler);
}

export async function startSession(booking: Booking) {
  const now = Date.now();
  const session: Session = {
    bookingId: booking.id,
    userId: booking.userId,
    systemId: booking.systemId,
    startTime: now,
    endTime: now + 60 * 60 * 1000, // 1 hour
    isActive: true,
    extendedBy: 0,
  };
  await set(ref(rtdb, `sessions/${booking.id}`), session);
  await updateBookingStatus(booking.id, 'active');
  await updateDoc(doc(db, 'systems', booking.systemId), { status: 'in-use' });
}

export async function extendSession(bookingId: string, systemId: string, extraMinutes: number = 60) {
  const sessionRef = ref(rtdb, `sessions/${bookingId}`);
  await update(sessionRef, {
    endTime: Date.now() + extraMinutes * 60 * 1000,
    extendedBy: extraMinutes,
  });
}

export async function endSession(bookingId: string, systemId: string) {
  await update(ref(rtdb, `sessions/${bookingId}`), { isActive: false });
  await updateBookingStatus(bookingId, 'completed');
  await updateDoc(doc(db, 'systems', systemId), { status: 'available' });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

const MOCK_USERS: User[] = [
  { uid: 'user1', name: 'Player 1', email: 'p1@test.com', role: 'user', points: 150, totalHours: 12, membershipTier: 'silver', createdAt: null as any },
  { uid: 'user2', name: 'Player 2', email: 'p2@test.com', role: 'user', points: 300, totalHours: 45, membershipTier: 'diamond', createdAt: null as any },
];

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as User) : null;
}

export async function createUserProfile(uid: string, data: Partial<User>) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    role: 'user',
    points: 0,
    totalHours: 0,
    membershipTier: 'bronze',
    createdAt: serverTimestamp(),
    ...data,
  });
}

export async function getAllUsers(): Promise<User[]> {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
    return MOCK_USERS;
  }
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
}

export async function getLeaderboard(): Promise<User[]> {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
    return MOCK_USERS.sort((a, b) => b.totalHours - a.totalHours);
  }
  const q = query(collection(db, 'users'), orderBy('totalHours', 'desc'), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export async function blockSystem(systemId: string, blocked: boolean) {
  await updateDoc(doc(db, 'systems', systemId), {
    status: blocked ? 'blocked' : 'available'
  });
}

export function watchAllActiveSessions(cb: (sessions: Record<string, Session>) => void) {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_firebase_api_key') {
    cb({
      'bkg1': { bookingId: 'bkg1', userId: 'user1', systemId: 'pc2', startTime: Date.now() - 30 * 60000, endTime: Date.now() + 30 * 60000, isActive: true, extendedBy: 0 }
    });
    return () => {};
  }
  const r = ref(rtdb, 'sessions');
  const handler = onValue(r, (snap) => {
    cb((snap.val() || {}) as Record<string, Session>);
  });
  return () => off(r, 'value', handler);
}
