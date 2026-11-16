import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import type { ReportMode } from './components/ModeSelector';
import { MetaForm } from './components/MetaForm';
import { FileUploader } from './components/FileUploader';
import { ReportPreview } from './components/ReportPreview';
import { BsbAnalysisView } from './components/BsbAnalysisView';
import { HowToGuide } from './components/HowToGuide';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { ReportMeta } from './utils/excelGenerator';
import { generateQuarterExcel, generateHalfYearExcel, generateAnnualExcel } from './utils/excelGenerator';
import type { ParsedQuarterData, StudentScore } from './utils/emaktabParser';
import { parseEmaktabFile } from './utils/emaktabParser';
import type { BsbAnalysisData, BsbStudentRow } from './utils/sampleData';
import { sampleQuarterData, sampleHalfYearData, sampleAnnualData, sampleBsbAnalysisData } from './utils/sampleData';
import { Sparkles, Heart, PlayCircle, FileSpreadsheet, Layers, Award } from 'lucide-react';

const STORAGE_KEY = 'edtech_emaktab_meta_v4';

export function App() {
  const [mode, setMode] = useState<ReportMode>('quarter');

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'error', title?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { id, message, type, title };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Metadata with localStorage persistence (Default academic year is 2026-2027)
  const [meta, setMeta] = useState<ReportMeta>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          academicYear: parsed.academicYear || "2026-2027"
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      schoolName: "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab",
      gradeName: "7-A",
      subjectName: "O‘zbekiston tarixi",
      academicYear: "2026-2027",
      quarterText: "1-chorak",
      bsbType: "1-BSB",
      zavuchName: "A.Berdiyeva",
      teacherName: "M.Nazarova"
    };
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  }, [meta]);

  const handleUpdateMeta = (updated: Partial<ReportMeta>) => {
    setMeta(prev => ({ ...prev, ...updated }));
  };

  // Uploaded files and their parsed representations (for modes 1, 2, 3)
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [parsedDataList, setParsedDataList] = useState<(ParsedQuarterData | null)[]>([null, null, null, null]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // BSB Analysis State (for mode 4: BSB topshiriqlar tahlili)
  const [bsbData, setBsbData] = useState<BsbAnalysisData>(sampleBsbAnalysisData);

  // Switch mode handler
  const handleModeChange = (newMode: ReportMode) => {
    setMode(newMode);
    setFiles([null, null, null, null]);
    setParsedDataList([null, null, null, null]);

    if (newMode === 'quarter') {
      handleUpdateMeta({ quarterText: '1-chorak' });
    } else if (newMode === 'half_year') {
      handleUpdateMeta({ quarterText: 'IvaII chorak' });
    } else if (newMode === 'annual') {
      handleUpdateMeta({ quarterText: 'Yillik hisobot' });
    } else if (newMode === 'bsb_analysis') {
      handleUpdateMeta({
        quarterText: meta.quarterText || '1-chorak',
        bsbType: meta.bsbType || '1-BSB'
      });
    }
  };

  // Load sample data for Quarter mode
  const handleLoadSample = () => {
    setMode('quarter');
    setFiles([new File(["sample"], "7A O‘zbekiston tarixi 1-chorak.xlsx", { type: "application/vnd.ms-excel" }), null, null, null]);
    setParsedDataList([sampleQuarterData, null, null, null]);
    handleUpdateMeta({
      gradeName: "7-A",
      subjectName: "O‘zbekiston tarixi",
      academicYear: "2026-2027",
      quarterText: "1-chorak"
    });
    showToast("Namuna choraklik hisoboti yuklandi!", "success", "Tayyor");
  };

  // Load sample data for BSB Analysis mode (7A Fizika 1-BSB)
  const handleLoadBsbSample = () => {
    setMode('bsb_analysis');
    setBsbData(sampleBsbAnalysisData);
    handleUpdateMeta({
      gradeName: "7-A",
      subjectName: "Fizika",
      academicYear: "2026-2027",
      quarterText: "1-chorak",
      bsbType: "1-BSB"
    });
    showToast("7A Fizika 1-BSB tahlili namunasi yuklandi!", "success", "Namuna yuklandi");
  };

  // Load sample data for Half-Year mode (11B Tarbiya 1-2 chorak)
  const handleLoadHalfYearSample = () => {
    setMode('half_year');
    setFiles([
      new File(["sample1"], "11B TARBIA 1-CHORAK.xlsx", { type: "application/vnd.ms-excel" }),
      new File(["sample2"], "11B TARBIA 2-CHORAK.xlsx", { type: "application/vnd.ms-excel" }),
      null,
      null
    ]);
    setParsedDataList([sampleHalfYearData[0], sampleHalfYearData[1], null, null]);
    handleUpdateMeta({
      gradeName: "11-B",
      subjectName: "Tarbiya",
      academicYear: "2026-2027",
      quarterText: "IvaII chorak"
    });
    showToast("Yarim yillik namunaviy hisoboti yuklandi!", "success", "Namuna yuklandi");
  };

  // Load sample data for Annual mode (7B Tarix 1-4 choraklar)
  const handleLoadAnnualSample = () => {
    setMode('annual');
    setFiles([
      new File(["sample1"], "7B TARIX 1-CHORAK.xlsx", { type: "application/vnd.ms-excel" }),
      new File(["sample2"], "7B TARIX 2-CHORAK.xlsx", { type: "application/vnd.ms-excel" }),
      new File(["sample3"], "7B TARIX 3-CHORAK.xlsx", { type: "application/vnd.ms-excel" }),
      new File(["sample4"], "7B TARIX 4-CHORAK.xlsx", { type: "application/vnd.ms-excel" })
    ]);
    setParsedDataList([
      sampleAnnualData[0],
      sampleAnnualData[1],
      sampleAnnualData[2],
      sampleAnnualData[3]
    ]);
    handleUpdateMeta({
      gradeName: "7-B",
      subjectName: "O‘zbekiston tarixi",
      academicYear: "2026-2027",
      quarterText: "Yillik hisobot"
    });
    showToast("To‘liq yillik namunaviy hisoboti yuklandi!", "success", "Namuna yuklandi");
  };

  // File selection and parsing
  // CRITICAL REQUIREMENT: DO NOT auto-overwrite user's fields with file values!
  const handleFileSelect = async (slotIdx: number, file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const parsed = parseEmaktabFile(arrayBuffer, file.name);

      const newFiles = [...files];
      newFiles[slotIdx] = file;
      setFiles(newFiles);

      const newParsed = [...parsedDataList];
      newParsed[slotIdx] = parsed;
      setParsedDataList(newParsed);

      // If in bsb_analysis mode, populate students into BSB table automatically
      if (mode === 'bsb_analysis') {
        const totalMax = bsbData.tasks.reduce((sum, t) => sum + (Number(t.maxBall) || 0), 0);
        const bsbStudents: BsbStudentRow[] = parsed.students.map((st, i) => {
          const bsbScore = st.totalBsb ?? 0;
          const scores = bsbData.tasks.map(t => {
            if (totalMax > 0 && bsbScore > 0) {
              return Math.min(t.maxBall, Math.round((t.maxBall / totalMax) * bsbScore));
            }
            return 0;
          });
          return {
            id: `st-${st.index || i + 1}`,
            index: i + 1,
            fullName: st.fullName,
            scores
          };
        });
        setBsbData(prev => ({
          ...prev,
          students: bsbStudents
        }));
        showToast(`${parsed.students.length} nafar o‘quvchi BSB tahlili jadvaliga yuklandi!`, "success", "Muvaffaqiyatli");
      } else {
        showToast(`${file.name} tahlil qilindi (${parsed.students.length} ta o‘quvchi)`, "success", "Fayl yuklandi");
      }
    } catch (err) {
      console.error(err);
      showToast('Faylni o‘qishda xatolik yuz berdi. Iltimos, eMaktab faylini tekshiring!', 'error', 'Fayl xatosi');
    }
  };

  const handleFileRemove = (slotIdx: number) => {
    const newFiles = [...files];
    newFiles[slotIdx] = null;
    setFiles(newFiles);

    const newParsed = [...parsedDataList];
    newParsed[slotIdx] = null;
    setParsedDataList(newParsed);
    showToast("Fayl o'chirildi", "info");
  };

  // Update students when teacher edits scores inline in the table
  const handleUpdateStudents = (slotIdx: number, updatedStudents: StudentScore[]) => {
    const newParsedList = [...parsedDataList];
    if (newParsedList[slotIdx]) {
      newParsedList[slotIdx] = {
        ...newParsedList[slotIdx]!,
        students: updatedStudents
      };
      setParsedDataList(newParsedList);
    }
  };

  // Generate Excel report with strict validations & toasts (for modes 1, 2, 3)
  const handleDownload = async () => {
    if (mode === 'quarter' && !parsedDataList[0]) {
      showToast('Iltimos, avval eMaktab jurnal faylini yuklang!', 'error', 'Fayl yetishmaydi');
      return;
    }

    if (mode === 'half_year' && (!parsedDataList[0] || !parsedDataList[1])) {
      showToast('Iltimos, har ikkala chorak (1-chorak va 2-chorak) faylini yuklang!', 'error', 'Fayl yetishmaydi');
      return;
    }

    if (mode === 'annual') {
      const valid = parsedDataList.filter((p): p is ParsedQuarterData => p !== null);
      if (valid.length === 0) {
        showToast('Iltimos, kamida bitta chorak faylini yuklang!', 'error', 'Fayl yetishmaydi');
        return;
      }
    }

    setIsGenerating(true);
    try {
      const exportMeta: ReportMeta = {
        ...meta,
        gradeName: meta.gradeName || 'Sinf',
        subjectName: meta.subjectName || 'Fan',
        academicYear: meta.academicYear || '2026-2027',
        schoolName: meta.schoolName || "Umumiy o'rta ta'lim maktabi"
      };

      if (mode === 'quarter') {
        await generateQuarterExcel(parsedDataList[0]!, exportMeta);
      } else if (mode === 'half_year') {
        await generateHalfYearExcel(parsedDataList[0]!, parsedDataList[1]!, exportMeta);
      } else if (mode === 'annual') {
        const valid = parsedDataList.filter((p): p is ParsedQuarterData => p !== null);
        await generateAnnualExcel(valid, exportMeta);
      }
      showToast("Excel hisobot muvaffaqiyatli yuklab olindi!", "success", "Yuklab olindi");
    } catch (err: any) {
      console.error(err);
      showToast(`Hisobot yaratishda xatolik: ${err?.message || ''}`, 'error', 'Xatolik');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      <Header />

      {/* Hero Banner (Compact & Responsive) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>O‘zbekiston maktab o‘qituvchilari uchun 1 soniyali hisobot</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                eMaktab jurnallarini <span className="text-emerald-600">toza Excel</span> hisobotiga aylantiring
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
                Choraklik, Yarim yillik, Yillik hisobotlar hamda <strong>BSB topshiriqlar (1-ish, 2-ish... Jami va Foiz)</strong> tahlili.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <PlayCircle className="w-4 h-4 text-emerald-600" />
                <span>Choraklik namuna</span>
              </button>

              <button
                onClick={handleLoadHalfYearSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Yarim yillik namuna</span>
              </button>

              <button
                onClick={handleLoadAnnualSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Award className="w-4 h-4 text-purple-600" />
                <span>Yillik namuna</span>
              </button>

              <button
                onClick={handleLoadBsbSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>7A Fizika 1-BSB namuna</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        {/* Step 1: Mode selector */}
        <ModeSelector mode={mode} onChangeMode={handleModeChange} />

        {/* Step 2: Metadata form (Collapsible & 2026-2027 auto) */}
        <MetaForm meta={meta} onChangeMeta={handleUpdateMeta} mode={mode} />

        {/* Content based on Mode */}
        {mode === 'bsb_analysis' ? (
          <>
            {/* Step 3: Optional eMaktab file uploader for student list */}
            <FileUploader
              mode={mode}
              files={files}
              parsedDataList={parsedDataList}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              isLoading={isGenerating}
            />

            {/* Step 4: BSB Task Constructor + Random button + Table + Download */}
            <BsbAnalysisView
              meta={meta}
              data={bsbData}
              onUpdateData={setBsbData}
              onShowToast={showToast}
              isGenerating={isGenerating}
            />
          </>
        ) : (
          <>
            {/* Step 3: File upload for regular modes */}
            <FileUploader
              mode={mode}
              files={files}
              parsedDataList={parsedDataList}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              isLoading={isGenerating}
            />

            {/* Step 4: Live Preview & Download */}
            <ReportPreview
              mode={mode}
              meta={meta}
              parsedDataList={parsedDataList}
              onDownload={handleDownload}
              onUpdateStudents={handleUpdateStudents}
              onUpdateAllDataList={setParsedDataList}
              onShowToast={showToast}
              isGenerating={isGenerating}
            />
          </>
        )}

        {/* How to guide */}
        <HowToGuide />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">eMaktab Hisobot Generator</span>
            <span>• O‘zbekiston EdTech Startup MVP</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Ustozlarimiz vaqti qadrli bo‘lgani uchun</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>bilan yaratildi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
