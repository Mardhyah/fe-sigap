'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, User, ChevronDown, X, Calendar, Clock, MapPin } from 'lucide-react';

export default function Navbar({
  agendas = [],
  searchQuery = '',
  onSearchChange,
  onSelectAgenda
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.email) {
          setUserEmail(data.email);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return agendas.filter((a) =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.location && a.location.toLowerCase().includes(q)) ||
      (a.pic && a.pic.toLowerCase().includes(q)) ||
      (a.participants && a.participants.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [agendas, searchQuery]);

  const handleSelect = (item) => {
    if (onSelectAgenda) onSelectAgenda(item);
    setIsOpen(false);
  };

  return (
    <header className="w-full h-[68px] bg-white border-b border-[#e4eaf2] flex items-center justify-between px-8 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 shrink-0 text-inherit no-underline cursor-pointer">
        <div className="w-[40px] h-[40px] flex items-center justify-center shrink-0">
          <img 
            src="/assets/logo-baznasdki.png" 
            alt="Logo BAZNAS (BAZIS) DKI Jakarta" 
            className="w-full h-full object-contain block"
          />
        </div>
        <img 
          src="/assets/logo-sigap.png" 
          alt="Logo SIGAP" 
          className="h-[36px] w-auto object-contain block"
        />
      </Link>

      {/* Pencarian */}
      <div ref={searchRef} className="relative flex-1 max-w-[480px] mx-10">
        <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={2.2} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => {
            if (onSearchChange) onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (searchQuery.trim()) setIsOpen(true);
          }}
          placeholder="Cari agenda kegiatan, lokasi, atau PIC..." 
          className="w-full py-[9px] pr-[36px] pl-[40px] text-[0.83rem] border border-slate-200 rounded-lg bg-white text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10"
        />

        {searchQuery && (
          <button 
            type="button" 
            onClick={() => {
              if (onSearchChange) onSearchChange('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={14} />
          </button>
        )}

        {/* Dropdown Hasil Pencarian */}
        {isOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl shadow-[0_12px_30px_-4px_rgba(15,23,42,0.15)] border border-slate-200 py-2 z-[100] max-h-[380px] overflow-y-auto">
            <div className="px-3.5 py-1 text-[0.72rem] font-bold text-slate-400 uppercase tracking-wider">
              Hasil Pencarian ({results.length})
            </div>

            {results.length > 0 ? (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="px-3.5 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.84rem] font-semibold text-slate-900 leading-snug truncate">
                      {item.title}
                    </span>
                    {item.category && (
                      <span 
                        className="text-[0.66rem] font-bold py-0.5 px-2 rounded shrink-0"
                        style={{ 
                          backgroundColor: `${item.color || '#2563eb'}18`, 
                          color: item.color || '#2563eb' 
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[0.73rem] text-slate-500 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400 shrink-0" />
                      <span>{item.date}</span>
                    </span>
                    {item.time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>{item.time}</span>
                      </span>
                    )}
                    {item.location && item.location !== '-' && (
                      <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-[0.82rem] text-slate-500">
                Tidak ada agenda yang cocok dengan kata kunci &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
            <User size={18} color="#cbd5e1" />
          </div>
          <div className="text-left leading-[1.25]">
            <div className="text-[0.86rem] font-bold text-slate-900 truncate max-w-[190px]" title={userEmail}>
              {userEmail}
            </div>
            <div className="text-[0.72rem] text-slate-500">BAZNAS (BAZIS) DKI Jakarta</div>
          </div>
          <ChevronDown className="text-slate-500 ml-0.5" size={14} strokeWidth={2.5} />
        </div>
      </div>
    </header>
  );
}
