import Link from 'next/link';
import { Lock, Monitor } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full bg-[#f0f5fa] flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-8 text-center">
        <div className="flex justify-center mb-5">
          <img
            src="/assets/logo-baznasdki.png"
            alt="Logo BAZNAS (BAZIS) DKI Jakarta"
            className="w-14 h-14 object-contain"
          />
        </div>

        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-emerald-50 text-brand-green">
          <Lock size={22} />
        </div>

        <h1 className="text-[1.25rem] font-extrabold text-[#0a1d37] mb-2">
          Autentikasi Diperlukan
        </h1>
        <p className="text-[0.86rem] text-slate-600 leading-relaxed mb-6">
          Silakan masuk melalui Portal SSO BAZNAS (BAZIS) DKI Jakarta untuk mengakses CMS Agenda Pimpinan.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-[0.84rem] font-semibold no-underline hover:bg-slate-100 transition-colors"
        >
          <Monitor size={16} />
          <span>Buka Dashboard Monitor</span>
        </Link>
      </div>
    </div>
  );
}
