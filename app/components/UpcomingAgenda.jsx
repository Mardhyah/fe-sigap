const CATEGORY_BADGE_STYLES = {
  internal: 'bg-slate-100 text-slate-600',
  rapat: 'bg-blue-100 text-blue-600',
  audiensi: 'bg-green-100 text-green-600',
  program: 'bg-amber-100 text-amber-600',
  pertemuan: 'bg-red-100 text-red-600',
  evaluasi: 'bg-purple-100 text-purple-600'
};

export default function UpcomingAgenda({ agendas = [], onSelectAgenda }) {
  const items = agendas;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <h4 className="text-[0.88rem] sm:text-[0.92rem] font-bold text-slate-900 mb-2">Agenda Setelahnya</h4>

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-[0.76rem] text-slate-400 text-center py-2.5">Tidak ada agenda setelahnya</p>
        ) : (
          items.map((item) => {
          const badgeColorClass = CATEGORY_BADGE_STYLES[item.categoryType] || CATEGORY_BADGE_STYLES.internal;
          return (
            <div 
              key={item.id} 
              className="p-2 rounded-lg bg-[#fafbfc] border border-slate-100 cursor-pointer transition-all duration-150 hover:bg-slate-100 hover:border-slate-200"
              onClick={() => onSelectAgenda && onSelectAgenda(item)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-start gap-1.5 flex-1 min-w-0"> 
                  <span className="w-[6px] h-[6px] rounded-full mt-[5px] shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[0.78rem] font-bold text-slate-900 leading-snug break-words">{item.title}</span>
                </div>
                <span className={`py-0.5 px-1.5 rounded-full text-[0.66rem] font-semibold shrink-0 whitespace-nowrap ${badgeColorClass}`}>
                  {item.category}
                </span>
              </div>
              <div className="text-[0.72rem] text-slate-500 pl-[13px]">{item.time}</div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
