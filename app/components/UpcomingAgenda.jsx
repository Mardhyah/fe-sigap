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
    <div className="bg-white border border-slate-200 rounded-xl p-[1.2rem] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <h4 className="text-[0.95rem] font-bold text-slate-900 mb-[0.9rem]">Agenda Setelahnya</h4>

      <div className="flex flex-col gap-2.5">
        {items.length === 0 ? (
          <p className="text-[0.8rem] text-slate-400 text-center py-3">Tidak ada agenda setelahnya</p>
        ) : (
          items.map((item) => {
          const badgeColorClass = CATEGORY_BADGE_STYLES[item.categoryType] || CATEGORY_BADGE_STYLES.internal;
          return (
            <div 
              key={item.id} 
              className="p-[8px_10px] rounded-lg bg-[#fafbfc] border border-slate-100 cursor-pointer transition-all duration-150 hover:bg-slate-100 hover:border-slate-200"
              onClick={() => onSelectAgenda && onSelectAgenda(item)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-start gap-2 flex-1">
                  <span className="w-[7px] h-[7px] rounded-full mt-[5px] shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[0.8rem] font-bold text-slate-900 leading-[1.25]">{item.title}</span>
                </div>
                <span 
                  className="py-0.5 px-2 rounded-full text-[0.68rem] font-semibold shrink-0"
                  style={{
                    backgroundColor: item.color ? `${item.color}18` : '#e2e8f0',
                    color: item.color || '#475569'
                  }}
                >
                  {item.category}
                </span>
              </div>
              <div className="text-[0.74rem] text-slate-500 pl-[15px]">{item.time}</div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
