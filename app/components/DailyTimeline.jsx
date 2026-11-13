import { getAgendaStatus } from '../../lib/timeUtils';
import { MapPin, User, Users, MoreVertical, CalendarX } from 'lucide-react';

const CARD_STYLES = {
  internal: 'bg-white border-slate-200',
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

export default function DailyTimeline({ agendas = [], selectedAgendaId, onSelectAgenda, currentTime }) {
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
    <div className="flex flex-col relative w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 pb-6">
      {agendas.map((item, index) => {
        const isSelected = item.id === selectedAgendaId;
        const isLast = index === agendas.length - 1;
        const status = currentTime ? getAgendaStatus(item.time, currentTime) : 'upcoming';

        // Item Istirahat
        if (item.isBreak) {
          return (
            <div key={item.id} className="flex items-stretch relative min-h-[85px] mb-[0.95rem]">
              {/* Waktu */}
              <div className="w-[95px] shrink-0 pt-3.5 text-left">
                <div className="text-[0.88rem] font-bold text-slate-800">{item.time}</div>
                <div className="text-[0.76rem] text-slate-500 mt-0.5">{item.duration}</div>
              </div>

              {/* Indikator */}
              <div className="w-6 flex flex-col items-center relative shrink-0 mr-3.5">
                <div className="w-[11px] h-[11px] rounded-full mt-[18px] z-10 shadow-[0_0_0_3px_#ffffff] bg-slate-400"></div>
                {!isLast && <div className="absolute top-[25px] bottom-[-10px] w-0.5 bg-slate-200"></div>}
              </div>

              {/* Kotak Istirahat */}
              <div className={`flex-1 bg-slate-100 rounded-xl p-[0.85rem_1.25rem] flex items-center gap-2.5 ${status === 'ongoing' ? '!border-2 !border-[#64748b]' : ''}`}>
                <span className="text-[0.88rem] font-semibold text-slate-600">Istirahat</span>
              </div>
            </div>
          );
        }

        const cardColorClass = CARD_STYLES[item.categoryType] || CARD_STYLES.internal;
        const ongoingBorderClass = status === 'ongoing' ? (ONGOING_BORDER_STYLES[item.categoryType] || '!border-2 !border-[#0a5c36]') : '';
        const badgeColorClass = BADGE_STYLES[item.categoryType] || BADGE_STYLES.internal;

        // Item Agenda
        return (
          <div key={item.id} className="flex items-stretch relative min-h-[85px] mb-[0.95rem]">
            {/* Waktu */}
            <div className="w-[95px] shrink-0 pt-3.5 text-left">
              <div className="text-[0.88rem] font-bold text-slate-800">{item.time}</div>
              {item.duration ? <div className="text-[0.76rem] text-slate-500 mt-0.5">{item.duration}</div> : null}
            </div>

            {/* Indikator */}
            <div className="w-6 flex flex-col items-center relative shrink-0 mr-3.5">
              <div 
                className="w-[11px] h-[11px] rounded-full mt-[18px] z-10 shadow-[0_0_0_3px_#ffffff]" 
                style={{ backgroundColor: item.color }}
              ></div>
              {!isLast && <div className="absolute top-[25px] bottom-[-10px] w-0.5 bg-slate-200"></div>}
            </div>

            {/* Kartu */}
            <div 
              className={`flex-1 rounded-xl p-[0.85rem_1.25rem] flex items-center justify-between cursor-pointer border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] ${cardColorClass} ${ongoingBorderClass} ${isSelected ? 'shadow-[0_4px_14px_rgba(15,23,42,0.08)]' : ''}`}
              onClick={() => onSelectAgenda && onSelectAgenda(item)}
            >
              {/* Konten */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[0.92rem] font-bold text-slate-900 leading-[1.25]">{item.title}</h3>
                </div>
                
                <div className="flex items-center gap-1.5 text-[0.76rem] text-slate-500 mb-1.5">
                  <MapPin size={13} strokeWidth={2.2} />
                  <span>{item.location}</span>
                </div>

                <div className="flex items-center gap-4 text-[0.75rem] text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <User size={13} strokeWidth={2} />
                    <span>PIC: {item.pic}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users size={13} strokeWidth={2} />
                    <span>Peserta: {item.participants}</span>
                  </div>
                </div>
              </div>

              {/* Badge & Aksi */}
              <div className="flex items-center gap-3 shrink-0">
                <span 
                  className="py-1 px-3 rounded-full text-[0.74rem] font-semibold"
                  style={{
                    backgroundColor: item.color ? `${item.color}18` : '#e2e8f0',
                    color: item.color || '#475569'
                  }}
                >
                  {item.category}
                </span>
                <button className="bg-transparent border-0 text-slate-500 cursor-pointer p-1 flex items-center justify-center rounded hover:bg-black/5 hover:text-slate-900" aria-label="Opsi">
                  <MoreVertical size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
