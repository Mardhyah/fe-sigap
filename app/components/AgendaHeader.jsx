import { Plus, Maximize, ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';

export default function AgendaHeader({
  currentDate = '',
  liveClock,
  activeView = 'harian',
  onViewChange,
  onOpenAdd,
  showAddButton = true,
  isMonitorMode = false,
  onExitMonitor,
  onToggleFullscreen,
  onPrevDay,
  onNextDay,
  onToday
}) {
  return (
    <div className="mb-[1.2rem] sm:mb-[1.4rem] shrink-0">
      <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-5 mb-[1rem] sm:mb-[1.35rem] flex-wrap">
        <div className="flex flex-col">
          <h1 className="text-[1.35rem] sm:text-[1.85rem] font-extrabold text-[#0a1d37] tracking-[-0.6px] leading-[1.2]">
            Agenda Harian
          </h1>
          <p className="text-[0.8rem] sm:text-[0.92rem] text-slate-500 font-medium mt-0.5 sm:mt-1">
            Jadwal kegiatan BAZNAS (BAZIS) Provinsi DKI Jakarta
          </p>
        </div>

        {showAddButton && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 bg-brand-green text-white border-0 rounded-lg py-2 px-3.5 sm:px-4 text-[0.8rem] sm:text-[0.85rem] font-bold cursor-pointer shadow-[0_1px_3px_rgba(10,92,54,0.2)] transition-all shrink-0 hover:bg-brand-hover hover:shadow-[0_3px_6px_rgba(10,92,54,0.25)] hover:-translate-y-0.5 active:translate-y-0"
            onClick={onOpenAdd}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Tambah Agenda</span>
          </button>
        )}

        {/* Mode Monitor */}
        {isMonitorMode && (
          <div className="flex items-center gap-2">
            {onToggleFullscreen && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-brand-green text-white border-0 rounded-lg py-[7px] px-[12px] sm:px-[15px] text-[0.78rem] sm:text-[0.82rem] font-bold cursor-pointer transition-all shadow-[0_1px_3px_rgba(10,92,54,0.2)] shrink-0 hover:bg-brand-hover hover:-translate-y-0.5"
                onClick={onToggleFullscreen}
                title="Aktifkan mode layar penuh (F11)"
              >
                <Maximize size={15} strokeWidth={2.2} />
                <span>Layar Penuh</span>
              </button>
            )}

            {onExitMonitor && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-white text-slate-600 border border-slate-300 rounded-lg py-[7px] px-3 sm:px-3.5 text-[0.78rem] sm:text-[0.82rem] font-semibold cursor-pointer transition-all shadow-[0_1px_2px_rgba(15,23,42,0.04)] shrink-0 hover:bg-slate-50 hover:text-brand-green hover:border-brand-green"
                onClick={onExitMonitor}
                title="Kembali ke tampilan menu admin"
              >
                <ChevronLeft size={15} strokeWidth={2.2} />
                <span>Kembali</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between flex-wrap gap-2.5 sm:gap-4">
        {/* Tanggal & Waktu */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center justify-center cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:bg-slate-50 hover:border-slate-300 shrink-0"
            aria-label="Sebelumnya"
            onClick={onPrevDay}
          >
            <ChevronLeft size={15} strokeWidth={2.5} />
          </button>

          <button className="flex items-center gap-2 sm:gap-2.5 h-[34px] sm:h-[38px] px-2.5 sm:px-3.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-[0.78rem] sm:text-[0.88rem] font-bold cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-slate-300 shrink-0">
            <Calendar size={14} strokeWidth={2} className="text-brand-green shrink-0" />
            <span className="tracking-[-0.2px] truncate max-w-[130px] sm:max-w-none">{currentDate}</span>

            {/* Jam */}
            {liveClock && (
              <span className="inline-flex items-center gap-1.5 border-l border-slate-200 pl-2">
                <span className="text-[0.76rem] sm:text-[0.86rem] font-bold text-brand-green tracking-[0.3px] tabular-nums whitespace-nowrap">
                  {liveClock} WIB
                </span>
              </span>
            )}

            <ChevronDown size={14} strokeWidth={2} className="text-slate-500 shrink-0 ml-0.5 hidden sm:block" />
          </button>

          <button
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center justify-center cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:bg-slate-50 hover:border-slate-300 shrink-0"
            aria-label="Selanjutnya"
            onClick={onNextDay}
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>

          <button
            className="h-[34px] sm:h-[38px] px-2.5 sm:px-3.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-[0.78rem] sm:text-[0.85rem] font-semibold cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:bg-slate-50 shrink-0"
            onClick={onToday}
          >
            Hari ini
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 border border-slate-200 p-[3px] rounded-lg shrink-0 w-full sm:w-auto">
          <button
            className={`flex-1 sm:flex-initial py-[6px] sm:py-[7px] px-3 sm:px-[18px] rounded-md border-0 text-[0.78rem] sm:text-[0.85rem] cursor-pointer transition-all text-center ${activeView === 'harian'
              ? '!bg-brand-green !text-white font-bold shadow-[0_1px_3px_rgba(10,92,54,0.25)]'
              : 'bg-transparent text-slate-600 font-medium hover:text-slate-900'
              }`}
            onClick={() => onViewChange && onViewChange('harian')}
          >
            Harian
          </button>
          <button
            className={`flex-1 sm:flex-initial py-[6px] sm:py-[7px] px-3 sm:px-[18px] rounded-md border-0 text-[0.78rem] sm:text-[0.85rem] cursor-pointer transition-all text-center ${activeView === 'bulanan'
              ? '!bg-brand-green !text-white font-bold shadow-[0_1px_3px_rgba(10,92,54,0.25)]'
              : 'bg-transparent text-slate-600 font-medium hover:text-slate-900'
              }`}
            onClick={() => onViewChange && onViewChange('bulanan')}
          >
            Bulanan
          </button>
        </div>
      </div>
    </div>
  );
}
