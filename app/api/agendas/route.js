import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api, errorResponse, extractList } from '@/lib/api';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { mapRowToAgenda, mapAgendaToRow } from '@/lib/agendaMapper';

export async function GET(request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = await verifySession(token);

    const userLogin = session?.email || process.env.SSO_USER_ID || '';
    const key = session?.key || process.env.SSO_KEY || '';

    const requestedId = request?.nextUrl?.searchParams?.get('id') || '';

    const query = new URLSearchParams({
      user_login: userLogin,
      id_history: requestedId,
      key: key,
      user_login: session?.email || process.env.SSO_USER_ID,
      id_history: '',
      key: session?.key || process.env.SSO_KEY,
    });

    const json = await api.get(`/agenda?${query.toString()}`);
    const data = extractList(json).map(mapRowToAgenda).filter(Boolean);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Sesi login berakhir, silakan login' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const title = body.title || body.judul_kegiatan;

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Judul kegiatan wajib diisi' },
        { status: 400 }
      );
    }

    // Normalisasi jam ke format HH:MM
    const normalizeTimeForApi = (t) => {
      if (!t) return '';
      const m = String(t).match(/(\d{1,2})[:.](\d{2})/);
      if (!m) return String(t);
      return `${m[1].padStart(2, '0')}:${m[2]}`;
    };

    const startTime = normalizeTimeForApi(body.startTime || body.waktu_mulai);
    const endTime = normalizeTimeForApi(body.endTime || body.waktu_selesai);
    const date = body.date || body.tanggal_kegiatan || new Date().toISOString().split('T')[0];

    const formFields = {
      user_login: session.email || process.env.SSO_USER_ID,
      key: session.key || process.env.SSO_KEY,
      judul_kegiatan: title.trim(),
      lokasi: body.location?.trim() || body.lokasi?.trim() || '-',
      longitude: body.longitude || '',
      latitude: body.latitude || '',
      id_kat_kegiatan: String(body.idKatKegiatan || body.id_kat_kegiatan || '1'),
      pic: body.pic?.trim() || '-',
      peserta: body.participants?.trim() || body.peserta?.trim() || '-',
      keterangan: body.description?.trim() || body.keterangan?.trim() || '-',
      waktu_mulai: startTime,
      waktu_selesai: endTime,
      tanggal_kegiatan: date,
    };

    const json = await api.postForm('/agenda', formFields);

    if (json && json.status === false) {
      return NextResponse.json(
        { success: false, message: json.message || 'Gagal menyimpan agenda' },
        { status: 400 }
      );
    }

    const created = json?.data ?? json;

    return NextResponse.json(
      { success: true, message: json?.message || 'Agenda berhasil disimpan', data: mapRowToAgenda(created) },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Sesi login berakhir, silakan login' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const idHistory = body.id || body.id_history;

    if (!idHistory) {
      return NextResponse.json(
        { success: false, message: 'id_history wajib disertakan untuk update agenda' },
        { status: 400 }
      );
    }

    const title = body.title || body.judul_kegiatan;
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Judul kegiatan wajib diisi' },
        { status: 400 }
      );
    }

    // Normalisasi jam ke format HH:MM
    const normalizeTimeForApi = (t) => {
      if (!t) return '';
      const m = String(t).match(/(\d{1,2})[:.](\d{2})/);
      if (!m) return String(t);
      return `${m[1].padStart(2, '0')}:${m[2]}`;
    };

    const startTime = normalizeTimeForApi(body.startTime || body.waktu_mulai);
    const endTime = normalizeTimeForApi(body.endTime || body.waktu_selesai);
    const date = body.date || body.tanggal_kegiatan || new Date().toISOString().split('T')[0];

    const formFields = {
      user_login: session.email || process.env.SSO_USER_ID,
      id_history: String(idHistory),
      key: session.key || process.env.SSO_KEY,
      judul_kegiatan: title.trim(),
      lokasi: body.location?.trim() || body.lokasi?.trim() || '-',
      longitude: body.longitude || '',
      latitude: body.latitude || '',
      id_kat_kegiatan: String(body.idKatKegiatan || body.id_kat_kegiatan || '1'),
      pic: body.pic?.trim() || '-',
      peserta: body.participants?.trim() || body.peserta?.trim() || '-',
      keterangan: body.description?.trim() || body.keterangan?.trim() || '-',
      waktu_mulai: startTime,
      waktu_selesai: endTime,
      tanggal_kegiatan: date,
    };

    const json = await api.putUrlEncoded('/agenda', formFields);

    if (json && json.status === false) {
      return NextResponse.json(
        { success: false, message: json.message || 'Gagal memperbarui agenda' },
        { status: 400 }
      );
    }

    const updated = json?.data ?? json;

    return NextResponse.json(
      { success: true, message: json?.message || 'Agenda berhasil diperbarui', data: mapRowToAgenda(updated) },
      { status: 200 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
