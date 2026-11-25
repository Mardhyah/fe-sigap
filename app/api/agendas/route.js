import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api, errorResponse, extractList } from '@/lib/api';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { mapRowToAgenda } from '@/lib/agendaMapper';



export async function GET(request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = await verifySession(token);

    const userLogin = session?.email || process.env.SSO_USER_ID;
    const key = session?.key || process.env.SSO_KEY;

    const query = new URLSearchParams({
      user_login: userLogin,
      id_history: '',
      key: key,
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

    const startTime = normalizeTimeForApi(body.startTime || body.waktu_mulai);
    const endTime = normalizeTimeForApi(body.endTime || body.waktu_selesai);
    const date = body.date || body.tanggal_kegiatan || new Date().toISOString().split('T')[0];

    const formFields = {
      user_login: session.email,
      key: session.key,
      judul_kegiatan: title.trim(),
      id_kat_kegiatan: String(body.idKatKegiatan),
      tanggal_kegiatan: date,
      waktu_mulai: startTime,
      waktu_selesai: endTime,
      lokasi: body.location?.trim(),
      pic: body.pic?.trim(),
      peserta: body.participants?.trim(),
      keterangan: body.description?.trim(),
      longitude: body.longitude || '',
      latitude: body.latitude || '',
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

    const startTime = normalizeTimeForApi(body.startTime || body.waktu_mulai);
    const endTime = normalizeTimeForApi(body.endTime || body.waktu_selesai);
    const date = body.date || body.tanggal_kegiatan || new Date().toISOString().split('T')[0];

    const formFields = {
      user_login: session.email,
      key: session.key,
      id_history: String(idHistory),
      judul_kegiatan: title.trim(),
      id_kat_kegiatan: String(body.idKatKegiatan),
      tanggal_kegiatan: date,
      waktu_mulai: startTime,
      waktu_selesai: endTime,
      lokasi: body.location?.trim(),
      pic: body.pic?.trim(),
      peserta: body.participants?.trim(),
      keterangan: body.description?.trim(),
      longitude: body.longitude || '',
      latitude: body.latitude || '',
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

export async function DELETE(request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Silakan login' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id') || request.nextUrl.searchParams.get('id_history');
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID agenda wajib diisi' }, { status: 400 });
    }

    const payload = {
      user_login: session.email,
      id_history: String(id),
      key: session.key,
    };

    const json = await api.deleteUrlEncoded('/agenda', payload);

    if (json && json.status === false) {
      return NextResponse.json({ success: false, message: json.message || 'Gagal menghapus agenda' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: json?.message || 'Agenda berhasil dihapus',
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// jam ke format HH:MM
const normalizeTimeForApi = (t) => {
  if (!t) return '';
  const m = String(t).match(/(\d{1,2})[:.](\d{2})/);
  if (!m) return String(t);
  return `${m[1].padStart(2, '0')}:${m[2]}`;
};
