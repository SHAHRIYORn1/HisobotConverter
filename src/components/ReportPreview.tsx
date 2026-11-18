import React from 'react';
import { Download, FileSpreadsheet, UserPlus, Trash2, Edit3, FilterX, ArrowDownAZ, Dices } from 'lucide-react';
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
  onUpdateAllDataList?: (newList: (ParsedQuarterData | null)[]) => void;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
  isGenerating: boolean;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  mode,
  meta,
  parsedDataList,
  onDownload,
  onUpdateStudents,
  onUpdateAllDataList,
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
      <div className="bg-white rounded-2xl p-8 sm:p-10 text-center border border-slate-200 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <FileSpreadsheet className="w-7 h-7" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
          Hisobot tayyorlash uchun eMaktab faylini yuklang
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Yuqoridagi 2-qadamda eMaktab jurnal faylini yuklang yoki yuqoridagi namunalardan birini bosib bir zumda sinab ko‘ring.
        </p>
      </div>
    );
  }

  const handleDownloadClick = async () => {
    try {
      await onDownload();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to get active students
  const activeData = parsedDataList[0];
  const students = activeData?.students || [];

  // =========================================================================
  // 1. ALIFBO BO'YICHA TARTIBLASH (A-Z) - Barcha 3 ta rejim uchun
  // =========================================================================
  const handleSortAlphabetically = () => {
    if (mode === 'quarter') {
      if (!activeData || students.length === 0) return;
      const sorted = [...students].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'uz', { sensitivity: 'base' })
      ).map((s, i) => ({ ...s, index: i + 1 }));
      onUpdateStudents(0, sorted);
      onShowToast?.("O‘quvchilar alifbo bo‘yicha (A-Z) tartiblandi!", "success", "Tartiblandi");
    } else if (mode === 'half_year') {
      if (!parsedDataList[0] || !parsedDataList[1]) return;
      const q1 = parsedDataList[0].students;
      const q2 = parsedDataList[1].students;

      // Sort base list by name
      const sortedNames = [...q1].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'uz', { sensitivity: 'base' })
      ).map(s => s.fullName.trim().toLowerCase());

      const sortList = (list: StudentScore[]) => {
        const map = new Map(list.map(s => [s.fullName.trim().toLowerCase(), s]));
        const sorted: StudentScore[] = [];
        sortedNames.forEach((name, i) => {
          const item = map.get(name);
          if (item) sorted.push({ ...item, index: i + 1 });
        });
        // append any remaining
        list.forEach(s => {
          if (!map.has(s.fullName.trim().toLowerCase())) {
            sorted.push({ ...s, index: sorted.length + 1 });
          }
        });
        return sorted;
      };

      const newQ1 = sortList(q1);
      const newQ2 = sortList(q2);

      if (onUpdateAllDataList) {
        onUpdateAllDataList([
          { ...parsedDataList[0], students: newQ1 },
          { ...parsedDataList[1], students: newQ2 },
          parsedDataList[2],
          parsedDataList[3]
        ]);
      } else {
        onUpdateStudents(0, newQ1);
        onUpdateStudents(1, newQ2);
      }
      onShowToast?.("Yarim yillik o‘quvchilari alifbo bo‘yicha (A-Z) tartiblandi!", "success", "Tartiblandi");
    } else if (mode === 'annual') {
      const validSlots = parsedDataList.map((p, idx) => ({ p, idx })).filter(item => item.p !== null);
      if (validSlots.length === 0) return;

      const firstStudents = validSlots[0].p!.students;
      const sortedNames = [...firstStudents].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'uz', { sensitivity: 'base' })
      ).map(s => s.fullName.trim().toLowerCase());

      const newList = [...parsedDataList];
      validSlots.forEach(({ p, idx }) => {
        const map = new Map(p!.students.map(s => [s.fullName.trim().toLowerCase(), s]));
        const sorted: StudentScore[] = [];
        sortedNames.forEach((name, i) => {
          const item = map.get(name);
          if (item) sorted.push({ ...item, index: i + 1 });
        });
        newList[idx] = { ...p!, students: sorted };
      });

      if (onUpdateAllDataList) {
        onUpdateAllDataList(newList);
      } else {
        validSlots.forEach(({ idx }) => {
          if (newList[idx]) onUpdateStudents(idx, newList[idx]!.students);
        });
      }
      onShowToast?.("Yillik hisobot o‘quvchilari alifbo bo‘yicha (A-Z) tartiblandi!", "success", "Tartiblandi");
    }
  };

  // =========================================================================
  // 2. 0 BALLILARNI TOZALASH - Barcha 3 ta rejim uchun
  // =========================================================================
  const handleRemoveZeroScores = () => {
    if (mode === 'quarter') {
      if (!activeData) return;
      const initialCount = students.length;
      const filtered = students.filter(st => {
        const bsb = st.totalBsb ?? 0;
        const chsb = st.chsb ?? 0;
        const total = st.totalScore ?? 0;
        return !(total === 0 || (bsb === 0 && chsb === 0 && (st.fb === 0 || st.fb === null)));
      }).map((s, i) => ({ ...s, index: i + 1 }));

      const removed = initialCount - filtered.length;
      if (removed === 0) {
        onShowToast?.("Ro‘yxatda 0 balli o‘quvchilar topilmadi.", "info");
        return;
      }
      onUpdateStudents(0, filtered);
      onShowToast?.(`${removed} nafar 0 balli o‘quvchi ro‘yxatdan tozalandi!`, "success", "Tozalandi");
    } else if (mode === 'half_year') {
      if (!parsedDataList[0] || !parsedDataList[1]) return;
      const q1 = parsedDataList[0].students;
      const q2 = parsedDataList[1].students;
      const q2Map = new Map(q2.map(s => [s.fullName.trim().toLowerCase(), s]));

      const zeroNames = new Set<string>();
      q1.forEach(s1 => {
        const nameKey = s1.fullName.trim().toLowerCase();
        const s2 = q2Map.get(nameKey);
        const bsb = s1.totalBsb ?? (s1.bsbScores[0]?.score ?? 0);
        const chsb = s2 ? (s2.chsb ?? 0) : 0;
        const fb = s2 ? (s2.fb ?? 0) : 0;
        const total = bsb + chsb + fb;
        if (total === 0 || (bsb === 0 && chsb === 0)) {
          zeroNames.add(nameKey);
        }
      });

      if (zeroNames.size === 0) {
        onShowToast?.("Yarim yillikda 0 balli o‘quvchilar topilmadi.", "info");
        return;
      }

      const newQ1 = q1.filter(s => !zeroNames.has(s.fullName.trim().toLowerCase())).map((s, i) => ({ ...s, index: i + 1 }));
      const newQ2 = q2.filter(s => !zeroNames.has(s.fullName.trim().toLowerCase())).map((s, i) => ({ ...s, index: i + 1 }));

      if (onUpdateAllDataList) {
        onUpdateAllDataList([
          { ...parsedDataList[0], students: newQ1 },
          { ...parsedDataList[1], students: newQ2 },
          parsedDataList[2],
          parsedDataList[3]
        ]);
      } else {
        onUpdateStudents(0, newQ1);
        onUpdateStudents(1, newQ2);
      }
      onShowToast?.(`${zeroNames.size} nafar 0 balli o‘quvchi yarim yillikdan tozalandi!`, "success", "Tozalandi");
    } else if (mode === 'annual') {
      const validSlots = parsedDataList.map((p, idx) => ({ p, idx })).filter(item => item.p !== null);
      if (validSlots.length === 0) return;

      const firstStudents = validSlots[0].p!.students;
      const zeroNames = new Set<string>();

      firstStudents.forEach(st => {
        const nameKey = st.fullName.trim().toLowerCase();
        let totalAllQuarters = 0;
        validSlots.forEach(({ p }) => {
          const found = p!.students.find(s => s.fullName.trim().toLowerCase() === nameKey);
          if (found) totalAllQuarters += (found.totalScore || found.quarterGrade || 0);
        });
        if (totalAllQuarters === 0) {
          zeroNames.add(nameKey);
        }
      });

      if (zeroNames.size === 0) {
        onShowToast?.("Yillik ro‘yxatda 0 balli o‘quvchilar topilmadi.", "info");
        return;
      }

      const newList = [...parsedDataList];
      validSlots.forEach(({ p, idx }) => {
        const filtered = p!.students.filter(s => !zeroNames.has(s.fullName.trim().toLowerCase())).map((s, i) => ({ ...s, index: i + 1 }));
        newList[idx] = { ...p!, students: filtered };
      });

      if (onUpdateAllDataList) {
        onUpdateAllDataList(newList);
      } else {
        validSlots.forEach(({ idx }) => {
          if (newList[idx]) onUpdateStudents(idx, newList[idx]!.students);
        });
      }
      onShowToast?.(`${zeroNames.size} nafar 0 balli o‘quvchi yillik hisobotdan tozalandi!`, "success", "Tozalandi");
    }
  };

  // =========================================================================
  // 3. TASODIFIY (RANDOM) BALLAR KIRITISH - Barcha 3 ta rejim uchun
  // =========================================================================
  const handleGenerateRandomScores = () => {
    if (mode === 'quarter') {
      if (!activeData || students.length === 0) return;
      const updated = students.map(st => {
        const bsb = 35 + Math.floor(Math.random() * 16); // 35-50
        const chsb = 25 + Math.floor(Math.random() * 16); // 25-40
        const fb = 6 + Math.floor(Math.random() * 5); // 6-10
        const total = bsb + chsb + fb;
        let grade = 2;
        if (total >= 86) grade = 5;
        else if (total >= 71) grade = 4;
        else if (total >= 56) grade = 3;

        return {
          ...st,
          totalBsb: bsb,
          bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: bsb }],
          chsb,
          fb,
          totalScore: total,
          quarterGrade: grade
        };
      });
      onUpdateStudents(0, updated);
      onShowToast?.("Choraklik hisobotga tasodifiy ballar kiritildi! 🎲", "success", "Random kiritildi");
    } else if (mode === 'half_year') {
      if (!parsedDataList[0] || !parsedDataList[1]) return;
      const q1 = parsedDataList[0].students;
      const q2 = parsedDataList[1].students;

      const newQ1 = q1.map(st => {
        const bsb = 36 + Math.floor(Math.random() * 15); // 36-50
        return {
          ...st,
          totalBsb: bsb,
          bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: bsb }],
          totalScore: bsb
        };
      });

      const newQ2 = q2.map(st => {
        const chsb = 26 + Math.floor(Math.random() * 15); // 26-40
        const fb = 7 + Math.floor(Math.random() * 4); // 7-10
        return {
          ...st,
          chsb,
          fb,
          totalScore: chsb + fb
        };
      });

      if (onUpdateAllDataList) {
        onUpdateAllDataList([
          { ...parsedDataList[0], students: newQ1 },
          { ...parsedDataList[1], students: newQ2 },
          parsedDataList[2],
          parsedDataList[3]
        ]);
      } else {
        onUpdateStudents(0, newQ1);
        onUpdateStudents(1, newQ2);
      }
      onShowToast?.("Yarim yillik hisobotga tasodifiy ballar kiritildi! 🎲", "success", "Random kiritildi");
    } else if (mode === 'annual') {
      const validSlots = parsedDataList.map((p, idx) => ({ p, idx })).filter(item => item.p !== null);
      if (validSlots.length === 0) return;

      const newList = [...parsedDataList];
      validSlots.forEach(({ p, idx }) => {
        const updated = p!.students.map(st => {
          const bsb = 30 + Math.floor(Math.random() * 20); // 30-49
          const fb = 7 + Math.floor(Math.random() * 4);    // 7-10
          const chsb = 24 + Math.floor(Math.random() * 16); // 24-39
          const total = bsb + fb + chsb;
          let grade = 2;
          if (total >= 86) grade = 5;
          else if (total >= 71) grade = 4;
          else if (total >= 56) grade = 3;
          return {
            ...st,
            totalBsb: bsb,
            bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: bsb }],
            fb,
            chsb,
            totalScore: total,
            quarterGrade: grade
          };
        });
        newList[idx] = { ...p!, students: updated };
      });

      if (onUpdateAllDataList) {
        onUpdateAllDataList(newList);
      } else {
        validSlots.forEach(({ idx }) => {
          if (newList[idx]) onUpdateStudents(idx, newList[idx]!.students);
        });
      }
      onShowToast?.("Yillik hisobotga tasodifiy ballar kiritildi! 🎲", "success", "Random kiritildi");
    }
  };

  // =========================================================================
  // 4. O'QUVCHI QO'SHISH VA O'CHIRISH
  // =========================================================================
  const handleAddStudent = () => {
    if (mode === 'quarter') {
      const newSt: StudentScore = {
        index: students.length + 1,
        fullName: `O‘quvchi ${students.length + 1}`,
        bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: 40 }],
        totalBsb: 40,
        chsb: 30,
        fb: 8,
        totalScore: 78,
        quarterGrade: 4
      };
      onUpdateStudents(0, [...students, newSt]);
      onShowToast?.("Yangi o‘quvchi qo‘shildi", "info");
    } else if (mode === 'half_year') {
      if (!parsedDataList[0] || !parsedDataList[1]) return;
      const count = parsedDataList[0].students.length + 1;
      const name = `O‘quvchi ${count}`;
      const newS1: StudentScore = {
        index: count,
        fullName: name,
        bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: 42 }],
        totalBsb: 42,
        chsb: 0,
        fb: 0,
        totalScore: 42,
        quarterGrade: 4
      };
      const newS2: StudentScore = {
        index: count,
        fullName: name,
        bsbScores: [],
        totalBsb: 0,
        chsb: 34,
        fb: 8,
        totalScore: 42,
        quarterGrade: 4
      };

      if (onUpdateAllDataList) {
        onUpdateAllDataList([
          { ...parsedDataList[0], students: [...parsedDataList[0].students, newS1] },
          { ...parsedDataList[1], students: [...parsedDataList[1].students, newS2] },
          parsedDataList[2],
          parsedDataList[3]
        ]);
      } else {
        onUpdateStudents(0, [...parsedDataList[0].students, newS1]);
        onUpdateStudents(1, [...parsedDataList[1].students, newS2]);
      }
      onShowToast?.("Yarim yillikka yangi o‘quvchi qo‘shildi", "info");
    } else if (mode === 'annual') {
      const validSlots = parsedDataList.map((p, idx) => ({ p, idx })).filter(item => item.p !== null);
      if (validSlots.length === 0) return;
      const count = validSlots[0].p!.students.length + 1;
      const name = `O‘quvchi ${count}`;

      const newList = [...parsedDataList];
      validSlots.forEach(({ p, idx }) => {
        const newSt: StudentScore = {
          index: count,
          fullName: name,
          bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: 40 }],
          totalBsb: 40,
          chsb: 30,
          fb: 8,
          totalScore: 78,
          quarterGrade: 4
        };
        newList[idx] = { ...p!, students: [...p!.students, newSt] };
      });

      if (onUpdateAllDataList) {
        onUpdateAllDataList(newList);
      } else {
        validSlots.forEach(({ idx }) => {
          if (newList[idx]) onUpdateStudents(idx, newList[idx]!.students);
        });
      }
      onShowToast?.("Yillik hisobotga yangi o‘quvchi qo‘shildi", "info");
    }
  };

  const handleDeleteStudent = (index: number) => {
    if (mode === 'quarter') {
      if (!activeData) return;
      const updated = students.filter((_, i) => i !== index).map((s, i) => ({ ...s, index: i + 1 }));
      onUpdateStudents(0, updated);
    } else if (mode === 'half_year') {
      if (!parsedDataList[0] || !parsedDataList[1]) return;
      const q1 = parsedDataList[0].students.filter((_, i) => i !== index).map((s, i) => ({ ...s, index: i + 1 }));
      const q2 = parsedDataList[1].students.filter((_, i) => i !== index).map((s, i) => ({ ...s, index: i + 1 }));

      if (onUpdateAllDataList) {
        onUpdateAllDataList([
          { ...parsedDataList[0], students: q1 },
          { ...parsedDataList[1], students: q2 },
          parsedDataList[2],
          parsedDataList[3]
        ]);
      } else {
        onUpdateStudents(0, q1);
        onUpdateStudents(1, q2);
      }
    } else if (mode === 'annual') {
      const validSlots = parsedDataList.map((p, idx) => ({ p, idx })).filter(item => item.p !== null);
      const newList = [...parsedDataList];
      validSlots.forEach(({ p, idx }) => {
        const updated = p!.students.filter((_, i) => i !== index).map((s, i) => ({ ...s, index: i + 1 }));
        newList[idx] = { ...p!, students: updated };
      });

      if (onUpdateAllDataList) {
        onUpdateAllDataList(newList);
      } else {
        validSlots.forEach(({ idx }) => {
          if (newList[idx]) onUpdateStudents(idx, newList[idx]!.students);
        });
      }
    }
  };

  // Editing helpers for Mode 1 (Quarter)
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

        const bsb = newSt.totalBsb ?? 0;
        const chsb = newSt.chsb ?? 0;
        const fb = newSt.fb ?? 0;
        newSt.totalScore = bsb + chsb + fb;

        if (newSt.totalScore >= 86) newSt.quarterGrade = 5;
        else if (newSt.totalScore >= 71) newSt.quarterGrade = 4;
        else if (newSt.totalScore >= 56) newSt.quarterGrade = 3;
        else newSt.quarterGrade = 2;
      }
      return newSt;
    });

    onUpdateStudents(0, updated);
  };

  // Editing helpers for Mode 2 (Half-year)
  const handleHalfYearChange = (
    studentIdx: number,
    field: 'fullName' | 'bsb' | 'chsb' | 'fb',
    val: string
  ) => {
    if (!parsedDataList[0] || !parsedDataList[1]) return;
    const q1 = [...parsedDataList[0].students];
    const q2 = [...parsedDataList[1].students];

    if (!q1[studentIdx] || !q2[studentIdx]) return;

    if (field === 'fullName') {
      q1[studentIdx] = { ...q1[studentIdx], fullName: val };
      q2[studentIdx] = { ...q2[studentIdx], fullName: val };
    } else {
      const num = val === '' ? 0 : parseFloat(val) || 0;
      if (field === 'bsb') {
        q1[studentIdx] = {
          ...q1[studentIdx],
          totalBsb: num,
          bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: num }],
          totalScore: num
        };
      } else if (field === 'chsb') {
        q2[studentIdx] = {
          ...q2[studentIdx],
          chsb: num,
          totalScore: num + (q2[studentIdx].fb || 0)
        };
      } else if (field === 'fb') {
        q2[studentIdx] = {
          ...q2[studentIdx],
          fb: num,
          totalScore: (q2[studentIdx].chsb || 0) + num
        };
      }
    }

    if (onUpdateAllDataList) {
      onUpdateAllDataList([
        { ...parsedDataList[0], students: q1 },
        { ...parsedDataList[1], students: q2 },
        parsedDataList[2],
        parsedDataList[3]
      ]);
    } else {
      onUpdateStudents(0, q1);
      onUpdateStudents(1, q2);
    }
  };

  // Editing helpers for Mode 3 (Annual)
  const handleAnnualChange = (
    studentIdx: number,
    slotIdx: number,
    field: 'fullName' | 'bsb' | 'fb' | 'chsb' | 'totalScore',
    val: string
  ) => {
    const validSlots = parsedDataList.map((p, idx) => ({ p, idx })).filter(item => item.p !== null);
    if (validSlots.length === 0) return;

    const newList = [...parsedDataList];

    if (field === 'fullName') {
      validSlots.forEach(({ p, idx }) => {
        if (p!.students[studentIdx]) {
          const updated = [...p!.students];
          updated[studentIdx] = { ...updated[studentIdx], fullName: val };
          newList[idx] = { ...p!, students: updated };
        }
      });
    } else if (newList[slotIdx] && newList[slotIdx]!.students[studentIdx]) {
      const st = newList[slotIdx]!.students[studentIdx];
      const num = val === '' ? 0 : parseFloat(val) || 0;
      let bsb = st.totalBsb ?? (st.bsbScores[0]?.score ?? 0);
      let fb = st.fb ?? 0;
      let chsb = st.chsb ?? 0;
      let total = st.totalScore ?? 0;

      if (field === 'bsb') {
        bsb = num;
        total = bsb + fb + chsb;
      } else if (field === 'fb') {
        fb = num;
        total = bsb + fb + chsb;
      } else if (field === 'chsb') {
        chsb = num;
        total = bsb + fb + chsb;
      } else if (field === 'totalScore') {
        total = num;
      }

      let grade = 2;
      if (total >= 86) grade = 5;
      else if (total >= 71) grade = 4;
      else if (total >= 56) grade = 3;

      const updated = [...newList[slotIdx]!.students];
      updated[studentIdx] = {
        ...st,
        totalBsb: bsb,
        bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: bsb }],
        fb,
        chsb,
        totalScore: total,
        quarterGrade: grade
      };
      newList[slotIdx] = { ...newList[slotIdx]!, students: updated };
    }

    if (onUpdateAllDataList) {
      onUpdateAllDataList(newList);
    } else {
      validSlots.forEach(({ idx }) => {
        if (newList[idx]) onUpdateStudents(idx, newList[idx]!.students);
      });
    }
  };

  // Grade Counts computation
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
  } else if (mode === 'annual' && parsedDataList[0]) {
    const validSlots = parsedDataList.map((p, idx) => ({ p, idx })).filter(item => item.p !== null);
    studentsCount = parsedDataList[0].students.length;
    parsedDataList[0].students.forEach(st => {
      let sumGrades = 0;
      let countQuarters = 0;
      validSlots.forEach(({ p }) => {
        const found = p!.students.find(s => s.fullName.trim().toLowerCase() === st.fullName.trim().toLowerCase());
        if (found && (found.quarterGrade || found.totalScore)) {
          const g = found.quarterGrade || (found.totalScore && found.totalScore >= 86 ? 5 : found.totalScore && found.totalScore >= 71 ? 4 : found.totalScore && found.totalScore >= 56 ? 3 : 2);
          sumGrades += g;
          countQuarters++;
        }
      });
      const finalAnnualGrade = countQuarters > 0 ? Math.round(sumGrades / countQuarters) : 2;
      if (finalAnnualGrade === 5) grade5Count++;
      else if (finalAnnualGrade === 4) grade4Count++;
      else if (finalAnnualGrade === 3) grade3Count++;
      else grade2Count++;
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top action bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Hisobot muvaffaqiyatli shakllantirildi!
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">Jami {studentsCount} nafar o‘quvchi</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" />
              Kataklar ichida har bir ballni to‘g‘ridan-to‘g‘ri tahrirlashingiz mumkin
            </span>
          </p>
        </div>

        {/* Action Buttons: UNIVERSAL FOR ALL MODES */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button 1: Tasodifiy (random) ballar kiritish */}
          <button
            onClick={handleGenerateRandomScores}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            title="Barcha o‘quvchilarga avtomatik mantiqiy baholar kiritish"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Tasodifiy ballar (Random)</span>
          </button>

          {/* Button 2: 0 balli o'quvchilarni tozalash */}
          <button
            onClick={handleRemoveZeroScores}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            title="0 olgan o‘quvchilarni ro‘yxatdan avtomatik tozalash"
          >
            <FilterX className="w-3.5 h-3.5 text-rose-600" />
            <span>0 ballilarni tozalash</span>
          </button>

          {/* Button 3: Alifbo bo'yicha tartiblash (A-Z) */}
          <button
            onClick={handleSortAlphabetically}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            title="O‘quvchilarni alifbo (A-Z) tartibida joylashtirish"
          >
            <ArrowDownAZ className="w-3.5 h-3.5 text-blue-600" />
            <span>Alifbo bo‘yicha (A-Z)</span>
          </button>

          {/* Button 4: O'quvchi qo'shish */}
          <button
            onClick={handleAddStudent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-600" />
            <span>+ O‘quvchi</span>
          </button>

          {/* Button 5: Download Excel */}
          <button
            onClick={handleDownloadClick}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Yuklanmoqda...' : 'Excel yuklab olish (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Main Table Preview Area */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[700px] border border-slate-300 rounded-xl p-4 sm:p-6 bg-white shadow-xs">
          {/* Header Title in Excel preview */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="font-serif font-bold text-sm sm:text-base text-slate-900">
              {meta.schoolName || "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab"}
            </h2>
            <p className="font-serif text-xs sm:text-sm text-slate-800">
              {meta.gradeName || 'Sinf'} -sinf "{meta.subjectName || 'Fan'}" fanidan {meta.academicYear || '2026-2027'}-o'quv yili {meta.quarterText} natijalari
            </p>
          </div>

          {/* ============================================================= */}
          {/* Table preview for Mode 1: Oddiy Choraklik hisobot             */}
          {/* ============================================================= */}
          {mode === 'quarter' && activeData && (
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-serif">
                  <th className="border border-slate-400 p-2 text-center w-10">#</th>
                  <th className="border border-slate-400 p-2 text-left min-w-[200px]">F.I.Sh.</th>
                  <th className="border border-slate-400 p-2 text-center">BSB(50)</th>
                  <th className="border border-slate-400 p-2 text-center">ChSB(40)</th>
                  <th className="border border-slate-400 p-2 text-center">FB(10)</th>
                  <th className="border border-slate-400 p-2 text-center font-bold">Jami ball(100)</th>
                  <th className="border border-slate-400 p-2 text-center font-bold">Choraklik baho</th>
                  <th className="border border-slate-400 p-2 text-center w-10 print:hidden">Amal</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="border border-slate-300 p-1.5 text-center text-slate-500 font-sans">{i + 1}</td>
                    <td className="border border-slate-300 p-1">
                      <input
                        type="text"
                        value={st.fullName}
                        onChange={e => handleScoreChange(i, 'fullName', e.target.value)}
                        className="w-full px-2 py-1 text-slate-900 font-medium bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded transition-colors focus:outline-none"
                      />
                    </td>
                    <td className="border border-slate-300 p-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={st.totalBsb ?? ''}
                        onChange={e => handleScoreChange(i, 'bsb', e.target.value)}
                        className="w-14 px-1 py-1 text-center font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded focus:outline-none"
                      />
                    </td>
                    <td className="border border-slate-300 p-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={st.chsb ?? ''}
                        onChange={e => handleScoreChange(i, 'chsb', e.target.value)}
                        className="w-14 px-1 py-1 text-center font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded focus:outline-none"
                      />
                    </td>
                    <td className="border border-slate-300 p-1 text-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={st.fb ?? ''}
                        onChange={e => handleScoreChange(i, 'fb', e.target.value)}
                        className="w-14 px-1 py-1 text-center font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded focus:outline-none"
                      />
                    </td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 font-sans">
                      {st.totalScore ?? 0}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 font-sans">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs ${
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
                    <td className="border border-slate-300 p-1 text-center print:hidden">
                      <button
                        onClick={() => handleDeleteStudent(i)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded cursor-pointer transition-colors"
                        title="O‘quvchini o‘chirish"
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
                  <td colSpan={2} className="border border-slate-400 p-2 text-left font-serif">O‘rtacha:</td>
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

          {/* ============================================================= */}
          {/* Table preview for Mode 2: Qo'shma Yarim yillik hisobot         */}
          {/* ============================================================= */}
          {mode === 'half_year' && parsedDataList[0] && parsedDataList[1] && (
            <table className="w-full border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-serif">
                  <th className="border border-slate-400 p-2 text-center w-10">#</th>
                  <th className="border border-slate-400 p-2 text-left min-w-[200px]">F.I.Sh.</th>
                  <th className="border border-slate-400 p-2 text-center">BSB(50) ({meta.quarterText?.includes('III') ? '3-chorak' : '1-chorak'})</th>
                  <th className="border border-slate-400 p-2 text-center">CHSB(40) ({meta.quarterText?.includes('III') ? '4-chorak' : '2-chorak'})</th>
                  <th className="border border-slate-400 p-2 text-center">FB(10)</th>
                  <th className="border border-slate-400 p-2 text-center font-bold">Jami ball(100)</th>
                  <th className="border border-slate-400 p-2 text-center font-bold">Choraklik baho</th>
                  <th className="border border-slate-400 p-2 text-center w-10 print:hidden">Amal</th>
                </tr>
              </thead>
              <tbody>
                {parsedDataList[0].students.map((s1, idx) => {
                  const s2 = parsedDataList[1]!.students[idx] || s1;
                  const bsb = s1.totalBsb ?? (s1.bsbScores[0]?.score ?? 0);
                  const chsb = s2.chsb ?? 0;
                  const fb = s2.fb ?? 0;
                  const total = bsb + chsb + fb;
                  let g = 2;
                  if (total >= 86) g = 5;
                  else if (total >= 71) g = 4;
                  else if (total >= 56) g = 3;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                      <td className="border border-slate-300 p-1.5 text-center font-sans text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-300 p-1">
                        <input
                          type="text"
                          value={s1.fullName}
                          onChange={e => handleHalfYearChange(idx, 'fullName', e.target.value)}
                          className="w-full px-2 py-1 text-slate-900 font-medium bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded transition-colors focus:outline-none"
                        />
                      </td>
                      <td className="border border-slate-300 p-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={bsb}
                          onChange={e => handleHalfYearChange(idx, 'bsb', e.target.value)}
                          className="w-14 px-1 py-1 text-center font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded focus:outline-none"
                        />
                      </td>
                      <td className="border border-slate-300 p-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={chsb}
                          onChange={e => handleHalfYearChange(idx, 'chsb', e.target.value)}
                          className="w-14 px-1 py-1 text-center font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded focus:outline-none"
                        />
                      </td>
                      <td className="border border-slate-300 p-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={fb}
                          onChange={e => handleHalfYearChange(idx, 'fb', e.target.value)}
                          className="w-14 px-1 py-1 text-center font-semibold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded focus:outline-none"
                        />
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 font-sans">
                        {total}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 font-sans">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs ${
                          g === 5
                            ? 'bg-emerald-100 text-emerald-800'
                            : g === 4
                            ? 'bg-blue-100 text-blue-800'
                            : g === 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {g}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-1 text-center print:hidden">
                        <button
                          onClick={() => handleDeleteStudent(idx)}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded cursor-pointer transition-colors"
                          title="O‘quvchini o‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Summary rows */}
                <tr className="bg-slate-100 font-bold font-sans">
                  <td colSpan={2} className="border border-slate-400 p-2 text-left font-serif">Jami:</td>
                  <td className="border border-slate-400 p-2 text-center">
                    {parsedDataList[0].students.reduce((acc, s) => acc + (s.totalBsb || s.bsbScores[0]?.score || 0), 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    {parsedDataList[1].students.reduce((acc, s) => acc + (s.chsb || 0), 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center">
                    {parsedDataList[1].students.reduce((acc, s) => acc + (s.fb || 0), 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-slate-900">
                    {parsedDataList[0].students.reduce((acc, s1, idx) => {
                      const s2 = parsedDataList[1]!.students[idx] || s1;
                      return acc + (s1.totalBsb || 0) + (s2.chsb || 0) + (s2.fb || 0);
                    }, 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-slate-900">
                    {parsedDataList[0].students.reduce((acc, s1, idx) => {
                      const s2 = parsedDataList[1]!.students[idx] || s1;
                      const tot = (s1.totalBsb || 0) + (s2.chsb || 0) + (s2.fb || 0);
                      const g = tot >= 86 ? 5 : tot >= 71 ? 4 : tot >= 56 ? 3 : 2;
                      return acc + g;
                    }, 0)}
                  </td>
                  <td className="border border-slate-400 p-2 text-center print:hidden"></td>
                </tr>
              </tbody>
            </table>
          )}

          {/* ============================================================= */}
          {/* Table preview for Mode 3: To'liq Yillik hisobot               */}
          {/* ============================================================= */}
          {mode === 'annual' && parsedDataList[0] && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-400 text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-serif">
                    <th className="border border-slate-400 p-2 text-center w-8">#</th>
                    <th className="border border-slate-400 p-2 text-left min-w-[200px]">F.I.Sh.</th>

                    {/* 1-Chorak */}
                    <th className="border border-slate-400 p-1.5 text-center bg-blue-50/50">1-BSB(50)</th>
                    <th className="border border-slate-400 p-1.5 text-center bg-blue-50/50">FB(10)</th>
                    <th className="border border-slate-400 p-1.5 text-center bg-blue-50/50">1-ChSB(40)</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-blue-100/50">Jami ball(100)</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-blue-100/50">1-Chorak baho</th>

                    {/* 2-Chorak */}
                    <th className="border border-slate-400 p-1.5 text-center bg-emerald-50/50">2-BSB(50)</th>
                    <th className="border border-slate-400 p-1.5 text-center bg-emerald-50/50">FB(10)</th>
                    <th className="border border-slate-400 p-1.5 text-center bg-emerald-50/50">2-ChSB(40)</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-emerald-100/50">Jami ball(100)</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-emerald-100/50">2-Chorak baho</th>

                    {/* 3-Chorak */}
                    <th className="border border-slate-400 p-1.5 text-center bg-amber-50/50">3-BSB(50)</th>
                    <th className="border border-slate-400 p-1.5 text-center bg-amber-50/50">FB(10)</th>
                    <th className="border border-slate-400 p-1.5 text-center bg-amber-50/50">3-ChSB(40)</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-amber-100/50">Jami ball(100)</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-amber-100/50">3-Chorak baho</th>

                    {/* 4-Chorak */}
                    <th className="border border-slate-400 p-1.5 text-center bg-purple-50/50">4-BSB(50)</th>
                    <th className="border border-slate-400 p-1.5 text-center bg-purple-50/50">FB(10)</th>
                    <th className="border border-slate-400 p-1.5 text-center bg-purple-50/50">4-ChSB(40)</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-purple-100/50">Jami ball(100)</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-purple-100/50">4-Chorak baho</th>

                    {/* Yillik, Imtihon, Yakuniy */}
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-slate-200">Yillik</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-slate-200">Imtihon</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-slate-200">Yakuniy baho</th>

                    {/* Choraklar ballari */}
                    <th className="border border-slate-400 p-1.5 text-center">1-chorak</th>
                    <th className="border border-slate-400 p-1.5 text-center">2-chorak</th>
                    <th className="border border-slate-400 p-1.5 text-center">3-chorak</th>
                    <th className="border border-slate-400 p-1.5 text-center">4-chorak</th>

                    {/* O'rtacha va dinamika */}
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-emerald-50">Jami o‘rtacha</th>
                    <th className="border border-slate-400 p-1.5 text-center font-bold bg-slate-50">O‘sish kamayish</th>
                    <th className="border border-slate-400 p-1.5 text-center w-10 print:hidden">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedDataList[0].students.map((st, idx) => {
                    const s1 = parsedDataList[0]?.students[idx];
                    const s2 = parsedDataList[1]?.students[idx];
                    const s3 = parsedDataList[2]?.students[idx];
                    const s4 = parsedDataList[3]?.students[idx];

                    // Q1
                    const bsb1 = s1?.totalBsb ?? (s1?.bsbScores[0]?.score ?? 0);
                    const fb1 = s1?.fb ?? 0;
                    const chsb1 = s1?.chsb ?? 0;
                    const tot1 = s1?.totalScore ?? (bsb1 + fb1 + chsb1);
                    const g1 = s1?.quarterGrade ?? (tot1 >= 86 ? 5 : tot1 >= 71 ? 4 : tot1 >= 56 ? 3 : 2);

                    // Q2
                    const bsb2 = s2?.totalBsb ?? (s2?.bsbScores[0]?.score ?? 0);
                    const fb2 = s2?.fb ?? 0;
                    const chsb2 = s2?.chsb ?? 0;
                    const tot2 = s2?.totalScore ?? (bsb2 + fb2 + chsb2);
                    const g2 = s2?.quarterGrade ?? (tot2 >= 86 ? 5 : tot2 >= 71 ? 4 : tot2 >= 56 ? 3 : 2);

                    // Q3
                    const bsb3 = s3?.totalBsb ?? (s3?.bsbScores[0]?.score ?? 0);
                    const fb3 = s3?.fb ?? 0;
                    const chsb3 = s3?.chsb ?? 0;
                    const tot3 = s3?.totalScore ?? (bsb3 + fb3 + chsb3);
                    const g3 = s3?.quarterGrade ?? (tot3 >= 86 ? 5 : tot3 >= 71 ? 4 : tot3 >= 56 ? 3 : 2);

                    // Q4
                    const bsb4 = s4?.totalBsb ?? (s4?.bsbScores[0]?.score ?? 0);
                    const fb4 = s4?.fb ?? 0;
                    const chsb4 = s4?.chsb ?? 0;
                    const tot4 = s4?.totalScore ?? (bsb4 + fb4 + chsb4);
                    const g4 = s4?.quarterGrade ?? (tot4 >= 86 ? 5 : tot4 >= 71 ? 4 : tot4 >= 56 ? 3 : 2);

                    const validGrades = [g1, g2, g3, g4].filter(g => g > 0);
                    const annualGrade = validGrades.length > 0 ? Math.round(validGrades.reduce((a, b) => a + b, 0) / validGrades.length) : 2;

                    const validTotals = [tot1, tot2, tot3, tot4].filter(t => t > 0);
                    const avgScore = validTotals.length > 0 ? (validTotals.reduce((a, b) => a + b, 0) / validTotals.length).toFixed(2) : '0';
                    const avgNum = parseFloat(avgScore) || 0;

                    // O'sish kamayish: -(avg - tot1)
                    const diff = tot1 > 0 ? (-(avgNum - tot1)).toFixed(2) : '0';
                    const diffNum = parseFloat(diff);
                    const trend = diffNum >= 0 ? "o‘sgan" : "kamaygan";
                    const trendColor = diffNum >= 0 ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50";

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="border border-slate-300 p-1.5 text-center font-sans text-slate-500">{idx + 1}</td>
                        <td className="border border-slate-300 p-1">
                          <input
                            type="text"
                            value={st.fullName}
                            onChange={e => handleAnnualChange(idx, 0, 'fullName', e.target.value)}
                            className="w-full px-2 py-1 text-slate-900 font-medium bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded transition-colors focus:outline-none"
                          />
                        </td>

                        {/* 1-Chorak */}
                        <td className="border border-slate-300 p-1 text-center bg-blue-50/20">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={bsb1 || ''}
                            onChange={e => handleAnnualChange(idx, 0, 'bsb', e.target.value)}
                            className="w-11 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1 text-center bg-blue-50/20">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={fb1 || ''}
                            onChange={e => handleAnnualChange(idx, 0, 'fb', e.target.value)}
                            className="w-9 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1 text-center bg-blue-50/20">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={chsb1 || ''}
                            onChange={e => handleAnnualChange(idx, 0, 'chsb', e.target.value)}
                            className="w-11 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-800 bg-blue-50/40 font-mono">
                          {tot1}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold bg-blue-50/40">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            g1 === 5 ? 'bg-emerald-100 text-emerald-800' : g1 === 4 ? 'bg-blue-100 text-blue-800' : g1 === 3 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {g1}
                          </span>
                        </td>

                        {/* 2-Chorak */}
                        <td className="border border-slate-300 p-1 text-center bg-emerald-50/20">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={bsb2 || ''}
                            onChange={e => handleAnnualChange(idx, 1, 'bsb', e.target.value)}
                            className="w-11 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1 text-center bg-emerald-50/20">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={fb2 || ''}
                            onChange={e => handleAnnualChange(idx, 1, 'fb', e.target.value)}
                            className="w-9 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1 text-center bg-emerald-50/20">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={chsb2 || ''}
                            onChange={e => handleAnnualChange(idx, 1, 'chsb', e.target.value)}
                            className="w-11 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-800 bg-emerald-50/40 font-mono">
                          {tot2}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold bg-emerald-50/40">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            g2 === 5 ? 'bg-emerald-100 text-emerald-800' : g2 === 4 ? 'bg-blue-100 text-blue-800' : g2 === 3 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {g2}
                          </span>
                        </td>

                        {/* 3-Chorak */}
                        <td className="border border-slate-300 p-1 text-center bg-amber-50/20">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={bsb3 || ''}
                            onChange={e => handleAnnualChange(idx, 2, 'bsb', e.target.value)}
                            className="w-11 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1 text-center bg-amber-50/20">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={fb3 || ''}
                            onChange={e => handleAnnualChange(idx, 2, 'fb', e.target.value)}
                            className="w-9 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1 text-center bg-amber-50/20">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={chsb3 || ''}
                            onChange={e => handleAnnualChange(idx, 2, 'chsb', e.target.value)}
                            className="w-11 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-800 bg-amber-50/40 font-mono">
                          {tot3}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold bg-amber-50/40">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            g3 === 5 ? 'bg-emerald-100 text-emerald-800' : g3 === 4 ? 'bg-blue-100 text-blue-800' : g3 === 3 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {g3}
                          </span>
                        </td>

                        {/* 4-Chorak */}
                        <td className="border border-slate-300 p-1 text-center bg-purple-50/20">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={bsb4 || ''}
                            onChange={e => handleAnnualChange(idx, 3, 'bsb', e.target.value)}
                            className="w-11 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1 text-center bg-purple-50/20">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={fb4 || ''}
                            onChange={e => handleAnnualChange(idx, 3, 'fb', e.target.value)}
                            className="w-9 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1 text-center bg-purple-50/20">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={chsb4 || ''}
                            onChange={e => handleAnnualChange(idx, 3, 'chsb', e.target.value)}
                            className="w-11 px-1 py-1 text-center text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none"
                          />
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-800 bg-purple-50/40 font-mono">
                          {tot4}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold bg-purple-50/40">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            g4 === 5 ? 'bg-emerald-100 text-emerald-800' : g4 === 4 ? 'bg-blue-100 text-blue-800' : g4 === 3 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {g4}
                          </span>
                        </td>

                        {/* Yillik, Imtihon, Yakuniy */}
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 bg-slate-100 font-sans">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-xs ${
                            annualGrade === 5 ? 'bg-emerald-100 text-emerald-800' : annualGrade === 4 ? 'bg-blue-100 text-blue-800' : annualGrade === 3 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {annualGrade}
                          </span>
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-600 bg-slate-100 font-sans">
                          OZ
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 bg-slate-100 font-sans">
                          {annualGrade}
                        </td>

                        {/* 1, 2, 3, 4 chorak ballari */}
                        <td className="border border-slate-300 p-1.5 text-center font-mono text-slate-700">{tot1}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono text-slate-700">{tot2}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono text-slate-700">{tot3}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono text-slate-700">{tot4}</td>

                        {/* Jami o'rtacha & Dinamika */}
                        <td className="border border-slate-300 p-1.5 text-center font-mono font-bold text-slate-900 bg-emerald-50/50">
                          {avgScore}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-sans">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${trendColor}`}>
                            {trend} ({diff})
                          </span>
                        </td>

                        <td className="border border-slate-300 p-1 text-center print:hidden">
                          <button
                            onClick={() => handleDeleteStudent(idx)}
                            className="text-slate-300 hover:text-rose-600 p-1 rounded cursor-pointer transition-colors"
                            title="O‘quvchini o‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Statistics & Signatures (Exactly as in User Screenshot 2) */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <p className="font-bold text-slate-900 mb-2 font-serif text-sm">Jami baholar statistikasi:</p>
              <div className="grid grid-cols-2 gap-2 text-slate-700 font-sans max-w-sm">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="font-medium text-emerald-900">"5" baholar:</span>
                  <span className="font-bold text-emerald-700">{grade5Count} ta</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="font-medium text-blue-900">"4" baholar:</span>
                  <span className="font-bold text-blue-700">{grade4Count} ta</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="font-medium text-amber-900">"3" baholar:</span>
                  <span className="font-bold text-amber-700">{grade3Count} ta</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-100">
                  <span className="font-medium text-rose-900">"2" baholar:</span>
                  <span className="font-bold text-rose-700">{grade2Count} ta</span>
                </div>
              </div>
            </div>

            {/* Signature Area (User Screenshot 2: O'IBDO' : _________ A.Berdiyeva) */}
            <div className="flex flex-col justify-center space-y-4 font-serif">
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-bold text-slate-900 min-w-[90px]">O‘IBDO‘ :</span>
                <span className="w-36 border-b border-slate-800 inline-block h-4"></span>
                <span className="font-medium text-slate-800 min-w-[120px] text-left">
                  {meta.zavuchName || 'A.Berdiyeva'}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-bold text-slate-900 min-w-[90px]">O‘qituvchi :</span>
                <span className="w-36 border-b border-slate-800 inline-block h-4"></span>
                <span className="font-medium text-slate-800 min-w-[120px] text-left">
                  {meta.teacherName || 'M.Nazarova'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Download Bar */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              💡 Ushbu jadval maktab ma’muriyati (Zavuch) talab qiladigan rasmiy formatda .xlsx fayl qilib yuklanadi.
            </span>
            <button
              onClick={handleDownloadClick}
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
