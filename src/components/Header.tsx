import React from 'react';
import { FileSpreadsheet, ShieldCheck, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">eMaktab <span className="text-emerald-600">Hisobot</span></span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                1 soniyada
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              O‘zbekiston maktab o‘qituvchilari uchun avtomatlashtirilgan hisobot tizimi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Bepul &amp; Limitsiz</span>
          </div>
        </div>
      </div>
    </header>
  );
};
