import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_USER = ['/dashboard'];
const PROTECTED_ADMIN = ['/admin'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for Firebase Auth cookie (set by client — this is a soft check)
  const hasAuthCookie = request.cookies.has('firebase-token') || request.cookies.has('__session');

  // Redirect authenticated users away from auth pages
  if (hasAuthCookie && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users from protected pages
  if (!hasAuthCookie && [...PROTECTED_USER, ...PROTECTED_ADMIN].some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
};
