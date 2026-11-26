import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SESSION_COOKIE, signSession } from '@/lib/auth';

export async function GET(request) {
  const email = request.nextUrl.searchParams.get('email')?.trim();
  const key = request.nextUrl.searchParams.get('key')?.trim();

  // parameter url tidak lengkap
  if (!email || !key) {
    notFound();
  }

  try {
    const result = await api.postForm('/authentication/sso', {
      user_id_statis: process.env.SSO_USER_ID,
      key_statis: process.env.SSO_KEY,
      email,
      key,
    });

    if (result?.status) {
      const token = await signSession({
        id_karyawan: result.id_karyawan,
        nama: result.nama,
        email: email,
        key,
        logged_in: true,
        logged_by: 'sso',
      });
      const response = NextResponse.redirect(new URL('/', process.env.APP_URL));

      response.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        path: '/',
      });

      return response;
    }
  } catch { }

  notFound();
}
