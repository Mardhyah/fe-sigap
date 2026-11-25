export const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const DAYS_GRID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function formatIndonesianDate(date = new Date()) {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDigitalClock(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Konversi string jam ke menit
export function parseStartMinutes(timeStr) {
  if (!timeStr) return 0;
  const start = String(timeStr).split('-')[0].trim().replace(':', '.');
  const [h, m] = start.split('.').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Hitung durasi agenda
export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '1 jam';
  const diff = parseStartMinutes(endTime) - parseStartMinutes(startTime);
  if (diff <= 0) return '1 jam';

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours} jam ${mins} menit`;
  return hours > 0 ? `${hours} jam` : `${mins} menit`;
}

// Urutkan agenda berdasarkan jam mulai
export function sortAgendasByTime(agendas) {
  if (!Array.isArray(agendas)) return [];
  return [...agendas].sort((a, b) => {
    const diff = parseStartMinutes(a.time) - parseStartMinutes(b.time);
    if (diff !== 0) return diff;
    return parseStartMinutes(a.time?.split('-')[1]) - parseStartMinutes(b.time?.split('-')[1]);
  });
}

// Cek status agenda upcoming, ongoing, completed
export function getAgendaStatus(timeStr, now = new Date(), dateKey) {
  if (!timeStr || !now) return 'upcoming';

  if (dateKey) {
    const todayKey = getDateKey(now);
    if (dateKey < todayKey) return 'completed';
    if (dateKey > todayKey) return 'upcoming';
  }

  const [startStr, endStr] = timeStr.split('-');
  const startMin = parseStartMinutes(startStr);
  const endMin = parseStartMinutes(endStr);
  const currentMin = now.getHours() * 60 + now.getMinutes();

  if (!endMin) {
    return currentMin >= startMin ? 'ongoing' : 'upcoming';
  }

  if (currentMin >= startMin && currentMin <= endMin) return 'ongoing';
  if (currentMin > endMin) return 'completed';
  return 'upcoming';
}

// Ambil format tanggal YYYY-MM-DD
export function getDateKey(dateInput) {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && dateInput.length >= 10) {
    return dateInput.slice(0, 10).replace(/\//g, '-');
  }
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
