import React from 'react';
import { School, User, GraduationCap, BookOpen, BookmarkCheck } from 'lucide-react';
import type { ReportMeta } from '../utils/excelGenerator';
import type { ReportMode } from './ModeSelector';

interface MetaFormProps {
  meta: ReportMeta;
  onChangeMeta: (updated: Partial<ReportMeta>) => void;
  mode: ReportMode;
}

export const MetaForm: React.FC<MetaFormProps> = ({ meta, onChangeMeta, mode }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
            2
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Maktab va o‘qituvchi ma’lumotlari</h2>
            <p className="text-xs text-slate-500">Ushbu ma’lumotlar Excel hisobotning yuqori va quyi qismlariga avtomatik yoziladi</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Brauzerda avto-saqlanadi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Maktab nomi */}
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-slate-400" />
            Maktab nomi (tuman va raqami)
          </label>
          <input
            type="text"
            value={meta.schoolName}
            onChange={e => onChangeMeta({ schoolName: e.target.value })}
            placeholder="Masalan: Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* O'quv yili */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            O‘quv yili
          </label>
          <input
            type="text"
            value={meta.academicYear}
            onChange={e => onChangeMeta({ academicYear: e.target.value })}
            placeholder="2025-2026"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
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
            placeholder="Masalan: 7-B yoki 11-B"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
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
            placeholder="Masalan: O’zbekiston Tarixi yoki Tarbiya"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Chorak tanlovi */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Chorak / Yarim yillik
          </label>
          {mode === 'quarter' && (
            <select
              value={meta.quarterText}
              onChange={e => onChangeMeta({ quarterText: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            >
              <option value="I chorak">I chorak</option>
              <option value="II chorak">II chorak</option>
              <option value="III chorak">III chorak</option>
              <option value="IIII chorak">IV (IIII) chorak</option>
            </select>
          )}

          {mode === 'half_year' && (
            <select
              value={meta.quarterText}
              onChange={e => onChangeMeta({ quarterText: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            >
              <option value="IvaII chorak">I va II chorak (1-yarim yillik)</option>
              <option value="IIIvaIIII chorak">III va IV chorak (2-yarim yillik)</option>
            </select>
          )}

          {mode === 'annual' && (
            <input
              type="text"
              readOnly
              value="To‘liq Yillik hisobot"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none cursor-not-allowed"
            />
          )}
        </div>

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
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* O'qituvchi */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            O‘qituvchi F.I.Sh.
          </label>
          <input
            type="text"
            value={meta.teacherName}
            onChange={e => onChangeMeta({ teacherName: e.target.value })}
            placeholder="Masalan: S.Shonazarova"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
