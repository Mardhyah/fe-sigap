
export const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** untuk header grid kalender */
export const DAYS_GRID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/**
 * Format tanggal 
 */
export function formatIndonesianDate(date = new Date()) {
  const dayName = DAYS[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

/**
 * Format jam digital
 */
export function formatDigitalClock(date = new Date()) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function parseStartMinutes(timeStr) {
  if (!timeStr) return 0;
  const startPart = timeStr.split('-')[0].trim();
  const cleaned = startPart.replace(':', '.');
  const [h, m] = cleaned.split('.').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Hitung durasi agenda 
 */
export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '1 jam';
  const startMin = parseStartMinutes(startTime);
  const endMin = parseStartMinutes(endTime);
  const diff = endMin - startMin;
  if (diff <= 0) return '1 jam';

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} jam ${mins} menit`;
  } else if (hours > 0) {
    return `${hours} jam`;
  } else {
    return `${mins} menit`;
  }
}


export function sortAgendasByTime(agendas) {
  if (!Array.isArray(agendas)) return [];
  return [...agendas].sort((a, b) => {
    const diff = parseStartMinutes(a.time) - parseStartMinutes(b.time);
    if (diff !== 0) return diff;
    const endA = a.time?.split('-')[1]?.trim() || '';
    const endB = b.time?.split('-')[1]?.trim() || '';
    return parseStartMinutes(endA) - parseStartMinutes(endB);
  });
}


export function getAgendaStatus(timeStr, now = new Date()) {
  if (!timeStr || !now) return 'upcoming';

  const parseMin = (t) => {
    const cleaned = t.trim().replace(':', '.');
    const [h, m] = cleaned.split('.').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const parts = timeStr.split('-');
  const startMin = parseMin(parts[0]);
  const currentMin = now.getHours() * 60 + now.getMinutes();

  if (parts.length < 2) {
    return currentMin >= startMin ? 'ongoing' : 'upcoming';
  }

  const endMin = parseMin(parts[1]);
  if (isNaN(endMin) || endMin === 0) {
    return currentMin >= startMin ? 'ongoing' : 'upcoming';
  }

  if (currentMin >= startMin && currentMin <= endMin) {
    return 'ongoing';
  } else if (currentMin > endMin) {
    return 'completed';
  } else {
    return 'upcoming';
  }
}

export function getDateKey(dateInput) {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
    }
  }
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
