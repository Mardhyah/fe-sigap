import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api, errorResponse, extractList } from '@/lib/api';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value ?? request.cookies.get(SESSION_COOKIE)?.value;
    const session = await verifySession(token);

    const query = new URLSearchParams({
      user_login: session?.email || process.env.SSO_USER_ID,
      id_kat_kegiatan: '',
      key: session?.key || process.env.SSO_KEY,
    });

    const json = await api.get(`/agenda/katkegiatan?${query.toString()}`);
    return NextResponse.json({ success: true, data: extractList(json) });
  } catch (error) {
    return errorResponse(error);
  }
}
