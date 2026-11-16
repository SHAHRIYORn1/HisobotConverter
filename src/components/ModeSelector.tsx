import React from 'react';
import { Calendar, Layers, Award, FileSpreadsheet } from 'lucide-react';

export type ReportMode = 'quarter' | 'half_year' | 'annual' | 'bsb_analysis';

interface ModeSelectorProps {
  mode: ReportMode;
  onChangeMode: (newMode: ReportMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onChangeMode }) => {
  const modes = [
    {
      id: 'quarter' as ReportMode,
      title: 'Oddiy Choraklik hisobot',
      shortTitle: 'Choraklik hisobot',
      badge: '1 ta fayl',
      desc: 'Tarix, Ona tili va barcha oddiy fanlar',
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      activeRing: 'border-blue-500 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
    },
    {
      id: 'half_year' as ReportMode,
      title: 'Qo‘shma Yarim yillik hisobot',
      shortTitle: 'Yarim yillik hisobot',
      badge: '2 ta fayl (I-II / III-IV)',
      desc: 'Tarbiya fani kabi 1-BSB va 2-ChSB fanlari',
      icon: Layers,
      color: 'from-emerald-500 to-teal-600',
      activeRing: 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
    },
    {
      id: 'annual' as ReportMode,
      title: 'To‘liq Yillik hisobot',
      shortTitle: 'Yillik hisobot',
      badge: '2 yoki 4 ta fayl',
      desc: 'Yillik baho, o‘rtacha va o‘sish dinamikasi',
      icon: Award,
      color: 'from-violet-500 to-purple-600',
      activeRing: 'border-violet-500 bg-violet-50/50 shadow-xs ring-2 ring-violet-500/20'
    },
    {
      id: 'bsb_analysis' as ReportMode,
      title: 'BSB / CHSB tahlili (Topshiriqlar)',
      shortTitle: 'BSB / CHSB tahlili',
      badge: '1-ish, 2-ish... Foiz',
      desc: 'Topshiriqlar ballari, Jami va Foiz tahlili',
      icon: FileSpreadsheet,
      color: 'from-amber-500 to-orange-600',
      activeRing: 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
            ★
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Kerakli hisobot turini tanlang
            </h2>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Kerakli rejimga bosing
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {modes.map(item => {
          const Icon = item.icon;
          const isSelected = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeMode(item.id)}
              className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? item.activeRing
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal hidden sm:block">
                  {item.desc}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center text-[11px] font-semibold">
                <span className={isSelected ? 'text-emerald-700 font-bold' : 'text-slate-400 font-normal'}>
                  {isSelected ? '✓ Tanlangan' : 'Tanlash'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
