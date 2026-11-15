import React from 'react';
import { Download, FileText, CheckCircle, HelpCircle } from 'lucide-react';

export const HowToGuide: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-lg text-slate-900">O‘qituvchilar uchun 3 qadamli yo‘riqnoma</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Step 1 */}
        <div className="flex flex-col items-start p-5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-3">
            1
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-600" />
            eMaktabdan yuklab oling
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            eMaktab tizimiga kiring, jurnalingiz sahifasidagi <b>"Excelga eksport"</b> tugmasini bosib, jurnalingiz faylini (.xls) kompyuteringizga saqlang.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-start p-5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-3">
            2
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            Saytga tashlang
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Yuklab olingan faylni saytning <b>"eMaktab fayllarini yuklash"</b> qutisiga shunchaki tashlang (Drag & Drop) yoki faylni tanlang.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-start p-5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-3">
            3
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Tayyor hisobotni oling!
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tizim ortiqcha kunlik sanalarni avtomatik tozalab, <b>Zavuch (O‘IBDO‘)</b> talab qiladigan tayyor formatlangan .xlsx faylni taqdim etadi.
          </p>
        </div>
      </div>
    </div>
  );
};
