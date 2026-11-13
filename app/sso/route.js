import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, isSecureRequest } from '@/lib/auth';

export async function GET(request) {
  const email = request.nextUrl.searchParams.get('email')?.trim();
  const key = request.nextUrl.searchParams.get('key')?.trim();

  if (email && key) {
    try {
      const result = await api.postForm('/authentication/sso', {
        ...(process.env.SSO_USER_ID ? { user_id_statis: process.env.SSO_USER_ID } : {}),
        ...(process.env.SSO_KEY ? { key_statis: process.env.SSO_KEY } : {}),
        email,
        key,
      });

      if (result?.status) {
        const token = await signSession({
          id_karyawan: result.id_karyawan ?? null,
          nama: result.nama ?? null,
          email: result.email || email,
          key,
          logged_in: true,
          logged_by: 'sso',
        });
        const response = NextResponse.redirect(new URL('/', request.url));

        response.cookies.set(SESSION_COOKIE, token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: isSecureRequest(request),
          path: '/',
          maxAge: SESSION_MAX_AGE,
        });

        return response;
      }

      console.warn('SSO ditolak backend:', result);
    } catch (error) {
      console.error('SSO login error:', error.message);
    }
  }

  return NextResponse.redirect(new URL('/auth', request.url));
}
