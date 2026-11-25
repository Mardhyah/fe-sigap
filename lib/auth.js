export const SESSION_COOKIE = 'agenda_session';

// Simpan data login ke cookie
export async function signSession(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

// Cek status login dari cookie
export async function verifySession(token) {
  if (!token) return null;
  try {
    const data = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    return data?.logged_in ? data : null;
  } catch {
    return null;
  }
}
