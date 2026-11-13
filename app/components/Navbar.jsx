import Link from 'next/link';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="w-full h-[68px] bg-white border-b border-[#e4eaf2] flex items-center justify-between px-8 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 min-w-[240px] text-inherit no-underline cursor-pointer">
        <div className="w-[42px] h-[42px] flex items-center justify-center shrink-0">
          <img 
            src="/assets/logo-baznasdki.png" 
            alt="Logo BAZNAS (BAZIS) DKI Jakarta" 
            className="w-full h-full object-contain block"
          />
        </div>
        <div className="flex flex-col">
          <div className="text-[1.05rem] font-extrabold text-[#0d3820] tracking-[-0.3px] leading-[1.15]">
            BAZNAS (BAZIS)
          </div>
          <div className="text-[0.78rem] text-slate-700 font-semibold">
            Provinsi DKI Jakarta
          </div>
        </div>
      </Link>

      {/* Pencarian */}
      <div className="relative flex-1 max-w-[480px] mx-10">
        <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.2} />
        <input 
          type="text" 
          placeholder="Cari agenda kegiatan, lokasi, atau PIC..." 
          className="w-full py-[9px] pr-[14px] pl-[40px] text-[0.83rem] border border-slate-200 rounded-lg bg-white text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
        />
      </div>

      {/* Profil  Notifikasi */}
      <div className="flex items-center gap-6">
        <button className="relative bg-transparent border-0 cursor-pointer text-slate-600 flex items-center justify-center p-1" aria-label="Notifikasi">
          <Bell size={20} strokeWidth={2} />
          <span className="absolute top-[2px] right-1 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white"></span>
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
            <User size={18} color="#cbd5e1" />
          </div>
          <div className="text-left leading-[1.25]">
            <div className="text-[0.86rem] font-bold text-slate-900">Amil</div>
            <div className="text-[0.72rem] text-slate-500">BAZNAS (BAZIS) DKI Jakarta</div>
          </div>
          <ChevronDown className="text-slate-500 ml-0.5" size={14} strokeWidth={2.5} />
        </div>
      </div>
    </header>
  );
}
