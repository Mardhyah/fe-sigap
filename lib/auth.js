export const SESSION_COOKIE = 'agenda_session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 jam

const SECRET = process.env.BZS_KEY || process.env.API_AUTH || 'agenda-pimpinan-session';

async function hmac(text) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(text));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function signSession(payload) {
  const json = JSON.stringify({ ...payload, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const body = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return `${body}.${await hmac(body)}`;
}

export async function verifySession(token) {
  const [body, sig] = (token || '').split('.');
  if (!body || !sig || sig !== (await hmac(body))) return null;
  try {
    const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    return data?.logged_in && Date.now() < data.exp ? data : null;
  } catch {
    return null;
  }
}

export function isSecureRequest(request) {
  return (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol).startsWith('https');
}
