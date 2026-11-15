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
      badge: '1 ta fayl',
      desc: 'Tarix, Ona tili va barcha oddiy fanlar uchun (1 ta chorak jurnali yuklanadi).',
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600',
      activeRing: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40'
    },
    {
      id: 'half_year' as ReportMode,
      title: 'Qo‘shma Yarim yillik hisobot',
      badge: '2 ta fayl (I-II yoki III-IV)',
      desc: 'Tarbiya fani kabi 1-chorakda faqat BSB, 2-chorakda ChSB olinadigan fanlarni 1 ta hisobotga birlashtirish.',
      icon: Layers,
      color: 'from-emerald-500 to-teal-600',
      activeRing: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40'
    },
    {
      id: 'annual' as ReportMode,
      title: 'To‘liq Yillik hisobot',
      badge: '2 yoki 4 ta fayl',
      desc: 'Barcha choraklar ballari, o‘rtacha baho, yillik, yakuniy va o‘sish/kamayish dinamikasi hisoboti.',
      icon: Award,
      color: 'from-violet-500 to-purple-600',
      activeRing: 'border-violet-500 ring-2 ring-violet-500/20 bg-violet-50/40'
    },
    {
      id: 'bsb_analysis' as ReportMode,
      title: 'BSB / CHSB tahlili (Topshiriqlar)',
      badge: '1-ish, 2-ish... Foiz',
      desc: 'Topshiriqlar (1-ish, 2-ish...) ballari, Jami va Foiz ko‘rsatkichlari (7A Fizika 1-BSB kabi).',
      icon: FileSpreadsheet,
      color: 'from-amber-500 to-orange-600',
      activeRing: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
          1
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hisobot turini tanlang</h2>
          <p className="text-xs text-slate-500">O‘zingizga kerakli bo‘lgan hisobot yoki tahlil shaklini belgilang</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modes.map(item => {
          const Icon = item.icon;
          const isSelected = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeMode(item.id)}
              className={`relative text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? item.activeRing
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold">
                <span className={isSelected ? 'text-emerald-700' : 'text-slate-400'}>
                  {isSelected ? '✓ Tanlangan' : 'Tanlash uchun bosing'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
