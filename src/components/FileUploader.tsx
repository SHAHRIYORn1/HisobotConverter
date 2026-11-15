import React, { useRef } from 'react';
import { UploadCloud, FileCheck2, Trash2, AlertCircle } from 'lucide-react';
import type { ReportMode } from './ModeSelector';
import type { ParsedQuarterData } from '../utils/emaktabParser';

interface FileUploaderProps {
  mode: ReportMode;
  files: (File | null)[];
  parsedDataList: (ParsedQuarterData | null)[];
  onFileSelect: (index: number, file: File) => void;
  onFileRemove: (index: number) => void;
  isLoading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  mode,
  files,
  parsedDataList,
  onFileSelect,
  onFileRemove
}) => {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getSlotConfig = () => {
    if (mode === 'quarter') {
      return [
        {
          title: 'eMaktab Jurnal fayli (.xls yoki .xlsx)',
          subtitle: 'Kerakli chorak jurnalini yuklang (masalan: 7-b-Tarix.xls)',
          badge: '1-Chorak jurnali'
        }
      ];
    } else if (mode === 'half_year') {
      return [
        {
          title: '1-fayl: BSB olingan chorak fayli',
          subtitle: '1-chorak (yoki 3-chorak) jurnali — tizim bundan BSB ballarini oladi',
          badge: '1-Chorak (BSB)'
        },
        {
          title: '2-fayl: ChSB va FB olingan chorak fayli',
          subtitle: '2-chorak (yoki 4-chorak) jurnali — tizim bundan ChSB va FB ballarini oladi',
          badge: '2-Chorak (ChSB & FB)'
        }
      ];
    } else {
      return [
        {
          title: '1-chorak (yoki 1-yarim yillik) fayli',
          subtitle: '1-chorak eMaktab jurnali',
          badge: '1-Chorak'
        },
        {
          title: '2-chorak (yoki 2-yarim yillik) fayli',
          subtitle: '2-chorak eMaktab jurnali',
          badge: '2-Chorak'
        },
        {
          title: '3-chorak fayli (agar 4 chorakli fan bo‘lsa)',
          subtitle: '3-chorak eMaktab jurnali (ixtiyoriy)',
          badge: '3-Chorak'
        },
        {
          title: '4-chorak fayli (agar 4 chorakli fan bo‘lsa)',
          subtitle: '4-chorak eMaktab jurnali (ixtiyoriy)',
          badge: '4-Chorak'
        }
      ];
    }
  };

  const slots = getSlotConfig();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        onFileSelect(slotIdx, file);
      } else {
        alert('Iltimos, faqat Excel (.xls yoki .xlsx) formatidagi faylni yuklang!');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
            3
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">eMaktab fayllarini yuklash</h2>
            <p className="text-xs text-slate-500">eMaktab tizimidan yuklab olingan asl faylni shunchaki bu yerga tashlang</p>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${slots.length > 2 ? 'grid-cols-1 sm:grid-cols-2' : slots.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {slots.map((slot, idx) => {
          const file = files[idx];
          const parsed = parsedDataList[idx];

          return (
            <div
              key={idx}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, idx)}
              className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                file
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50 bg-slate-50/20'
              }`}
            >
              <input
                type="file"
                ref={el => { fileInputRefs.current[idx] = el; }}
                accept=".xls,.xlsx"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    onFileSelect(idx, e.target.files[0]);
                  }
                }}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mb-2">
                    {slot.badge} muvaffaqiyatli yuklandi
                  </span>
                  <p className="text-sm font-bold text-slate-900 max-w-[280px] truncate mb-1">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    {(file.size / 1024).toFixed(1)} KB {parsed ? `• ${parsed.students.length} ta o‘quvchi aniqlandi` : ''}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Boshqa fayl tanlash
                    </button>
                    <button
                      type="button"
                      onClick={() => onFileRemove(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Faylni o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRefs.current[idx]?.click()}
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-2">
                    {slot.badge}
                  </span>
                  <p className="text-sm font-bold text-slate-900 mb-1">
                    {slot.title}
                  </p>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs">
                    {slot.subtitle}
                  </p>
                  <span className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm shadow-emerald-600/20 transition-all">
                    Faylni tanlash
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-600">
        <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Xavfsizlik kafolati: </span>
          Fayllaringiz internetga yoki begona serverlarga yuklanmaydi! Barcha tahlil va tozalash to‘g‘ridan-to‘g‘ri sizning brauzeringiz ichida 1 soniyada xavfsiz amalga oshiriladi.
        </div>
      </div>
    </div>
  );
};
