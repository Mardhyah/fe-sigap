import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './lib/auth';

export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (!session) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

// Proteksi hanya halaman CMS ('/'); Monitor ('/dashboard'), '/sso', '/auth' tetap bebas akses
export const config = {
  matcher: ['/'],
};

