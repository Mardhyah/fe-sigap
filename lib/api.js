import { NextResponse } from 'next/server';

// Konfigurasi 
const BASE_URL = process.env.API_URL?.replace(/\/+$/, '');
const API_AUTH = process.env.API_AUTH;
const BZS_KEY = process.env.BZS_KEY;

// Request HTTP 
async function request(path, options = {}) {
  if (!BASE_URL) {
    const err = new Error('API_URL belum diisi di environment');
    err.status = 500;
    throw err;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      ...(API_AUTH ? { Authorization: API_AUTH } : {}),
      ...(BZS_KEY ? { 'bzs-key': BZS_KEY } : {}),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(json?.message || `API error (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return json;
}

// Helper FormData
function toFormData(fields) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v != null) form.append(k, v);
  });
  return form;
}

export function extractList(json) {
  return Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
}

// Method request 
export const api = {
  get: (path) => request(path, { method: 'GET' }),
  postForm: (path, fields) => request(path, { method: 'POST', body: toFormData(fields) }),
  putUrlEncoded: (path, fields) => request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  }),
  deleteUrlEncoded: (path, fields) => request(path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  }),
};

// Response JSON  error
export function errorResponse(error) {
  return NextResponse.json(
    { success: false, message: error.message },
    { status: error.status || 500 }
  );
}
