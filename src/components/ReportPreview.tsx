import React from 'react';
import { Download, FileSpreadsheet, UserPlus, Trash2, Edit3, FilterX, ArrowDownAZ } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ReportMeta } from '../utils/excelGenerator';
import type { ParsedQuarterData, StudentScore } from '../utils/emaktabParser';
import type { ReportMode } from './ModeSelector';

interface ReportPreviewProps {
  mode: ReportMode;
  meta: ReportMeta;
  parsedDataList: (ParsedQuarterData | null)[];
  onDownload: () => Promise<void>;
  onUpdateStudents: (slotIdx: number, updatedStudents: StudentScore[]) => void;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
  isGenerating: boolean;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  mode,
  meta,
  parsedDataList,
  onDownload,
  onUpdateStudents,
  onShowToast,
  isGenerating
}) => {
  const isReady =
    mode === 'quarter'
      ? parsedDataList[0] !== null
      : mode === 'half_year'
      ? parsedDataList[0] !== null && parsedDataList[1] !== null
      : parsedDataList[0] !== null && (parsedDataList[1] !== null || parsedDataList.filter(Boolean).length >= 1);

  if (!isReady) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Hisobot tayyorlash uchun fayl yuklang</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Yuqoridagi 3-qadamda eMaktab faylini tanlang. Tizim avtomatik tahlil qilib, shu yerda hisobotni jonli ko‘rsatadi.
        </p>
      </div>
    );
  }

  const handleDownloadClick = async () => {
    try {
      await onDownload();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const activeData = parsedDataList[0];
  const students = activeData?.students || [];

  // 1. Remove 0-score students (0 va 0 olganlarni tozalash)
  const handleRemoveZeroScores = () => {
    if (!activeData) return;
    const initialCount = students.length;
    // Filter out students who have 0 total score or 0 in both BSB & ChSB
    const filtered = students.filter(st => {
      const bsb = st.totalBsb ?? 0;
      const chsb = st.chsb ?? 0;
      const total = st.totalScore ?? 0;
      // If student has strictly 0 or empty across bsb, chsb, totalScore
      return !(total === 0 || (bsb === 0 && chsb === 0 && (st.fb === 0 || st.fb === null)));
    }).map((s, i) => ({ ...s, index: i + 1 }));

    const removedCount = initialCount - filtered.length;
    if (removedCount === 0) {
      onShowToast?.("Ro‘yxatda 0 balli o‘quvchilar topilmadi.", "info", "Ma'lumot");
      return;
    }

    onUpdateStudents(0, filtered);
    onShowToast?.(`${removedCount} nafar 0 balli o‘quvchilar ro‘yxatdan tozalandi!`, "success", "Tozalandi");
  };

  // 2. Sort students alphabetically (A dan Z gacha harf bo'yicha tartiblash)
  const handleSortAlphabetically = () => {
    if (!activeData || students.length === 0) return;
    const sorted = [...students].sort((a, b) => {
      return a.fullName.localeCompare(b.fullName, 'uz', { sensitivity: 'base' });
    }).map((s, i) => ({ ...s, index: i + 1 }));

    onUpdateStudents(0, sorted);
    onShowToast?.("O‘quvchilar alifbo bo‘yicha (A-Z) tartiblandi!", "success", "Tartiblandi");
  };

  // Student editing helpers for Quarter mode
  const handleScoreChange = (
    studentIdx: number,
    field: 'fullName' | 'bsb' | 'chsb' | 'fb',
    val: string
  ) => {
    if (!activeData) return;
    const updated = students.map((st, i) => {
      if (i !== studentIdx) return st;

      const newSt = { ...st };
      if (field === 'fullName') {
        newSt.fullName = val;
      } else {
        const num = val === '' ? 0 : parseFloat(val) || 0;
        if (field === 'bsb') {
          newSt.totalBsb = num;
          if (newSt.bsbScores.length > 0) {
            newSt.bsbScores[0].score = num;
          } else {
            newSt.bsbScores = [{ label: 'BSB(50)', maxBall: 50, score: num }];
          }
        } else if (field === 'chsb') {
          newSt.chsb = num;
        } else if (field === 'fb') {
          newSt.fb = num;
        }

        // Recalculate total score
        const bsb = newSt.totalBsb ?? (newSt.bsbScores[0]?.score ?? 0);
        const chsb = newSt.chsb ?? 0;
        const fb = newSt.fb ?? 0;
        const total = bsb + chsb + fb;
        newSt.totalScore = total;

        // Recalculate quarter grade
        if (total >= 86) newSt.quarterGrade = 5;
        else if (total >= 71) newSt.quarterGrade = 4;
        else if (total >= 56) newSt.quarterGrade = 3;
        else newSt.quarterGrade = 2;
      }
      return newSt;
    });

    onUpdateStudents(0, updated);
  };

  const handleAddStudent = () => {
    if (!activeData) return;
    const newStudent: StudentScore = {
      index: students.length + 1,
      fullName: "Yangi O'quvchi",
      bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: 0 }],
      totalBsb: 0,
      chsb: 0,
      fb: 0,
      totalScore: 0,
      quarterGrade: 2
    };
    onUpdateStudents(0, [...students, newStudent]);
    onShowToast?.("Yangi o‘quvchi qatori qo‘shildi", "info");
  };

  const handleDeleteStudent = (index: number) => {
    if (!activeData) return;
    const updated = students.filter((_, i) => i !== index).map((s, i) => ({ ...s, index: i + 1 }));
    onUpdateStudents(0, updated);
  };

  // Prepare table data for preview
  let studentsCount = 0;
  let grade5Count = 0;
  let grade4Count = 0;
  let grade3Count = 0;
  let grade2Count = 0;

  if (mode === 'quarter' && parsedDataList[0]) {
    const list = parsedDataList[0].students;
    studentsCount = list.length;
    grade5Count = list.filter(s => s.quarterGrade === 5).length;
    grade4Count = list.filter(s => s.quarterGrade === 4).length;
    grade3Count = list.filter(s => s.quarterGrade === 3).length;
    grade2Count = list.filter(s => s.quarterGrade === 2).length;
  } else if (mode === 'half_year' && parsedDataList[0] && parsedDataList[1]) {
    const q1 = parsedDataList[0].students;
    const q2Map = new Map(parsedDataList[1].students.map(s => [s.fullName.trim().toLowerCase(), s]));
    studentsCount = q1.length;
    q1.forEach((s1, idx) => {
      const s2 = q2Map.get(s1.fullName.trim().toLowerCase()) || parsedDataList[1]!.students[idx];
      const bsb = s1.totalBsb ?? (s1.bsbScores[0]?.score ?? 0);
      const chsb = s2 ? (s2.chsb ?? 0) : 0;
      const fb = s2 ? (s2.fb ?? 0) : 0;
      const total = bsb + chsb + fb;
      let g = 2;
      if (total >= 86) g = 5;
      else if (total >= 71) g = 4;
      else if (total >= 56) g = 3;

      if (g === 5) grade5Count++;
      else if (g === 4) grade4Count++;
      else if (g === 3) grade3Count++;
      else grade2Count++;
    });
  } else if (parsedDataList[0]) {
    const list = parsedDataList[0].students;
    studentsCount = list.length;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top action bar */}
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-slate-900 text-lg">Hisobot muvaffaqiyatli shakllantirildi!</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Jami {studentsCount} nafar o‘quvchi</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" />
              Jadval ichida har bir ballni tahrirlashingiz mumkin
            </span>
          </p>
        </div>

        {/* Action Buttons: 0 tozalash, Alifbo tartiblash, O'quvchi qo'shish, Yuklab olish */}
        <div className="flex flex-wrap items-center gap-2">
          {mode === 'quarter' && (
            <>
              {/* Button 1: 0 balli o'quvchilarni tozalash */}
              <button
                onClick={handleRemoveZeroScores}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                title="BSB va ChSB ballari 0 bo‘lgan o‘quvchilarni ro‘yxatdan avtomatik tozalash"
              >
                <FilterX className="w-3.5 h-3.5 text-amber-600" />
                <span>0 ballilarni tozalash</span>
              </button>

              {/* Button 2: Alifbo bo'yicha tartiblash */}
              <button
                onClick={handleSortAlphabetically}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                title="O‘quvchilarni familiyasi bo‘yicha alifbo (A-Z) tartibida joylashtirish"
              >
                <ArrowDownAZ className="w-3.5 h-3.5 text-blue-600" />
                <span>Alifbo bo‘yicha (A-Z)</span>
              </button>

              {/* Button 3: O'quvchi qo'shish */}
              <button
                onClick={handleAddStudent}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                <span>+ O‘quvchi</span>
              </button>
            </>
          )}

          {/* Button 4: Download Excel */}
          <button
            onClick={handleDownloadClick}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Yuklanmoqda...' : 'Excel yuklab olish (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Paper */}
      <div className="p-6 overflow-x-auto bg-slate-50/50">
        <div className="min-w-[760px] bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-slate-800 font-serif">
          {/* Paper Header */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold uppercase tracking-wide text-slate-900">
              {meta.schoolName || "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab"}
            </h3>
            <p className="text-sm font-medium text-slate-700 mt-1">
              {meta.gradeName} -sinf "{meta.subjectName}" fanidan {meta.academicYear}-o'quv yili {meta.quarterText} natijalari
            </p>
          </div>

          {/* Table preview (Mode 1: Editable inputs) */}
          {mode === 'quarter' && parsedDataList[0] && (
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900">
                  <th className="border border-slate-400 p-2 text-center w-10">#</th>
                  <th className="border border-slate-400 p-2 text-left">F.I.Sh.</th>
                  <th className="border border-slate-400 p-2 text-center w-24">BSB(50)</th>
                  <th className="border border-slate-400 p-2 text-center w-24">ChSB(40)</th>
                  <th className="border border-slate-400 p-2 text-center w-20">FB(10)</th>
                  <th className="border border-slate-400 p-2 text-center w-28">Jami ball(100)</th>
                  <th className="border border-slate-400 p-2 text-center w-28">Choraklik baho</th>
                  <th className="border border-slate-400 p-2 text-center w-12 print:hidden">Amal</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 group">
                    <td className="border border-slate-300 p-1 text-center font-sans text-slate-500">{i + 1}</td>
                    
                    {/* Editable Full Name */}
                    <td className="border border-slate-300 p-1">
                      <input
                        type="text"
                        value={st.fullName}
                        onChange={e => handleScoreChange(i, 'fullName', e.target.value)}
                        className="w-full px-2 py-1 font-serif text-slate-900 bg-transparent hover:bg-emerald-50/40 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded border-none outline-none font-medium text-xs transition-colors"
                      />
                    </td>

                    {/* Editable BSB */}
                    <td className="border border-slate-300 p-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={st.totalBsb ?? (st.bsbScores[0]?.score ?? 0)}
                        onChange={e => handleScoreChange(i, 'bsb', e.target.value)}
                        className="w-16 px-1 py-1 font-sans text-center text-slate-900 bg-transparent hover:bg-emerald-50/40 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded border-none outline-none text-xs transition-colors"
                      />
                    </td>

                    {/* Editable ChSB */}
                    <td className="border border-slate-300 p-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={st.chsb ?? 0}
                        onChange={e => handleScoreChange(i, 'chsb', e.target.value)}
                        className="w-16 px-1 py-1 font-sans text-center text-slate-900 bg-transparent hover:bg-emerald-50/40 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded border-none outline-none text-xs transition-colors"
                      />
                    </td>

                    {/* Editable FB */}
                    <td className="border border-slate-300 p-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={st.fb ?? 0}
                        onChange={e => handleScoreChange(i, 'fb', e.target.value)}
                        className="w-14 px-1 py-1 font-sans text-center text-slate-900 bg-transparent hover:bg-emerald-50/40 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded border-none outline-none text-xs transition-colors"
                      />
                    </td>

                    {/* Auto Total Score */}
                    <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 font-sans">
                      {st.totalScore ?? 0}
                    </td>

                    {/* Auto Grade */}
                    <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        st.quarterGrade === 5
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.quarterGrade === 4
                          ? 'bg-blue-100 text-blue-800'
                          : st.quarterGrade === 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {st.quarterGrade ?? 2}
                      </span>
                    </td>

                    {/* Delete action */}
                    <td className="border border-slate-300 p-1 text-center print:hidden">
                      <button
                        onClick={() => handleDeleteStudent(i)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all cursor-pointer"
                        title="O'quvchini o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Summary rows */}
                <tr className="bg-slate-100 font-bold font-sans">
                  <td colSpan={2} className="border border-slate-400 p-2 text-left font-serif">Jami:</td>
                  <td className="border border-slate-400 p-2 text-center">
                    {students.reduce((acc, s) => acc + (s.totalBsb || 0), 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    {students.reduce((acc, s) => acc + (s.chsb || 0), 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    {students.reduce((acc, s) => acc + (s.fb || 0), 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-slate-900">
                    {students.reduce((acc, s) => acc + (s.totalScore || 0), 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-slate-900">
                    {students.reduce((acc, s) => acc + (s.quarterGrade || 0), 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center print:hidden"></td>
                </tr>

                <tr className="bg-slate-50 font-bold font-sans">
                  <td colSpan={2} className="border border-slate-400 p-2 text-left font-serif">O'rtacha:</td>
                  <td className="border border-slate-400 p-2 text-center">
                    {studentsCount > 0 ? (students.reduce((acc, s) => acc + (s.totalBsb || 0), 0) / studentsCount).toFixed(1) : 0}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    {studentsCount > 0 ? (students.reduce((acc, s) => acc + (s.chsb || 0), 0) / studentsCount).toFixed(1) : 0}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    {studentsCount > 0 ? (students.reduce((acc, s) => acc + (s.fb || 0), 0) / studentsCount).toFixed(1) : 0}
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-slate-900">
                    {studentsCount > 0 ? (students.reduce((acc, s) => acc + (s.totalScore || 0), 0) / studentsCount).toFixed(1) : 0}
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-slate-900">
                    {studentsCount > 0 ? (students.reduce((acc, s) => acc + (s.quarterGrade || 0), 0) / studentsCount).toFixed(1) : 0}
                  </td>
                  <td className="border border-slate-400 p-2 text-center print:hidden"></td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Table preview for Mode 2 */}
          {mode === 'half_year' && parsedDataList[0] && parsedDataList[1] && (
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900">
                  <th className="border border-slate-400 p-2 text-center w-10">#</th>
                  <th className="border border-slate-400 p-2 text-left">F.I.Sh.</th>
                  <th className="border border-slate-400 p-2 text-center">BSB(50) 1-CHORAK</th>
                  <th className="border border-slate-400 p-2 text-center">CHSB(40) 2-CHORAK</th>
                  <th className="border border-slate-400 p-2 text-center">FB(10)</th>
                  <th className="border border-slate-400 p-2 text-center">Jami ball(100)</th>
                  <th className="border border-slate-400 p-2 text-center">Choraklik baho</th>
                </tr>
              </thead>
              <tbody>
                {parsedDataList[0].students.slice(0, 8).map((s1, idx) => {
                  const s2 = parsedDataList[1]!.students.find(s => s.fullName.trim().toLowerCase() === s1.fullName.trim().toLowerCase()) || parsedDataList[1]!.students[idx];
                  const bsb = s1.totalBsb ?? (s1.bsbScores[0]?.score ?? 0);
                  const chsb = s2 ? (s2.chsb ?? 0) : 0;
                  const fb = s2 ? (s2.fb ?? 0) : 0;
                  const total = bsb + chsb + fb;
                  let g = 2;
                  if (total >= 86) g = 5;
                  else if (total >= 71) g = 4;
                  else if (total >= 56) g = 3;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-1.5 text-center font-sans">{idx + 1}</td>
                      <td className="border border-slate-300 p-1.5 font-medium text-slate-900">{s1.fullName}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-sans">{bsb}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-sans">{chsb}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-sans">{fb}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 font-sans">{total}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 font-sans">{g}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Table preview for Mode 3 */}
          {mode === 'annual' && parsedDataList[0] && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <p className="text-sm font-semibold text-slate-800">
                Yillik hisobot tuzilmasi tayyorlandi ({parsedDataList[0].students.length} ta o‘quvchi)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Jadvalda 4 chorak ballari, Yillik, Imtihon, Yakuniy baholar, Jami o‘rtacha va O‘sish/kamayish dinamikasi to‘liq hisoblandi.
              </p>
            </div>
          )}

          {/* Bottom Statistics & Signatures (Exactly as in User Screenshot 2) */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div>
              <p className="font-bold text-slate-900 mb-2 font-serif">Jami baholar statistikasi:</p>
              <div className="space-y-1 text-slate-700 font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-20 font-medium">"5" baholar:</span>
                  <span className="font-bold text-emerald-700">{grade5Count} ta o‘quvchi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 font-medium">"4" baholar:</span>
                  <span className="font-bold text-blue-700">{grade4Count} ta o‘quvchi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 font-medium">"3" baholar:</span>
                  <span className="font-bold text-amber-700">{grade3Count} ta o‘quvchi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 font-medium">"2" baholar:</span>
                  <span className="font-bold text-red-700">{grade2Count} ta o‘quvchi</span>
                </div>
              </div>
            </div>

            {/* Signature Area (User Screenshot 2: O'IBDO' : _________ A.Berdiyeva) */}
            <div className="flex flex-col justify-center space-y-4 font-serif">
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-bold text-slate-900 min-w-[90px]">O‘IBDO‘ :</span>
                <span className="w-32 border-b border-slate-800 inline-block h-4"></span>
                <span className="font-medium text-slate-800 min-w-[110px] text-left">
                  {meta.zavuchName || 'A.Berdiyeva'}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-bold text-slate-900 min-w-[90px]">O‘qituvchi :</span>
                <span className="w-32 border-b border-slate-800 inline-block h-4"></span>
                <span className="font-medium text-slate-800 min-w-[110px] text-left">
                  {meta.teacherName || 'M.Nazarova'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
