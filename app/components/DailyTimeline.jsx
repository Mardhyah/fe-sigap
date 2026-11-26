import { useState, useEffect } from 'react';
import { getAgendaStatus } from '../../lib/timeUtils';
import { MapPin, User, Users, MoreVertical, CalendarX, Trash2, Pencil } from 'lucide-react';

const CARD_STYLES = {
  internal: 'bg-[#f1f5f9] border-[#e2e8f0]',
  rapat: 'bg-[#eff6ff] border-[#dbeafe]',
  audiensi: 'bg-[#f0fdf4] border-[#dcfce7]',
  program: 'bg-[#fffdf0] border-[#fef3c7]',
  pertemuan: 'bg-[#fff5f5] border-[#fee2e2]',
  evaluasi: 'bg-[#faf5ff] border-[#f3e8ff]'
};

const ONGOING_BORDER_STYLES = {
  internal: '!border-2 !border-[#475569]',
  rapat: '!border-2 !border-[#2563eb]',
  audiensi: '!border-2 !border-[#16a34a]',
  program: '!border-2 !border-[#d97706]',
  pertemuan: '!border-2 !border-[#dc2626]',
  evaluasi: '!border-2 !border-[#7c3aed]'
};

const BADGE_STYLES = {
  internal: 'bg-[#e2e8f0] text-[#475569]',
  rapat: 'bg-[#dbeafe] text-[#2563eb]',
  audiensi: 'bg-[#dcfce7] text-[#16a34a]',
  program: 'bg-[#fef3c7] text-[#d97706]',
  pertemuan: 'bg-[#fee2e2] text-[#dc2626]',
  evaluasi: 'bg-[#f3e8ff] text-[#7c3aed]'
};

export default function DailyTimeline({ 
  agendas = [], 
  selectedAgendaId, 
  onSelectAgenda, 
  onEditAgenda, 
  onDeleteAgenda, 
  currentTime 
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const handleClose = () => setOpenMenuId(null);
    if (openMenuId) {
      window.addEventListener('click', handleClose);
      return () => window.removeEventListener('click', handleClose);
    }
  }, [openMenuId]);

  if (!agendas || agendas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[260px] text-slate-400 py-12">
        <CalendarX size={44} className="text-slate-300 mb-2.5 stroke-[1.5]" />
        <p className="text-[0.92rem] font-semibold text-slate-600">Tidak ada agenda pada tanggal ini</p>
        <p className="text-[0.78rem] text-slate-400 mt-0.5">Silakan pilih tanggal lain di kalender untuk melihat jadwal</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 sm:pr-2 pb-6">
      {agendas.map((item, index) => {
        const isSelected = item.id === selectedAgendaId; // Agenda sedang dipilih
        const isMenuOpen = openMenuId === item.id; // Menu opsi terbuka
        const isLast = index === agendas.length - 1; // Item terakhir
        const status = currentTime ? getAgendaStatus(item.time, currentTime, item.dateKey) : 'upcoming'; // Status waktu

        const cardColorClass = CARD_STYLES[item.categoryType] || CARD_STYLES.internal; // Warna kartu
        const ongoingBorderClass = status === 'ongoing' ? (ONGOING_BORDER_STYLES[item.categoryType] || '!border-2 !border-[#0a5c36]') : ''; // Border jika jam aktif
        const badgeColorClass = BADGE_STYLES[item.categoryType] || BADGE_STYLES.internal; // Warna badge kategori

        // Item 
        return (
          <div key={item.id} className={`flex items-start relative mb-2.5 sm:mb-3.5 ${isMenuOpen ? 'z-50' : 'z-0'}`}>
            {/* Waktu */}
            <div className="w-[68px] sm:w-[88px] shrink-0 pt-2.5 sm:pt-3 text-left">
              <div className="text-[0.78rem] sm:text-[0.88rem] font-bold text-slate-800 leading-tight">{item.time}</div>
              {item.duration ? <div className="text-[0.68rem] sm:text-[0.74rem] text-slate-500 mt-0.5">{item.duration}</div> : null}
            </div>

            <div className="w-4 sm:w-6 flex flex-col items-center relative shrink-0 mr-2 sm:mr-3 self-stretch">
              <div
                className="w-[9px] h-[9px] sm:w-[11px] sm:h-[11px] rounded-full mt-3.5 sm:mt-4 z-10 shadow-[0_0_0_3px_#ffffff] shrink-0"
                style={{ backgroundColor: item.color }}
              ></div>
              {!isLast && <div className="absolute top-4 bottom-[-14px] w-0.5 bg-slate-200"></div>}
            </div>

            {/* Kartu */}
            <div
              className={`flex-1 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3 cursor-pointer border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] ${cardColorClass} ${ongoingBorderClass} ${isSelected ? 'shadow-[0_4px_14px_rgba(15,23,42,0.08)]' : ''} ${isMenuOpen ? 'relative z-50' : ''}`}
              onClick={() => onSelectAgenda && onSelectAgenda(isSelected ? null : item)}
            >
              {/* Konten */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[0.88rem] sm:text-[0.92rem] font-bold text-slate-900 leading-snug break-words">{item.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 text-[0.74rem] sm:text-[0.76rem] text-slate-500 mb-1.5">
                  <MapPin size={13} strokeWidth={2.2} className="shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3.5 text-[0.72rem] sm:text-[0.75rem] text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <User size={13} strokeWidth={2} className="shrink-0" />
                    <span>PIC: {item.pic}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users size={13} strokeWidth={2} className="shrink-0" />
                    <span>Peserta: {item.participants}</span>
                  </div>
                </div>
              </div>

              {/* Badge & Aksi */}
              <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 pt-1.5 sm:pt-0 sm:mt-0.5 border-t sm:border-t-0 border-slate-200/60">
                <span className={`py-0.5 px-2.5 rounded-full text-[0.7rem] sm:text-[0.72rem] font-semibold whitespace-nowrap ${badgeColorClass}`}>
                  {item.category}
                </span>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === item.id ? null : item.id);
                    }}
                    className="bg-transparent border-0 text-slate-500 cursor-pointer p-1.5 flex items-center justify-center rounded-lg hover:bg-black/5 hover:text-slate-900 transition-colors" 
                    aria-label="Opsi"
                  >
                    <MoreVertical size={16} strokeWidth={2} />
                  </button>

                  {openMenuId === item.id && (
                    <div 
                      className="absolute right-0 top-full mt-1.5 w-32 bg-white border border-slate-200 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onEditAgenda && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onEditAgenda(item);
                          }}
                          className="w-full px-3.5 py-2 text-left text-[0.82rem] text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 border-0 bg-transparent cursor-pointer font-medium transition-colors"
                        >
                          <Pencil size={14} className="text-slate-500" />
                          <span>Edit</span>
                        </button>
                      )}
                      {onDeleteAgenda && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDeleteAgenda(item);
                          }}
                          className="w-full px-3.5 py-2 text-left text-[0.82rem] text-red-600 hover:bg-red-50 flex items-center gap-2.5 border-0 bg-transparent cursor-pointer font-semibold transition-colors"
                        >
                          <Trash2 size={14} className="text-red-500" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
