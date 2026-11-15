import * as XLSX from 'xlsx';
import { toUzbekLatin } from './cyrillicToLatin';

export interface StudentScore {
  index: number;
  fullName: string;
  bsbScores: { label: string; maxBall: number; score: number | null }[];
  totalBsb: number | null;
  chsb: number | null;
  fb: number | null;
  totalScore: number | null;
  quarterGrade: number | null;
}

export interface ParsedQuarterData {
  fileName: string;
  schoolName?: string;
  gradeName: string;
  subjectName: string;
  academicYear: string;
  quarterNumber: number;
  teacherName: string;
  students: StudentScore[];
  bsbStructure: { label: string; maxBall: number }[];
}

export function parseEmaktabFile(fileBuffer: ArrayBuffer, fileName: string): ParsedQuarterData {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to 2D array of rows
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  let gradeName = '';
  let subjectName = '';
  let academicYear = '2025-2026';
  let teacherName = '';
  let quarterNumber = 1;

  // Extract meta info from top rows (first 10 rows)
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const row = rows[r];
    const text = row.map(c => String(c)).join(' ');
    
    // Check Sinf
    const sinfMatch = text.match(/Sinf:\s*([^\d\s\/-]+-?[^\s\/-]*|\d+[\s-]?[A-Za-zА-Яа-яЎўҚқҒғҲҳ]+)/i) || text.match(/Sinf:\s*([^\n\r]+)/i);
    if (sinfMatch && !gradeName) {
      gradeName = toUzbekLatin(sinfMatch[1].replace(/\d{4}\/\d{4}.*$/i, '').replace(/o‘quv.*$/i, '').trim());
    }
    
    // Check Year
    const yearMatch = text.match(/(\d{4}[\/-]\d{4})/);
    if (yearMatch && yearMatch[1]) {
      academicYear = yearMatch[1].replace('/', '-');
    }

    // Check Fan
    const fanMatch = text.match(/Fan:\s*([^\n\r]+)/i);
    if (fanMatch && !subjectName) {
      subjectName = toUzbekLatin(fanMatch[1].trim());
    }

    // Check Teacher
    const teacherMatch = text.match(/(?:o‘qituvchining\s+FIO|O‘qituvchi):\s*([^\n\r]+)/i);
    if (teacherMatch && !teacherName) {
      teacherName = toUzbekLatin(teacherMatch[1].trim());
    }
  }

  // Detect quarter from filename or headers
  const fLower = fileName.toLowerCase();
  if (fLower.includes('1-chorak') || fLower.includes('1_chorak') || fLower.includes('1 chorak') || fLower.includes('1-yarim') || fLower.includes('1 chorak')) {
    quarterNumber = 1;
  } else if (fLower.includes('2-chorak') || fLower.includes('2_chorak') || fLower.includes('2 chorak') || fLower.includes('2-yarim')) {
    quarterNumber = 2;
  } else if (fLower.includes('3-chorak') || fLower.includes('3_chorak') || fLower.includes('3 chorak')) {
    quarterNumber = 3;
  } else if (fLower.includes('4-chorak') || fLower.includes('4_chorak') || fLower.includes('4 chorak')) {
    quarterNumber = 4;
  }

  // Find column positions
  let nameColIdx = 1;
  const bsbCols: { colIdx: number; label: string; maxBall: number }[] = [];
  let chsbColIdx = -1;
  let fbColIdx = -1;
  let totalBallColIdx = -1;
  let gradeColIdx = -1;

  const maxCols = Math.max(...rows.slice(0, 15).map(r => r.length));

  for (let c = 0; c < maxCols; c++) {
    for (let r = 5; r <= 9; r++) {
      if (!rows[r] || rows[r][c] === undefined) continue;
      const cellVal = String(rows[r][c]).trim();
      const cellLower = cellVal.toLowerCase();

      if (cellLower.includes('o‘quvchining ism') || cellLower.includes('ism va familiyasi') || cellLower === 'f.i.sh.' || cellLower.includes('ўқувчининг исм') || cellLower.includes('фамилияси')) {
        nameColIdx = c;
      }
      
      // BSB check (Row 7 or 6 usually has "BSB")
      if (cellVal.toUpperCase() === 'BSB' || cellVal.toUpperCase().startsWith('BSB(') || cellVal.toUpperCase().startsWith('1-BSB') || cellVal.toUpperCase().startsWith('2-BSB') || cellVal.toUpperCase() === 'БСБ') {
        if (!bsbCols.some(b => b.colIdx === c)) {
          let maxBall = 50;
          if (rows[r + 1] && typeof rows[r + 1][c] === 'number') {
            maxBall = rows[r + 1][c];
          } else {
            const m = cellVal.match(/\((\d+)\)/);
            if (m) maxBall = parseInt(m[1]);
          }
          const label = `BSB(${maxBall})`;
          bsbCols.push({ colIdx: c, label, maxBall });
        }
      }

      // CHSB check
      if (cellVal.toUpperCase() === 'CHSB' || cellVal.toUpperCase() === 'CSB' || cellVal.toUpperCase().includes('CHSB(') || cellVal.toUpperCase().includes('CHSB') || cellVal.toUpperCase() === 'ЧСБ') {
        chsbColIdx = c;
      }

      // FB check
      if (cellVal.toUpperCase() === 'FB' || cellVal.toUpperCase().includes('FB(') || cellVal.toUpperCase() === 'ФБ') {
        fbColIdx = c;
      }

      // Total score (Ballar)
      if (cellLower === 'ballar' || cellLower === 'jami ball' || cellLower === 'jami ball(100)' || cellLower === 'jami' || cellLower === 'баллар') {
        totalBallColIdx = c;
      }

      // Grade check (Tavsiya. Baho or 1 Chorak or Yarim yillik)
      if (cellLower.includes('tavsiya. baho') || cellLower.includes('tavsiya') || cellLower.includes('chorak') || cellLower.includes('yarim yillik') || cellLower.includes('тавсия')) {
        gradeColIdx = c;
      }
    }
  }

  // Fallback scan
  if (chsbColIdx === -1 || fbColIdx === -1 || bsbCols.length === 0) {
    for (let c = 0; c < maxCols; c++) {
      let combined = '';
      for (let r = 5; r <= 9; r++) {
        if (rows[r] && rows[r][c] !== undefined) combined += ' ' + String(rows[r][c]);
      }
      combined = combined.toUpperCase();
      if ((combined.includes('BSB') || combined.includes('БСБ')) && !bsbCols.some(b => b.colIdx === c)) {
        let maxBall = 50;
        const m = combined.match(/(?:50|40|35|30|25|20|15)/);
        if (m) maxBall = parseInt(m[0]);
        bsbCols.push({ colIdx: c, label: `BSB(${maxBall})`, maxBall });
      } else if ((combined.includes('CHSB') || combined.includes('ЧСБ')) && chsbColIdx === -1) {
        chsbColIdx = c;
      } else if ((combined.includes('FB') || combined.includes('ФБ')) && fbColIdx === -1) {
        fbColIdx = c;
      } else if ((combined.includes('BALLAR') || combined.includes('БАЛЛАР')) && totalBallColIdx === -1) {
        totalBallColIdx = c;
      }
    }
  }

  if (bsbCols.length > 1) {
    bsbCols.forEach((b, idx) => {
      b.label = `${idx + 1}-BSB(${b.maxBall})`;
    });
  }

  // Parse student records
  const students: StudentScore[] = [];
  let studentCounter = 1;

  for (let r = 6; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawName = String(row[nameColIdx] || '').trim();
    if (!rawName) continue;

    // AUTOMATIC TRANSLITERATION: Convert Cyrillic / Russian characters to clean Uzbek Latin!
    const nameCell = toUzbekLatin(rawName);

    const nameLower = nameCell.toLowerCase();
    if (
      nameLower.includes('o‘quvchining') ||
      nameLower.includes("o'quvchining") ||
      nameLower.includes('familiyasi') ||
      nameLower.includes('f.i.sh') ||
      nameLower.includes('jami') ||
      nameLower.includes('o‘rtacha') ||
      nameLower.includes("o'rtacha") ||
      nameLower.includes('ballar') ||
      nameLower.includes('son')
    ) {
      continue;
    }

    const words = nameCell.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 2) continue;
    if (/^\d+$/.test(nameCell)) continue;

    // Extract BSB scores
    const bsbScores = bsbCols.map(b => {
      const val = row[b.colIdx];
      let num: number | null = null;
      if (typeof val === 'number') num = val;
      else if (val && !isNaN(parseFloat(val))) num = parseFloat(val);
      return { label: b.label, maxBall: b.maxBall, score: num };
    });

    // CHSB score
    let chsbNum: number | null = null;
    if (chsbColIdx !== -1) {
      const val = row[chsbColIdx];
      if (typeof val === 'number') chsbNum = val;
      else if (val && !isNaN(parseFloat(val))) chsbNum = parseFloat(val);
    }

    // FB score
    let fbNum: number | null = null;
    if (fbColIdx !== -1) {
      const val = row[fbColIdx];
      if (typeof val === 'number') fbNum = val;
      else if (val && !isNaN(parseFloat(val))) fbNum = parseFloat(val);
    }

    // Total score
    let totalScoreNum: number | null = null;
    if (totalBallColIdx !== -1) {
      const val = row[totalBallColIdx];
      if (typeof val === 'number') totalScoreNum = val;
      else if (val && !isNaN(parseFloat(val))) totalScoreNum = parseFloat(val);
    }

    const sumBsb = bsbScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
    if (totalScoreNum === null) {
      totalScoreNum = sumBsb + (chsbNum || 0) + (fbNum || 0);
    }

    // Quarter Grade
    let gradeNum: number | null = null;
    if (gradeColIdx !== -1) {
      const val = row[gradeColIdx];
      if (typeof val === 'number') gradeNum = Math.round(val);
      else if (val && !isNaN(parseFloat(val))) gradeNum = Math.round(parseFloat(val));
    }

    if (!gradeNum || gradeNum < 2 || gradeNum > 5) {
      if (totalScoreNum !== null) {
        if (totalScoreNum >= 86) gradeNum = 5;
        else if (totalScoreNum >= 71) gradeNum = 4;
        else if (totalScoreNum >= 56) gradeNum = 3;
        else gradeNum = 2;
      }
    }

    students.push({
      index: studentCounter++,
      fullName: nameCell,
      bsbScores,
      totalBsb: sumBsb,
      chsb: chsbNum,
      fb: fbNum,
      totalScore: totalScoreNum,
      quarterGrade: gradeNum
    });
  }

  return {
    fileName,
    gradeName: gradeName || '8-B',
    subjectName: subjectName || 'Tarbiya',
    academicYear: academicYear || '2025-2026',
    quarterNumber,
    teacherName,
    students,
    bsbStructure: bsbCols.map(b => ({ label: b.label, maxBall: b.maxBall }))
  };
}
