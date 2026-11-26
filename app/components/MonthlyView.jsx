'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  X,
  ExternalLink,
  ChevronRight as ArrowIcon
} from 'lucide-react';
import { DAYS, MONTHS } from '../../lib/timeUtils';

const DAYS_GRID_LONG = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DAYS_GRID_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function MonthlyView({
  agendas = [],
  selectedAgendaId,
  onSelectAgenda,
  onSwitchToDaily,
  categories = []
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [dayModal, setDayModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const legendList = useMemo(() => {
    const map = new Map();
    if (categories && categories.length > 0) {
      categories.forEach((c) => {
        const name = c.jenis_kegiatan;
        if (name && !map.has(name)) {
          const matched = agendas.find((a) => (a.category || '').toLowerCase() === name.toLowerCase());
          map.set(name, matched?.color || '#2563eb');
        }
      });
    } else {
      agendas.forEach((a) => {
        if (a.category && !map.has(a.category)) {
          map.set(a.category, a.color || '#2563eb');
        }
      });
    }
    return Array.from(map.entries()).map(([label, color]) => ({ label, color }));
  }, [categories, agendas]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleTodayMonth = () => {
    const now = new Date();
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
    setSelectedDay(now.getDate());
  };

  // Index agenda per tanggal
  const agendaByDate = useMemo(() => {
    const map = {};
    agendas.forEach((a) => {
      let y, m, d;
      if (a.dateKey) {
        const parts = a.dateKey.split('-');
        y = Number(parts[0]);
        m = Number(parts[1]) - 1;
        d = Number(parts[2]);
      } else if (a.rawDate) {
        const dateObj = new Date(String(a.rawDate).replace(' ', 'T'));
        if (isNaN(dateObj)) return;
        y = dateObj.getFullYear();
        m = dateObj.getMonth();
        d = dateObj.getDate();
      } else {
        return;
      }
      const key = `${y}-${m}-${d}`;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [agendas]);

  const getEventsForDay = (d) => {
    const key = `${viewYear}-${viewMonth}-${d}`;
    return agendaByDate[key] || [];
  };

  // Grid kalender
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayRaw = new Date(viewYear, viewMonth, 1).getDay();
  const firstDayIndex = (firstDayRaw + 6) % 7;

  const calendarGrid = useMemo(() => {
    const cells = [];

    // Bulan sebelumnya
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false
      });
    }

    // Bulan aktif
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = (firstDayIndex + d - 1) % 7;
      const dayEvents = getEventsForDay(d);

      cells.push({
        dayNum: d,
        isCurrentMonth: true,
        isToday:
          d === today.getDate() &&
          viewMonth === today.getMonth() &&
          viewYear === today.getFullYear(),
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
        events: dayEvents
      });
    }

    // Bulan berikutnya
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        dayNum: d,
        isCurrentMonth: false
      });
    }

    return cells;
  }, [viewYear, viewMonth, agendaByDate]);

  // Modal daftar agenda
  const openDayOverviewModal = (dayNum) => {
    setSelectedDay(dayNum);
    const dayEvents = getEventsForDay(dayNum);
    const dateObj = new Date(viewYear, viewMonth, dayNum);
    const dayName = DAYS[dateObj.getDay()] || 'Senin';
    const fullDate = `${dayName}, ${dayNum} ${MONTHS[viewMonth]} ${viewYear}`;

    setDetailModal(null);
    setDayModal({
      day: dayNum,
      fullDate,
      events: dayEvents
    });
  };

  // Modal detail agenda
  const openDetailModal = (evt, dayNum) => {
    setSelectedDay(dayNum);
    if (onSelectAgenda) onSelectAgenda(evt);
    setDetailModal(evt);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Toolbar */}
      <div 
        className="p-3 sm:p-[12px_20px] bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
        onWheel={(e) => {
          if (e.deltaY < -20) handlePrevMonth();
          else if (e.deltaY > 20) handleNextMonth();
        }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <span className="text-[1rem] sm:text-[1.15rem] font-bold text-slate-900 min-w-0 sm:min-w-[150px]">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button 
              type="button"
              className="inline-flex items-center justify-center w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] rounded-md border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900" 
              aria-label="Bulan Sebelumnya"
              onClick={handlePrevMonth}
            >
              <ChevronLeft size={15} />
            </button>
            <button 
              type="button"
              className="inline-flex items-center justify-center w-[28px] h-[28px] sm:w-[30px] sm:h-[30px] rounded-md border border-slate-300 bg-white text-slate-600 cursor-pointer transition-all hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900" 
              aria-label="Bulan Berikutnya"
              onClick={handleNextMonth}
            >
              <ChevronRight size={15} />
            </button>
          </div>
          <button 
            type="button"
            className="py-1 px-2.5 sm:px-3 text-[0.72rem] sm:text-[0.76rem] font-semibold rounded-md border border-slate-300 bg-white text-slate-700 cursor-pointer transition-all hover:bg-slate-50 hover:text-brand-green hover:border-brand-green" 
            onClick={handleTodayMonth}
          >
            Hari Ini
          </button>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 text-[0.7rem] sm:text-[0.74rem] text-slate-500 flex-wrap">
          {legendList.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: item.color }}></span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        <div className="min-w-[580px] lg:min-w-0 flex flex-col flex-1">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {DAYS_GRID_LONG.map((name, idx) => (
              <div
                key={name}
                className={`p-[8px_4px] sm:p-[10px_8px] text-center text-[0.72rem] sm:text-[0.74rem] font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100 last:border-r-0 ${idx >= 5 ? 'text-rose-500 bg-[#fff7f7]' : ''}`}
              >
                <span className="hidden sm:inline">{name}</span>
                <span className="sm:hidden">{DAYS_GRID_SHORT[idx]}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-slate-200 gap-[1px] flex-1 min-h-0 overflow-y-auto">
        {calendarGrid.map((cell, idx) => {
          const isWeekendCol = idx % 7 === 5 || idx % 7 === 6;

          if (!cell.isCurrentMonth) {
            return (
              <div 
                key={`prev-${idx}`} 
                className={`min-h-[110px] p-2 flex flex-col gap-1.5 cursor-pointer ${
                  isWeekendCol 
                    ? 'bg-[#fffbfc]/60 bg-[repeating-linear-gradient(135deg,rgba(255,250,250,0.6),rgba(255,250,250,0.6)_8px,rgba(255,241,242,0.3)_8px,rgba(255,241,242,0.3)_16px)] opacity-40' 
                    : 'bg-[#fafbfc] opacity-45'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[0.8rem] font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isWeekendCol ? 'text-rose-300' : 'text-slate-700'}`}>
                    {cell.dayNum}
                  </span>
                </div>
              </div>
            );
          }

          const isSelected = selectedDay === cell.dayNum;
          const events = cell.events || [];
          const visibleEvents = events.slice(0, 3);
          const hiddenCount = events.length - visibleEvents.length;

          return (
            <div
              key={`day-${cell.dayNum}`}
              className={`
                min-h-[110px] p-2 flex flex-col gap-1.5 cursor-pointer transition-colors
                ${cell.isWeekend 
                  ? 'bg-[#fffbfb] bg-[repeating-linear-gradient(135deg,rgba(255,251,251,0.9),rgba(255,251,251,0.9)_8px,rgba(255,238,240,0.4)_8px,rgba(255,238,240,0.4)_16px)] hover:bg-[#fff5f5]' 
                  : 'bg-white hover:bg-slate-50/70'
                } 
                ${cell.isToday ? '!bg-[#f2fbf6] !bg-none' : ''} 
                ${isSelected ? 'ring-2 ring-inset ring-brand-green' : ''}
              `}
              onClick={() => openDayOverviewModal(cell.dayNum)}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-[0.8rem] font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                  cell.isToday 
                    ? '!bg-brand-green !text-white font-bold' 
                    : cell.isWeekend 
                      ? 'text-rose-500 font-semibold' 
                      : 'text-slate-700'
                }`}>
                  {cell.dayNum}
                </span>
                {events.length > 0 && (
                  <span className="text-[0.64rem] font-semibold text-slate-500 bg-white/90 border border-slate-200/70 py-0.5 px-1.5 rounded-full shadow-xs">
                    {events.length} agenda
                  </span>
                )}
              </div>

              {/* Daftar Kegiatan Hari Ini */}
              <div className="flex flex-col gap-1 overflow-hidden">
                {visibleEvents.map((evt) => {
                  const startTime = evt.time ? evt.time.split(' - ')[0] : '';
                  return (
                    <div
                      key={evt.id}
                      className="flex items-center gap-1.5 py-1 px-2 rounded-md text-[0.72rem] leading-tight cursor-pointer truncate border transition-all hover:brightness-95 hover:-translate-y-0.5 hover:shadow-sm"
                      style={{
                        backgroundColor: evt.color ? `${evt.color}15` : '#f8fafc',
                        borderColor: evt.color ? `${evt.color}35` : '#e2e8f0',
                        color: evt.color || '#475569'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(evt, cell.dayNum);
                      }}
                      title={`${evt.time} | ${evt.title}`}
                    >
                      {startTime && <span className="font-bold text-[0.68rem] opacity-85 shrink-0 text-inherit">{startTime}</span>}
                      <span className="font-semibold text-inherit truncate">{evt.title}</span>
                    </div>
                  );
                })}

                {hiddenCount > 0 && (
                  <div 
                    className="text-[0.68rem] font-bold text-brand-green py-0.5 px-1.5 text-left rounded bg-emerald-50 cursor-pointer inline-block transition-all hover:bg-emerald-100 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDayOverviewModal(cell.dayNum);
                    }}
                  >
                    +{hiddenCount} kegiatan lainnya
                  </div>
                )}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>

      {/* Modal Daftar Agenda */}
      {dayModal && !detailModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] backdrop-blur-[2px] p-4" onClick={() => setDayModal(null)}>
          <div className="bg-white rounded-xl w-[680px] max-w-[min(680px,95vw)] max-h-[88vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.12),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-[14px_20px] bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-[0.95rem] font-bold text-slate-900">{dayModal.fullDate}</span>
                <span className="text-[0.82rem] font-medium text-slate-500">({dayModal.events.length} agenda)</span>
              </div>
              <button 
                type="button" 
                className="bg-transparent border-0 text-slate-500 cursor-pointer flex items-center justify-center w-7 h-7 rounded-md transition-all hover:bg-slate-200 hover:text-slate-900" 
                onClick={() => setDayModal(null)}
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {/* List Agenda */}
            <div className="flex-1 min-h-0 overflow-y-auto max-h-[500px] p-[8px_18px_14px] flex flex-col">
              {dayModal.events.map((evt) => (
                <div
                  key={evt.id}
                  className="group p-[13px_12px] border-b border-slate-100 last:border-b-0 rounded-lg cursor-pointer transition-all flex items-center gap-[18px] hover:bg-slate-50"
                  onClick={() => openDetailModal(evt, dayModal.day)}
                >
                  <div className="min-w-[105px] shrink-0 flex flex-col items-start gap-0.5">
                    <span className="text-[0.86rem] font-bold text-slate-900 tracking-tight whitespace-nowrap">
                      {evt.time || '-'}
                    </span>
                    {evt.duration && (
                      <span className="text-[0.7rem] font-medium text-slate-500 whitespace-nowrap">{evt.duration}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <span 
                        className="text-[0.68rem] font-semibold py-0.5 px-2 rounded tracking-tight shrink-0 leading-normal mt-0.5"
                        style={{ 
                          backgroundColor: `${evt.color || '#2563eb'}18`, 
                          color: evt.color || '#2563eb' 
                        }}
                      >
                        {evt.category}
                      </span>
                      <span className="text-[0.88rem] font-semibold text-slate-800 leading-snug flex-1">{evt.title}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[0.74rem] text-slate-500 flex-wrap mt-0.5">
                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                      {evt.pic && (
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-400" />
                          <span>PIC: {evt.pic}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-slate-300 flex items-center shrink-0 transition-all group-hover:text-brand-green group-hover:translate-x-1">
                    <ArrowIcon size={16} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-[12px_20px] bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {onSwitchToDaily && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3.5 text-[0.76rem] font-semibold rounded-md border border-brand-green bg-brand-green text-white cursor-pointer transition-all hover:bg-brand-hover"
                  onClick={() => {
                    const targetDate = new Date(viewYear, viewMonth, dayModal.day);
                    setDayModal(null);
                    onSwitchToDaily(targetDate);
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Buka di Tampilan Harian</span>
                </button>
              )}
              <button 
                type="button" 
                className="py-1.5 px-3.5 text-[0.76rem] font-semibold rounded-md border border-slate-300 bg-white text-slate-700 cursor-pointer transition-all hover:bg-slate-100" 
                onClick={() => setDayModal(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Agenda */}
      {detailModal && (
        <div 
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] backdrop-blur-[2px] p-4" 
          onClick={() => {
            setDetailModal(null);
          }}
        >
          <div 
            className="bg-white rounded-xl w-[680px] max-w-[min(680px,95vw)] max-h-[88vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.12),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-[14px_20px] bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span 
                className="text-[0.68rem] font-bold py-0.5 px-2 rounded uppercase" 
                style={{ 
                  backgroundColor: `${detailModal.color || '#2563eb'}18`, 
                  color: detailModal.color || '#2563eb' 
                }}
              >
                {detailModal.category}
              </span>
              <button 
                type="button" 
                className="bg-transparent border-0 text-slate-500 cursor-pointer flex items-center justify-center w-7 h-7 rounded-md transition-all hover:bg-slate-200 hover:text-slate-900" 
                onClick={() => {
                  setDetailModal(null);
                  setDayModal(null);
                }}
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {/* Konten Detail */}
            <div className="p-[18px_20px] flex flex-col gap-3.5">
              {dayModal && (
                <button 
                  type="button"
                  className="inline-flex items-center gap-1.5 border-0 bg-transparent text-brand-green text-[0.76rem] font-semibold cursor-pointer p-0 w-fit hover:underline"
                  onClick={() => setDetailModal(null)}
                >
                  ← Kembali ke Daftar Agenda ({dayModal.events.length} Kegiatan)
                </button>
              )}

              <h3 className="text-[1.05rem] font-bold text-slate-900 leading-snug">{detailModal.title}</h3>

              <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700">
                <Clock size={15} className="text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong>Waktu:</strong> {detailModal.time} WIB {detailModal.duration ? `(${detailModal.duration})` : ''}
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700">
                <MapPin size={15} className="text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong>Lokasi:</strong> {detailModal.location || '-'}
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700">
                <User size={15} className="text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div><strong>PIC:</strong> {detailModal.pic || '-'}</div>
                  {detailModal.participants && (
                    <div style={{ color: '#64748b', fontSize: '0.74rem', marginTop: 2 }}>
                      Peserta: {detailModal.participants}
                    </div>
                  )}
                </div>
              </div>

              {detailModal.description && (
                <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700">
                  <FileText size={15} className="text-slate-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong>Keterangan:</strong>
                    <div className="mt-1 p-[10px_12px] bg-slate-50 rounded-md text-[0.78rem] text-slate-600 leading-relaxed border border-slate-100">
                      {detailModal.description}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-[12px_20px] bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {dayModal ? (
                <button 
                  type="button" 
                  className="py-1.5 px-3.5 text-[0.76rem] font-semibold rounded-md border border-slate-300 bg-white text-slate-700 cursor-pointer transition-all hover:bg-slate-100" 
                  onClick={() => setDetailModal(null)}
                >
                  Kembali
                </button>
              ) : (
                <div></div>
              )}
              <button 
                type="button" 
                className="py-1.5 px-3.5 text-[0.76rem] font-semibold rounded-md border border-slate-300 bg-white text-slate-700 cursor-pointer transition-all hover:bg-slate-100" 
                onClick={() => {
                  setDetailModal(null);
                  setDayModal(null);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
