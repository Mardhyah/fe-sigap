import { Calendar, Clock, MapPin, User, FileText, Pencil } from 'lucide-react';

export default function AgendaDetail({ agenda, onEdit }) {
  if (!agenda) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[0.88rem] sm:text-[0.92rem] font-bold text-slate-900 m-0">Detail Agenda</h4>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(agenda)}
            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-[0.74rem] font-semibold cursor-pointer transition-all hover:bg-slate-50 hover:border-brand-green hover:text-brand-green"
            title="Edit agenda ini"
          >
            <Pencil size={12} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Judul dan Kategori */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="w-[8px] h-[8px] rounded-full mt-[5px] shrink-0" style={{ backgroundColor: agenda.color || '#2563eb' }}></span>
          <h3 className="text-[0.88rem] sm:text-[0.92rem] font-extrabold text-slate-900 leading-snug break-words">{agenda.title}</h3>
        </div>
        <span 
          className="py-0.5 px-2 rounded-full text-[0.7rem] font-semibold shrink-0"
          style={{
            backgroundColor: agenda.color ? `${agenda.color}18` : '#e2e8f0',
            color: agenda.color || '#475569'
          }}
        >
          {agenda.category}
        </span>
      </div>

      {/* Informasi */}
      <div className="flex flex-col gap-2 mb-1">
        <div className="flex items-start gap-2 text-[0.76rem] text-slate-700 leading-snug">
          <Calendar size={14} className="text-slate-500 mt-0.5 shrink-0" />
          <span>{agenda.date || '-'}</span>
        </div>

        <div className="flex items-start gap-2 text-[0.76rem] text-slate-700 leading-snug">
          <Clock size={14} className="text-slate-500 mt-0.5 shrink-0" />
          <span>{agenda.time ? `${agenda.time} WIB` : '-'}</span>
        </div>

        <div className="flex items-start gap-2 text-[0.76rem] text-slate-700 leading-snug">
          <MapPin size={14} className="text-slate-500 mt-0.5 shrink-0" />
          <span className="break-words">{agenda.location || '-'}</span>
        </div>

        <div className="flex items-start gap-2 text-[0.76rem] text-slate-700 leading-snug">
          <User size={14} className="text-slate-500 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <div>PIC &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {agenda.pic || '-'}</div>
            <div>Peserta : {agenda.participants || '-'}</div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[0.76rem] text-slate-700 leading-snug">
          <FileText size={14} className="text-slate-500 mt-0.5 shrink-0" />
          <p className="text-[0.75rem] text-slate-600 leading-relaxed m-0 break-words">{agenda.description || '-'}</p>
        </div>
      </div>
    </div>
  );
}
