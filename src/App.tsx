import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import type { ReportMode } from './components/ModeSelector';
import { MetaForm } from './components/MetaForm';
import { FileUploader } from './components/FileUploader';
import { ReportPreview } from './components/ReportPreview';
import { HowToGuide } from './components/HowToGuide';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { ReportMeta } from './utils/excelGenerator';
import { generateQuarterExcel, generateHalfYearExcel, generateAnnualExcel } from './utils/excelGenerator';
import type { ParsedQuarterData, StudentScore } from './utils/emaktabParser';
import { parseEmaktabFile } from './utils/emaktabParser';
import { sampleQuarterData } from './utils/sampleData';
import { Sparkles, Heart, PlayCircle } from 'lucide-react';

const STORAGE_KEY = 'edtech_emaktab_meta_v2';

export function App() {
  const [mode, setMode] = useState<ReportMode>('quarter');

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'error', title?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { id, message, type, title };
    setToasts(prev => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Metadata with localStorage persistence
  const [meta, setMeta] = useState<ReportMeta>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      schoolName: "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab",
      gradeName: "8-B",
      subjectName: "Tarbiya",
      academicYear: "2025-2026",
      quarterText: "I chorak",
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

  // Uploaded files and their parsed representations
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [parsedDataList, setParsedDataList] = useState<(ParsedQuarterData | null)[]>([null, null, null, null]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Switch mode handler
  const handleModeChange = (newMode: ReportMode) => {
    setMode(newMode);
    setFiles([null, null, null, null]);
    setParsedDataList([null, null, null, null]);

    if (newMode === 'quarter') {
      handleUpdateMeta({ quarterText: 'I chorak' });
    } else if (newMode === 'half_year') {
      handleUpdateMeta({ quarterText: 'IvaII chorak' });
    } else {
      handleUpdateMeta({ quarterText: 'Yillik hisobot' });
    }
  };

  // Load sample data for immediate test
  const handleLoadSample = () => {
    setMode('quarter');
    setFiles([new File(["sample"], "8B TARBIYA 1-CHORAK.xlsx", { type: "application/vnd.ms-excel" }), null, null, null]);
    setParsedDataList([sampleQuarterData, null, null, null]);
    handleUpdateMeta({
      schoolName: "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab",
      gradeName: "8-B",
      subjectName: "Tarbiya",
      academicYear: "2025-2026",
      quarterText: "I chorak",
      zavuchName: "A.Berdiyeva",
      teacherName: meta.teacherName || "M.Nazarova"
    });
    showToast("Namuna ma'lumotlar muvaffaqiyatli yuklandi!", "success", "Tayyor");
  };

  // File selection and parsing
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

      // Auto-populate meta ONLY if user hasn't explicitly set them
      // NOTE: User requested that Teacher Name must be entered by user (or keep user's choice)
      // because eMaktab files often have multiple co-teachers listed and clutters the field.
      const updates: Partial<ReportMeta> = {};
      if (parsed.gradeName && !meta.gradeName) updates.gradeName = parsed.gradeName;
      if (parsed.subjectName && !meta.subjectName) updates.subjectName = parsed.subjectName;
      if (parsed.academicYear) updates.academicYear = parsed.academicYear;

      if (Object.keys(updates).length > 0) {
        handleUpdateMeta(updates);
      }

      showToast(`${file.name} muvaffaqiyatli tahlil qilindi (${parsed.students.length} ta o‘quvchi)`, "success", "Fayl yuklandi");
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

  // Generate Excel report with strict validations & toasts
  const handleDownload = async () => {
    // 1. Validation: Sinf nomi
    if (!meta.gradeName || meta.gradeName.trim() === '') {
      showToast('Iltimos, Sinf nomini kiriting! (Masalan: 8-B yoki 7-B)', 'warning', 'Sinf kiritilmagan');
      return;
    }

    // 2. Validation: O'qituvchi F.I.Sh.
    if (!meta.teacherName || meta.teacherName.trim() === '') {
      showToast('Iltimos, O‘qituvchi F.I.Sh.ni kiriting! (Ushbu fandan dars beradigan ustoz ismi)', 'warning', 'O‘qituvchi kiritilmagan');
      return;
    }

    // 3. Validation: Maktab nomi
    if (!meta.schoolName || meta.schoolName.trim() === '') {
      showToast('Iltimos, Maktab nomini kiriting!', 'warning', 'Maktab nomi bo‘sh');
      return;
    }

    // 4. Validation: File upload check
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
      if (mode === 'quarter') {
        await generateQuarterExcel(parsedDataList[0]!, meta);
      } else if (mode === 'half_year') {
        await generateHalfYearExcel(parsedDataList[0]!, parsedDataList[1]!, meta);
      } else if (mode === 'annual') {
        const valid = parsedDataList.filter((p): p is ParsedQuarterData => p !== null);
        await generateAnnualExcel(valid, meta);
      }
      showToast("Excel hisobot muvaffaqiyatli yuklab olindi! Imzo joylari bilan tayyor.", "success", "Yuklab olindi");
    } catch (err: any) {
      console.error(err);
      showToast(`Hisobot yaratishda xatolik yuz berdi: ${err?.message || ''}`, 'error', 'Xatolik');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      <Header />

      {/* Hero Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>O‘zbekistondagi maktab o‘qituvchilari uchun 1-soniyali hisobot</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            eMaktab jurnallarini <span className="text-emerald-600">toza va rasmiy Excel</span> hisobotiga aylantiring
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Ortiqcha kunlik baholar va sanalarni avtomatik tozalaydi. BSB, FB va ChSB ballari, Zavuch (O‘IBDO‘) talab qiladigan format va imzo chiziqlari bilan tayyor .xlsx jadvalni 1 soniyada tayyorlaydi.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <PlayCircle className="w-4 h-4 text-emerald-600" />
              <span>Namuna bilan darhol sinab ko‘rish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Step 1: Mode selector */}
        <ModeSelector mode={mode} onChangeMode={handleModeChange} />

        {/* Step 2: Metadata form */}
        <MetaForm meta={meta} onChangeMeta={handleUpdateMeta} mode={mode} />

        {/* Step 3: File upload */}
        <FileUploader
          mode={mode}
          files={files}
          parsedDataList={parsedDataList}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          isLoading={isGenerating}
        />

        {/* Live Preview & Download (with inline editing, 0-removal, sort and signature line) */}
        <ReportPreview
          mode={mode}
          meta={meta}
          parsedDataList={parsedDataList}
          onDownload={handleDownload}
          onUpdateStudents={handleUpdateStudents}
          onShowToast={showToast}
          isGenerating={isGenerating}
        />

        {/* How to guide */}
        <HowToGuide />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
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
