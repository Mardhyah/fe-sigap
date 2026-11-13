import { NextResponse } from 'next/server';

const BASE_URL = (process.env.API_URL || '').replace(/\/+$/, '');
const API_AUTH = process.env.API_AUTH || '';
const BZS_KEY = process.env.BZS_KEY || '';

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new ApiError('API_URL belum diisi di .env.local', 500);
  }

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(API_AUTH ? { Authorization: API_AUTH } : {}),
    ...(BZS_KEY ? { 'bzs-key': BZS_KEY } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message = json?.message || json?.error || `Backend API error (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return json;
}

export function extractList(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.result)) return json.result;
  if (Array.isArray(json?.agendas)) return json.agendas;
  if (Array.isArray(json?.agenda)) return json.agenda;
  return [];
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: (path, fields) => {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    return request(path, { method: 'POST', body: form });
  },
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  putForm: (path, fields) => {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    return request(path, { method: 'PUT', body: form });
  },
  putUrlEncoded: (path, fields) => {
    const params = new URLSearchParams();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    return request(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  },
};

export function errorResponse(error) {
  const status = error instanceof ApiError ? error.status : 500;
  return NextResponse.json({ success: false, message: error.message }, { status });
}
