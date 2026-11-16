import React, { useState } from 'react';
import { School, User, GraduationCap, BookOpen, BookmarkCheck, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { ReportMeta } from '../utils/excelGenerator';
import type { ReportMode } from './ModeSelector';

interface MetaFormProps {
  meta: ReportMeta;
  onChangeMeta: (updated: Partial<ReportMeta>) => void;
  mode: ReportMode;
}

export const MetaForm: React.FC<MetaFormProps> = ({ meta, onChangeMeta, mode }) => {
  const isBsb = mode === 'bsb_analysis';
  const [isOpen, setIsOpen] = useState(true);
  const [isCustomYear, setIsCustomYear] = useState(
    meta.academicYear !== '2026-2027' && meta.academicYear !== '2025-2026' && meta.academicYear !== '2024-2025' && Boolean(meta.academicYear)
  );

  const titleString = isBsb
    ? `${meta.gradeName || '7-A'}-sinf  ${meta.subjectName || 'Fizika'}  fanidan  ${meta.quarterText || '1-chorak'}  ${meta.bsbType || '1-BSB'}  tahlili natijalari`
    : `${meta.gradeName || 'Sinf'} -sinf "${meta.subjectName || 'Fan'}" fanidan ${meta.academicYear || '2026-2027'}-o'quv yili ${meta.quarterText} natijalari`;

  const handleYearChange = (val: string) => {
    if (val === 'custom') {
      setIsCustomYear(true);
    } else {
      setIsCustomYear(false);
      onChangeMeta({ academicYear: val });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      {/* Header bar with toggle */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
            1
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              Maktab, Sinf va O‘qituvchi ma’lumotlari
              <span className="text-[11px] font-normal text-slate-500 hidden md:inline">
                (O‘quv yili: {meta.academicYear || '2026-2027'})
              </span>
            </h2>
            <p className="text-xs text-slate-500 line-clamp-1">
              {meta.schoolName || 'Maktab nomi'} • {meta.gradeName || 'Sinf'} • {meta.subjectName || 'Fan'} • {meta.teacherName || 'O‘qituvchi'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
            <BookmarkCheck className="w-3 h-3" />
            Avto-saqlanadi
          </span>
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Toggle section"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sarlavha ko'rinishi (preview banner) */}
      <div className="px-4 sm:px-6 py-2.5 bg-emerald-50/40 border-y border-emerald-100/60 flex items-center gap-2 text-xs">
        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-semibold text-slate-500 shrink-0">Excel sarlavhasi:</span>
        <span className="font-bold text-slate-900 truncate">
          {titleString}
        </span>
      </div>

      {/* Form Fields */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Maktab nomi */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-400" />
                Maktab nomi (tuman va raqami)
              </label>
              <input
                type="text"
                value={meta.schoolName}
                onChange={e => onChangeMeta({ schoolName: e.target.value })}
                placeholder="Masalan: Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* O'quv yili (Quick Select: 2026-2027 Default) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                O‘quv yili
              </label>
              <div className="space-y-1.5">
                <select
                  value={isCustomYear ? 'custom' : (meta.academicYear || '2026-2027')}
                  onChange={e => handleYearChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="2026-2027">2026-2027 (Joriy yil)</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="custom">Boshqa yil (qo‘lda yozish)...</option>
                </select>

                {isCustomYear && (
                  <input
                    type="text"
                    value={meta.academicYear}
                    onChange={e => onChangeMeta({ academicYear: e.target.value })}
                    placeholder="Masalan: 2026-2027"
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                )}
              </div>
            </div>

            {/* Sinf */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Sinf
              </label>
              <input
                type="text"
                value={meta.gradeName}
                onChange={e => onChangeMeta({ gradeName: e.target.value })}
                placeholder="Masalan: 7-A yoki 10-B"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Fan nomi */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Fan nomi
              </label>
              <input
                type="text"
                value={meta.subjectName}
                onChange={e => onChangeMeta({ subjectName: e.target.value })}
                placeholder="Masalan: O‘zbekiston tarixi, Fizika..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Chorak va Baholash turi */}
            {isBsb ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Chorak
                  </label>
                  <select
                    value={meta.quarterText || '1-chorak'}
                    onChange={e => onChangeMeta({ quarterText: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="1-chorak">1-chorak</option>
                    <option value="2-chorak">2-chorak</option>
                    <option value="3-chorak">3-chorak</option>
                    <option value="4-chorak">4-chorak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Baholash turi
                  </label>
                  <select
                    value={meta.bsbType || '1-BSB'}
                    onChange={e => onChangeMeta({ bsbType: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="1-BSB">1-BSB</option>
                    <option value="2-BSB">2-BSB</option>
                    <option value="3-BSB">3-BSB</option>
                    <option value="ChSB">ChSB</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Chorak / Yarim yillik
                </label>
                {mode === 'quarter' && (
                  <select
                    value={meta.quarterText || 'I chorak'}
                    onChange={e => onChangeMeta({ quarterText: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="I chorak">I chorak</option>
                    <option value="II chorak">II chorak</option>
                    <option value="III chorak">III chorak</option>
                    <option value="IV chorak">IV chorak</option>
                  </select>
                )}

                {mode === 'half_year' && (
                  <select
                    value={meta.quarterText || 'IvaII chorak'}
                    onChange={e => onChangeMeta({ quarterText: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="IvaII chorak">I va II chorak (1-yarim yillik)</option>
                    <option value="IIIvaIV chorak">III va IV chorak (2-yarim yillik)</option>
                  </select>
                )}

                {mode === 'annual' && (
                  <input
                    type="text"
                    readOnly
                    value="To‘liq Yillik hisobot"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none cursor-not-allowed"
                  />
                )}
              </div>
            )}

            {/* O'IBDO' Zavuch */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                O‘IBDO‘ (Zavuch) F.I.Sh.
              </label>
              <input
                type="text"
                value={meta.zavuchName}
                onChange={e => onChangeMeta({ zavuchName: e.target.value })}
                placeholder="Masalan: A.Berdiyeva"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* O'qituvchi */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                O‘qituvchi F.I.Sh.
              </label>
              <input
                type="text"
                value={meta.teacherName}
                onChange={e => onChangeMeta({ teacherName: e.target.value })}
                placeholder="Masalan: S.Shonazarova"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
