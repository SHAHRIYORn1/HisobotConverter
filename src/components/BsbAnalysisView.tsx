import React from 'react';
import { Download, Plus, Trash2, FilterX, ArrowDownAZ, Sparkles, Dices, FileSpreadsheet } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ReportMeta } from '../utils/excelGenerator';
import { generateBsbAnalysisExcel } from '../utils/excelGenerator';
import type { BsbAnalysisData, BsbStudentRow } from '../utils/sampleData';
import { sampleBsbAnalysisData } from '../utils/sampleData';

interface BsbAnalysisViewProps {
  meta: ReportMeta;
  data: BsbAnalysisData;
  onUpdateData: (newData: BsbAnalysisData) => void;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
  isGenerating?: boolean;
}

export const BsbAnalysisView: React.FC<BsbAnalysisViewProps> = ({
  meta,
  data,
  onUpdateData,
  onShowToast,
  isGenerating = false
}) => {
  const totalMaxBall = data.tasks.reduce((sum, t) => sum + (Number(t.maxBall) || 0), 0);

  // Download handler - NEVER strictly blocked, always downloads smoothly
  const handleDownload = async () => {
    if (data.students.length === 0) {
      onShowToast?.("Jadvalda o‘quvchilar yo‘q. Iltimos, o‘quvchi qo‘shing yoki namunani yuklang!", "warning", "O‘quvchilar yo‘q");
      return;
    }

    try {
      await generateBsbAnalysisExcel(data, meta);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onShowToast?.("BSB tahlili Excel (.xlsx) fayli yuklab olindi!", "success", "Yuklab olindi");
    } catch (err: any) {
      console.error(err);
      onShowToast?.(`Xatolik yuz berdi: ${err?.message || ''}`, "error", "Xatolik");
    }
  };

  // Load 7A Fizika sample data
  const handleLoadSample = () => {
    onUpdateData({
      ...sampleBsbAnalysisData,
      bsbType: meta.bsbType || '1-BSB'
    });
    onShowToast?.("7A Fizika 1-BSB namunaviy ma'lumotlari yuklandi!", "success", "Namuna yuklandi");
  };

  // Add new task / ish
  const handleAddTask = () => {
    const nextIdx = data.tasks.length + 1;
    const newTask = {
      id: `task-${Date.now()}`,
      name: `${nextIdx}-ish`,
      maxBall: 5
    };
    const updatedTasks = [...data.tasks, newTask];
    const updatedStudents = data.students.map(st => ({
      ...st,
      scores: [...st.scores, 0]
    }));
    onUpdateData({ ...data, tasks: updatedTasks, students: updatedStudents });
    onShowToast?.(`Yangi topshiriq (${newTask.name}) qo‘shildi`, "info");
  };

  // Remove a task
  const handleRemoveTask = (taskIdx: number) => {
    if (data.tasks.length <= 1) {
      onShowToast?.("Kamida 1 ta topshiriq bo‘lishi shart!", "warning");
      return;
    }
    const updatedTasks = data.tasks.filter((_, idx) => idx !== taskIdx);
    const updatedStudents = data.students.map(st => ({
      ...st,
      scores: st.scores.filter((_, idx) => idx !== taskIdx)
    }));
    onUpdateData({ ...data, tasks: updatedTasks, students: updatedStudents });
  };

  // Change task name or maxBall
  const handleUpdateTask = (taskIdx: number, field: 'name' | 'maxBall', value: string | number) => {
    const updatedTasks = [...data.tasks];
    updatedTasks[taskIdx] = {
      ...updatedTasks[taskIdx],
      [field]: field === 'maxBall' ? Math.max(1, Number(value) || 0) : value
    };
    onUpdateData({ ...data, tasks: updatedTasks });
  };

  // Add new student
  const handleAddStudent = () => {
    const newStudent: BsbStudentRow = {
      id: `st-${Date.now()}`,
      index: data.students.length + 1,
      fullName: `O‘quvchi ${data.students.length + 1}`,
      scores: new Array(data.tasks.length).fill(0)
    };
    onUpdateData({
      ...data,
      students: [...data.students, newStudent]
    });
    onShowToast?.("Yangi o‘quvchi qo‘shildi", "info");
  };

  // Remove student
  const handleRemoveStudent = (stIdx: number) => {
    const updated = data.students
      .filter((_, idx) => idx !== stIdx)
      .map((st, i) => ({ ...st, index: i + 1 }));
    onUpdateData({ ...data, students: updated });
  };

  // Edit student name
  const handleStudentNameChange = (stIdx: number, name: string) => {
    const updated = [...data.students];
    updated[stIdx] = { ...updated[stIdx], fullName: name };
    onUpdateData({ ...data, students: updated });
  };

  // Edit student task score
  const handleStudentScoreChange = (stIdx: number, taskIdx: number, val: string) => {
    const max = data.tasks[taskIdx]?.maxBall || 100;
    let score = Number(val) || 0;
    if (score < 0) score = 0;
    if (score > max) score = max;

    const updated = [...data.students];
    const newScores = [...updated[stIdx].scores];
    newScores[taskIdx] = score;
    updated[stIdx] = { ...updated[stIdx], scores: newScores };
    onUpdateData({ ...data, students: updated });
  };

  // RANDOM SCORE GENERATOR (Foydalanuvchi so'ragan asosiy imkoniyat: "hammasiga random kiritlsin degan tugma")
  const handleGenerateRandomScores = () => {
    if (data.students.length === 0) {
      onShowToast?.("Avval o‘quvchilarni kiriting yoki namunani yuklang!", "warning");
      return;
    }

    const updated = data.students.map((st) => {
      // Har bir o'quvchi uchun har xil iqtidor ko'rsatkichi (70% o'quvchilar yaxshi/a'lo, 20% o'rtacha, 10% pastroq)
      const studentProfile = Math.random(); // 0 to 1
      let minPct = 0.6;
      let maxPct = 1.0;

      if (studentProfile < 0.15) {
        // pastroq natija
        minPct = 0.3;
        maxPct = 0.65;
      } else if (studentProfile < 0.45) {
        // o'rtacha natija
        minPct = 0.55;
        maxPct = 0.85;
      } else {
        // yuqori natija
        minPct = 0.75;
        maxPct = 1.0;
      }

      const newScores = data.tasks.map(t => {
        const factor = minPct + Math.random() * (maxPct - minPct);
        const score = Math.round(t.maxBall * factor);
        return Math.min(t.maxBall, Math.max(0, score));
      });

      return { ...st, scores: newScores };
    });

    onUpdateData({ ...data, students: updated });
    onShowToast?.("Barcha o‘quvchilarga belgilangan ballar bo‘yicha tasodifiy ballar kiritildi! 🎲", "success", "Random kiritildi");
  };

  // Filter out 0-score students
  const handleRemoveZeroScores = () => {
    const initial = data.students.length;
    const filtered = data.students.filter(st => {
      const sum = st.scores.reduce((a, b) => a + (Number(b) || 0), 0);
      return sum > 0;
    }).map((st, i) => ({ ...st, index: i + 1 }));

    const removed = initial - filtered.length;
    if (removed === 0) {
      onShowToast?.("Ro‘yxatda 0 balli o‘quvchilar topilmadi.", "info");
      return;
    }
    onUpdateData({ ...data, students: filtered });
    onShowToast?.(`${removed} nafar 0 balli o‘quvchilar ro‘yxatdan tozalandi!`, "success", "Tozalandi");
  };

  // Sort alphabetically (A-Z)
  const handleSortAlphabetically = () => {
    const sorted = [...data.students].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, 'uz', { sensitivity: 'base' })
    ).map((st, i) => ({ ...st, index: i + 1 }));

    onUpdateData({ ...data, students: sorted });
    onShowToast?.("O‘quvchilar alifbo bo‘yicha (A-Z) tartiblandi!", "success", "Tartiblandi");
  };

  // Calculate averages
  const taskAverages = data.tasks.map((_, tIdx) => {
    if (data.students.length === 0) return 0;
    const sum = data.students.reduce((acc, st) => acc + (Number(st.scores[tIdx]) || 0), 0);
    return sum / data.students.length;
  });
  const totalAvgScore = taskAverages.reduce((a, b) => a + b, 0);
  const totalAvgPercent = totalMaxBall > 0 ? (totalAvgScore / totalMaxBall * 100) : 0;

  const titleString = `${meta.gradeName || '7-A'}-sinf  ${meta.subjectName || 'Fizika'}  fanidan  ${meta.quarterText || '1-chorak'}  ${meta.bsbType || '1-BSB'}  tahlili natijalari`;

  return (
    <div className="space-y-5">
      {/* 1-BOSQICH: TOPSHIRIQLARNI SOZLASH (TASK CONSTRUCTOR) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Topshiriqlar (ishlar) va maksimal ballarni sozlash
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ushbu fanning BSB/ChSB spetsifikatsiyasi bo‘yicha topshiriqlar soni va har bir ish maksimal balini belgilang
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <span className="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl whitespace-nowrap shadow-xs">
              Jami: <strong className="text-sm font-extrabold text-amber-700">{totalMaxBall}</strong> ball
            </span>
            <button
              onClick={handleAddTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ish qo‘shish</span>
            </button>
          </div>
        </div>

        {/* Tasks grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {data.tasks.map((task, tIdx) => (
            <div
              key={task.id}
              className="p-3 bg-slate-50 hover:bg-amber-50/30 rounded-xl border border-slate-200 hover:border-amber-300 transition-all relative group"
            >
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={task.name}
                  onChange={e => handleUpdateTask(tIdx, 'name', e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-amber-500 focus:outline-none w-20 py-0.5"
                />
                {data.tasks.length > 1 && (
                  <button
                    onClick={() => handleRemoveTask(tIdx)}
                    className="text-slate-400 hover:text-rose-600 text-xs p-1 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Topshiriqni o‘chirish"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={task.maxBall}
                  onChange={e => handleUpdateTask(tIdx, 'maxBall', e.target.value)}
                  className="w-16 px-2 py-1 text-xs text-center font-bold bg-white border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">ball</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-BOSQICH: JADVAL VA AMALLAR (TABLE + RANDOM BUTTON + ACTIONS) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  O‘quvchilar ballari va tahlil natijalari
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {titleString}
              </p>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              {/* PRIMARY RANDOM BUTTON (Foydalanuvchi so'ragan tugma) */}
              <button
                onClick={handleGenerateRandomScores}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-sm shadow-amber-500/25 cursor-pointer transition-all active:scale-95"
                title="Barcha o‘quvchilarga belgilangan topshiriq ballaridan kelib chiqib avtomatik tasodifiy ballar kiritadi"
              >
                <Dices className="w-4 h-4" />
                <span>Tasodifiy (random) ballar kiritish</span>
              </button>

              <button
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                title="Rasmdagi 7A Fizika 1-BSB 16 ta o‘quvchi ma’lumotlarini yuklaydi"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">7A namunasini yuklash</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 cursor-pointer transition-all disabled:opacity-50 ml-auto lg:ml-0"
              >
                <Download className="w-4 h-4" />
                <span>Excel yuklab olish</span>
              </button>
            </div>
          </div>

          {/* Sub toolbar: Add student, 0-removal, sort */}
          <div className="mt-4 pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleAddStudent}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>O‘quvchi qo‘shish</span>
              </button>

              <button
                onClick={handleRemoveZeroScores}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
                title="Barcha topshiriqlari 0 bo‘lgan o‘quvchilarni o‘chiradi"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>0 ballilarni tozalash</span>
              </button>

              <button
                onClick={handleSortAlphabetically}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold cursor-pointer transition-colors"
                title="Ismlarni alifbo bo‘yicha (A-Z) tartiblaydi"
              >
                <ArrowDownAZ className="w-3.5 h-3.5" />
                <span>Alifbo bo‘yicha (A-Z)</span>
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              O‘quvchilar: <span className="text-slate-900 font-bold">{data.students.length}</span> nafar
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-300">
                <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">#</th>
                <th className="py-2.5 px-4 min-w-[220px] sm:min-w-[260px] border-r border-slate-200">
                  FISH
                </th>
                {data.tasks.map(task => (
                  <th key={task.id} className="py-2.5 px-2 text-center min-w-[70px] border-r border-slate-200">
                    <div className="font-bold text-slate-800">{task.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">({task.maxBall} ball)</div>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center min-w-[90px] border-r border-slate-200 bg-amber-50/70 text-amber-900">
                  <div className="font-bold">Jami</div>
                  <div className="text-[10px] text-amber-700 font-normal">({totalMaxBall} ball)</div>
                </th>
                <th className="py-2.5 px-3 text-center min-w-[90px] border-r border-slate-200 bg-emerald-50/70 text-emerald-900 font-bold">
                  Foizi
                </th>
                <th className="py-2.5 px-2 text-center w-10">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.students.length === 0 ? (
                <tr>
                  <td colSpan={data.tasks.length + 4} className="py-8 text-center text-slate-400">
                    Hozircha o‘quvchilar yo‘q. Yuqoridagi "O‘quvchi qo‘shish" yoki "7A namunasini yuklash" tugmasini bosing.
                  </td>
                </tr>
              ) : (
                data.students.map((student, stIdx) => {
                  const rowSum = student.scores.reduce((a, b) => a + (Number(b) || 0), 0);
                  const rowPercent = totalMaxBall > 0 ? (rowSum / totalMaxBall * 100) : 0;

                  let pctColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
                  if (rowPercent < 56) {
                    pctColor = "text-rose-700 bg-rose-50 border-rose-200";
                  } else if (rowPercent < 71) {
                    pctColor = "text-amber-700 bg-amber-50 border-amber-200";
                  } else if (rowPercent < 86) {
                    pctColor = "text-blue-700 bg-blue-50 border-blue-200";
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center font-medium text-slate-500 border-r border-slate-200">
                        {stIdx + 1}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-200">
                        <input
                          type="text"
                          value={student.fullName}
                          onChange={e => handleStudentNameChange(stIdx, e.target.value)}
                          className="w-full px-2 py-1 text-xs font-medium text-slate-900 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded transition-colors focus:outline-none"
                        />
                      </td>
                      {data.tasks.map((task, tIdx) => (
                        <td key={task.id} className="py-1.5 px-2 text-center border-r border-slate-200">
                          <input
                            type="number"
                            min="0"
                            max={task.maxBall}
                            value={student.scores[tIdx] ?? 0}
                            onChange={e => handleStudentScoreChange(stIdx, tIdx, e.target.value)}
                            className="w-12 px-1 py-1 text-center font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 rounded focus:outline-none transition-colors"
                          />
                        </td>
                      ))}
                      <td className="py-2 px-3 text-center font-bold text-slate-900 bg-amber-50/40 border-r border-slate-200">
                        {rowSum}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-xs border ${pctColor}`}>
                          {rowPercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => handleRemoveStudent(stIdx)}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-1 rounded cursor-pointer"
                          title="Qatorni o‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Averages Row */}
            {data.students.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 text-center border-r border-slate-200"></td>
                  <td className="py-2.5 px-4 text-right border-r border-slate-200 font-bold uppercase tracking-wider text-slate-600">
                    O‘rtacha:
                  </td>
                  {taskAverages.map((avg, idx) => (
                    <td key={idx} className="py-2.5 px-2 text-center border-r border-slate-200 font-bold font-mono text-slate-800">
                      {avg.toFixed(1)}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center font-bold font-mono text-amber-900 bg-amber-100/50 border-r border-slate-200">
                    {totalAvgScore.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold font-mono text-emerald-900 bg-emerald-100/50 border-r border-slate-200">
                    {totalAvgPercent.toFixed(2)}%
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Signature Area */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="w-24 font-bold text-slate-900">O‘IBDO‘ :</span>
              <div className="flex-1 mx-4 border-b border-slate-900"></div>
              <span className="w-36 text-right font-medium text-slate-800">
                {meta.zavuchName || 'A.Berdiyeva'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="w-24 font-bold text-slate-900">O‘qituvchi :</span>
              <div className="flex-1 mx-4 border-b border-slate-900"></div>
              <span className="w-36 text-right font-medium text-slate-800">
                {meta.teacherName || 'M.Nazarova'}
              </span>
            </div>
          </div>

          {/* Bottom Download CTA */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              💡 Excel fayl ichida rasmdagidek formulalar (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">=SUM(...)</code> va <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">=H8/30</code>) avtomatik saqlanadi.
            </div>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tayyor Excel hisobotni yuklab olish (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
