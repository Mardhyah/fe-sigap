import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './lib/auth';

export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

 // Jika belum login
  if (!session) {
    return NextResponse.rewrite(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
