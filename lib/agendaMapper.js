import { formatIndonesianDate, calculateDuration } from './timeUtils.js';

// Warna kategori
const CATEGORY_COLORS = {
  rapat: '#2563eb',
  audiensi: '#16a34a',
  program: '#d97706',
  pertemuan: '#dc2626',
  evaluasi: '#7c3aed',
  internal: '#475569',
};
const PALETTE = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#0d9488'];

function getCategoryColor(category, id) {
  const key = String(category || '').toLowerCase().trim();
  if (CATEGORY_COLORS[key]) return CATEGORY_COLORS[key];
  const num = Number(id);
  return num > 0 ? PALETTE[(num - 1) % PALETTE.length] : PALETTE[0];
}

// Format jam HH.MM
function normalizeTime(val) {
  if (!val) return '';
  const m = String(val).match(/(\d{1,2})[:.](\d{2})/);
  return m ? `${m[1].padStart(2, '0')}.${m[2]}` : '';
}

// Format response Card & Detail
export function mapRowToAgenda(row) {
  if (!row) return null;

  // Tanggal
  const dateKey = row.tanggal_kegiatan ? String(row.tanggal_kegiatan).split('T')[0] : '';
  const date = dateKey ? formatIndonesianDate(new Date(`${dateKey}T00:00:00`)) : '';

  // Kategori
  const category = row.jenis_kegiatan || 'Kegiatan';

  // Jam & durasi
  const start = normalizeTime(row.waktu_mulai);
  const end = normalizeTime(row.waktu_selesai);
  const time = start && end ? `${start} - ${end}` : (start || end);
  const duration = start && end ? calculateDuration(start, end) : '';

  return {
    id: row.id_history,
    title: row.judul_kegiatan || '',
    location: row.lokasi || '',
    longitude: row.longitude || null,
    latitude: row.latitude || null,
    idKatKegiatan: row.id_kat_kegiatan,
    category,
    categoryType: category.toLowerCase().trim(),
    color: getCategoryColor(category, row.id_kat_kegiatan),
    time,
    duration,
    date,
    dateKey,
    rawDate: row.waktu,
    tanggalKegiatan: row.tanggal_kegiatan,
    waktuMulai: row.waktu_mulai,
    waktuSelesai: row.waktu_selesai,
    pic: row.pic || '',
    participants: row.peserta || '',
    description: row.keterangan || '',
    createdDate: row.created_date,
    editedDate: row.edited_date,
    createdBy: row.created_by,
    editedBy: row.edited_by,
  };
}
