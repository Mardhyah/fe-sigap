import { formatIndonesianDate, calculateDuration } from './timeUtils.js';

const PALETTE = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#0d9488', '#ea580c', '#64748b'];

const KNOWN_COLORS = {
  rapat: '#2563eb',
  audiensi: '#16a34a',
  program: '#d97706',
  pertemuan: '#dc2626',
  internal: '#64748b',
  evaluasi: '#7c3aed',
};

function getCategoryColor(name, id) {
  if (typeof id === 'number' && id > 0) {
    return PALETTE[(id - 1) % PALETTE.length];
  }
  if (!name) return PALETTE[0];
  const key = name.toLowerCase().trim();
  if (KNOWN_COLORS[key]) return KNOWN_COLORS[key];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function normalizeTime(val) {
  if (!val) return '';
  const m = String(val).match(/(\d{1,2})[:.](\d{2})/);
  if (!m) return '';
  return `${m[1].padStart(2, '0')}.${m[2]}`;
}

export function mapRowToAgenda(row) {
  if (!row) return null;

  // Ekstrak YYYY-MM-DD standar untuk filter harian
  let dateKey = '';
  const dateMatch = String(row.tanggal_kegiatan || row.waktu || '').match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (dateMatch) {
    const y = dateMatch[1];
    const m = String(dateMatch[2]).padStart(2, '0');
    const d = String(dateMatch[3]).padStart(2, '0');
    dateKey = `${y}-${m}-${d}`;
  }

  // Tanggal kegiatan (prioritaskan tanggal_kegiatan, lalu waktu)
  const rawDateStr = row.tanggal_kegiatan || (row.waktu ? String(row.waktu).split(' ')[0] : '');
  let dateObj = null;
  if (rawDateStr) {
    dateObj = new Date(rawDateStr.includes('T') ? rawDateStr : `${rawDateStr}T00:00:00`);
  } else if (row.waktu) {
    dateObj = new Date(String(row.waktu).replace(' ', 'T'));
  }
  const date = dateObj && !isNaN(dateObj) ? formatIndonesianDate(dateObj) : (rawDateStr || row.waktu || '');

  const category = row.jenis_kegiatan || 'Kegiatan';
  const categoryType = category.toLowerCase().trim();
  const color = getCategoryColor(category, row.id_kat_kegiatan);

  // Jam & Durasi kegiatan
  let startStr = normalizeTime(row.waktu_mulai);
  let endStr = normalizeTime(row.waktu_selesai);

  // Jika waktu_mulai belum ada di baris data, ambil dari kolom waktu
  if (!startStr && row.waktu) {
    startStr = normalizeTime(row.waktu);
  }

  let time = '-';
  let duration = '';

  if (startStr && endStr) {
    time = `${startStr} - ${endStr}`;
    duration = calculateDuration(startStr, endStr);
  } else if (startStr) {
    time = startStr;
    duration = '';
  } else if (endStr) {
    time = endStr;
    duration = '';
  }

  return {
    id: row.id_history,
    title: row.judul_kegiatan || '',
    location: row.lokasi || '-',
    longitude: row.longitude || null,
    latitude: row.latitude || null,
    idKatKegiatan: row.id_kat_kegiatan,
    category,
    categoryType,
    color,
    time,
    duration,
    date,
    dateKey,
    rawDate: row.waktu,
    tanggalKegiatan: row.tanggal_kegiatan,
    waktuMulai: row.waktu_mulai,
    waktuSelesai: row.waktu_selesai,
    pic: row.pic || '-',
    participants: row.peserta || '-',
    description: row.keterangan || '-',
    createdDate: row.created_date,
    editedDate: row.edited_date,
    createdBy: row.created_by,
    editedBy: row.edited_by,
    isBreak: false,
  };
}

export function mapAgendaToRow(agenda, createdBy = 'admin') {
  const now = new Date().toISOString();

  return {
    judul_kegiatan: agenda.title,
    lokasi: agenda.location || '-',
    longitude: agenda.longitude || '',
    latitude: agenda.latitude || '',
    id_kat_kegiatan: Number(agenda.idKatKegiatan || 1),
    waktu: agenda.rawDate || agenda.waktu || agenda.date || now,
    pic: agenda.pic || '-',
    peserta: agenda.participants || '-',
    keterangan: agenda.description || '-',
    created_date: now,
    edited_date: now,
    created_by: createdBy,
    waktu_mulai: agenda.startTime || null,
    waktu_selesai: agenda.endTime || null,
    tanggal_kegiatan: agenda.date || null,
  };
}
