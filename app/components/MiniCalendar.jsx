'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS, DAYS_GRID } from '../../lib/timeUtils';

export default function MiniCalendar({ agendas = [], selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const activeDate = selectedDate ?? today;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    const startOffset = (firstDay.getDay() + 6) % 7;
    const endOffset = (6 - (lastDay.getDay() + 6) % 7) % 7;

    const days = [];
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

    // Bulan sebelumnya
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ num: prevMonthLastDay - i, current: false });
    }

    // Bulan aktif
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ num: d, current: true });
    }

    // Bulan berikutnya
    for (let i = 1; i <= endOffset; i++) {
      days.push({ num: i, current: false });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Map tanggal agenda
  const agendaDatesMap = useMemo(() => {
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
      if (!map[key]) map[key] = a.color || '#3b82f6';
    });
    return map;
  }, [agendas]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-[1.2rem] mb-[1.2rem] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div className="leading-[1.25]">
          <div className="text-[0.95rem] font-bold text-slate-900">Kalender</div>
          <div className="text-[0.76rem] text-slate-500">{MONTHS[viewMonth]} {viewYear}</div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={prevMonth}
            className="w-[26px] h-[26px] rounded-md border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-100"
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
          </button>
          <button
            onClick={nextMonth}
            className="w-[26px] h-[26px] rounded-md border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-100"
            aria-label="Berikutnya"
          >
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Baris Hari */}
      <div className="grid grid-cols-7 text-center mb-1.5">
        {DAYS_GRID.map((d) => (
          <span key={d} className="text-[0.72rem] font-medium text-slate-500 py-0.5">{d}</span>
        ))}
      </div>

      {/* Grid Tanggal */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((item, idx) => {
          const isToday =
            item.current &&
            item.num === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();

          const isSelected =
            item.current &&
            item.num === activeDate.getDate() &&
            viewMonth === activeDate.getMonth() &&
            viewYear === activeDate.getFullYear();

          const dotColor = item.current
            ? agendaDatesMap[`${viewYear}-${viewMonth}-${item.num}`]
            : undefined;

          return (
            <div
              key={idx}
              onClick={() => {
                if (!item.current || !onSelectDate) return;
                onSelectDate(new Date(viewYear, viewMonth, item.num));
              }}
              className={`h-8 flex flex-col items-center justify-center relative border-0 rounded-full text-[0.8rem] transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white font-bold'
                  : isToday
                    ? 'bg-blue-50 text-blue-600 font-bold ring-1 ring-blue-300'
                    : !item.current
                      ? 'text-slate-300'
                      : 'text-slate-900 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              <span className="leading-none">{item.num}</span>
              {dotColor && !isSelected && (
                <span
                  className="absolute bottom-[3px] w-[3.5px] h-[3.5px] rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
