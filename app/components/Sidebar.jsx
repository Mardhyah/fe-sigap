'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  X
} from 'lucide-react';

const menuItems = [
  {
    id: 'agenda-lembaga',
    label: 'Agenda Lembaga',
    href: '/',
    icon: <CalendarCheck size={18} />
  },
  {
    id: 'dashboard',
    label: 'Dashboard Agenda',
    href: 'https://sigap.baznasbazisdki.id/',
    icon: <LayoutDashboard size={18} />
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const handleItemClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[90] lg:hidden backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:static top-0 bottom-0 left-0 z-[100] w-[260px] lg:w-[240px] bg-white border-r border-[#e4eaf2] flex flex-col justify-start py-[1.2rem] lg:py-[1.4rem] px-[1rem] shrink-0 h-full max-h-full overflow-y-auto transition-transform duration-200 shadow-2xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        {/* Header Drawer Mobile */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 lg:hidden">
          <span className="text-[0.92rem] font-bold text-slate-900">Menu Navigasi</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-0 bg-transparent cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isExternal = item.href.startsWith('http');
            const isActive = !isExternal && pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className={`flex items-center gap-3 w-full py-2.5 px-3.5 rounded-lg text-[0.88rem] transition-all duration-150 no-underline ${isActive
                  ? 'bg-brand-green text-white font-semibold shadow-[0_2px_4px_rgba(10,92,54,0.2)]'
                  : 'text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900'
                  }`}
                onClick={handleItemClick}
              >
                <span className="flex items-center justify-center w-5 h-5 shrink-0">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
