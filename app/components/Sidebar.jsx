'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarCheck 
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
    label: 'Dashboard Monitor', 
    href: '/dashboard',
    icon: <LayoutDashboard size={18} />
  }
];

export default function Sidebar({ activeMenu, onSelectMenu }) {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] bg-white border-r border-[#e4eaf2] flex flex-col justify-start py-[1.4rem] px-[1rem] shrink-0 h-full max-h-full overflow-y-auto">
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (activeMenu && item.id === activeMenu);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 w-full py-2.5 px-3.5 rounded-lg text-[0.88rem] transition-all duration-150 no-underline ${
                isActive 
                  ? 'bg-brand-green text-white font-semibold shadow-[0_2px_4px_rgba(10,92,54,0.2)]' 
                  : 'text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => onSelectMenu && onSelectMenu(item.id)}
            >
              <span className="flex items-center justify-center w-5 h-5 shrink-0">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
