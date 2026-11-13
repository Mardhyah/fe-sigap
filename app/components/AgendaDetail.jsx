import { Calendar, Clock, MapPin, User, FileText, Pencil } from 'lucide-react';

export default function AgendaDetail({ agenda, onEdit }) {
  if (!agenda) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-[1.2rem] mb-[1.2rem] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <h4 className="text-[0.95rem] font-bold text-slate-900 mb-[0.9rem]">Detail Agenda</h4>
        <p className="text-[0.8rem] text-slate-400 text-center py-4 m-0">
          Pilih atau tambahkan agenda untuk melihat detail
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-[1.2rem] mb-[1.2rem] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between mb-[0.9rem]">
        <h4 className="text-[0.95rem] font-bold text-slate-900 m-0">Detail Agenda</h4>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(agenda)}
            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-[0.76rem] font-semibold cursor-pointer transition-all hover:bg-slate-50 hover:border-brand-green hover:text-brand-green"
            title="Edit agenda ini"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Judul dan Kategori */}
      <div className="flex items-start justify-between gap-2 mb-[0.9rem]">
        <div className="flex items-start gap-2 flex-1">
          <span className="w-[9px] h-[9px] rounded-full mt-[5px] shrink-0" style={{ backgroundColor: agenda.color || '#2563eb' }}></span>
          <h3 className="text-[0.95rem] font-extrabold text-slate-900 leading-[1.3]">{agenda.title}</h3>
        </div>
        <span 
          className="py-0.5 px-2.5 rounded-full text-[0.72rem] font-semibold shrink-0"
          style={{
            backgroundColor: agenda.color ? `${agenda.color}18` : '#e2e8f0',
            color: agenda.color || '#475569'
          }}
        >
          {agenda.category}
        </span>
      </div>

      {/* Informasi */}
      <div className="flex flex-col gap-2.5 mb-[0.4rem]">
        <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700 leading-[1.35]">
          <Calendar size={15} className="text-slate-600 mt-0.5 shrink-0" />
          <span>{agenda.date || '-'}</span>
        </div>

        <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700 leading-[1.35]">
          <Clock size={15} className="text-slate-600 mt-0.5 shrink-0" />
          <span>{agenda.time ? `${agenda.time} WIB` : '-'}</span>
        </div>

        <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700 leading-[1.35]">
          <MapPin size={15} className="text-slate-600 mt-0.5 shrink-0" />
          <span>{agenda.location || '-'}</span>
        </div>

        <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700 leading-[1.35]">
          <User size={15} className="text-slate-600 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-0.5 text-[0.79rem]">
            <div>PIC &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {agenda.pic || '-'}</div>
            <div>Peserta : {agenda.participants || '-'}</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-[0.8rem] text-slate-700 leading-[1.35]">
          <FileText size={15} className="text-slate-600 mt-0.5 shrink-0" />
          <p className="text-[0.78rem] text-slate-600 leading-[1.4] m-0">{agenda.description || '-'}</p>
        </div>
      </div>
    </div>
  );
}
