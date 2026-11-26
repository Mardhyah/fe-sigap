import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';

export async function GET() {
  const logoutTarget = process.env.LOGOUT_URL;

  const response = NextResponse.redirect(new URL(logoutTarget));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
