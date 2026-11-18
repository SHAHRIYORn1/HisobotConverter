import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ParsedQuarterData } from './emaktabParser';
import type { BsbAnalysisData } from './sampleData';

export interface ReportMeta {
  schoolName: string;
  gradeName: string;
  subjectName: string;
  academicYear: string;
  quarterText: string;
  zavuchName: string;
  teacherName: string;
  includeExam?: boolean;
  bsbType?: string;
}

// Thin border style for all data cells
const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
};

// Signature underline border style (as shown in user screenshot)
const signatureBorder: Partial<ExcelJS.Borders> = {
  bottom: { style: 'thin' }
};

// 1. Generate Single Quarter Report (Rejim 1)
export async function generateQuarterExcel(data: ParsedQuarterData, meta: ReportMeta): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EdTech eMaktab Analiz';
  
  const sheetName = `${meta.quarterText} natijalari`.substring(0, 31);
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  const bsbCount = (data.bsbStructure && data.bsbStructure.length > 0) ? data.bsbStructure.length : 1;
  const totalCols = bsbCount + 6; // #, F.I.Sh., BSBs..., ChSB, FB, Jami, Baho

  // Setup Column Widths
  const colWidths: { [key: number]: number } = {
    1: 5,   // #
    2: 36,  // F.I.Sh.
  };
  for (let i = 3; i <= totalCols; i++) {
    colWidths[i] = 13;
  }
  colWidths[totalCols - 1] = 15; // Jami ball(100)
  colWidths[totalCols] = 14;     // Choraklik baho

  for (let c = 1; c <= totalCols; c++) {
    ws.getColumn(c).width = colWidths[c] || 12;
  }

  // Row 1: School Name
  const lastColLetter = ws.getColumn(totalCols).letter;
  ws.mergeCells(`A1:${lastColLetter}1`);
  const row1 = ws.getCell('A1');
  row1.value = meta.schoolName || "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab";
  row1.font = { name: 'Times New Roman', size: 12, bold: true };
  row1.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 2: Title
  ws.mergeCells(`A2:${lastColLetter}2`);
  const row2 = ws.getCell('A2');
  row2.value = `${meta.gradeName} -sinf   "${meta.subjectName}" fanidan ${meta.academicYear}-o'quv yili ${meta.quarterText} natijalari`;
  row2.font = { name: 'Times New Roman', size: 11, bold: false };
  row2.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 4: Header
  const headerRow = ws.getRow(4);
  const headers: string[] = ['#', 'F.I.Sh.'];
  const struct = (data.bsbStructure && data.bsbStructure.length > 0)
    ? data.bsbStructure
    : [{ label: 'BSB(50)', maxBall: 50 }];

  struct.forEach((b, idx) => {
    headers.push(b.label || (struct.length > 1 ? `${idx + 1}-BSB(${b.maxBall || 50})` : `BSB(${b.maxBall || 50})`));
  });
  headers.push('ChSB(40)', 'FB(10)', 'Jami ball(100)', 'Choraklik baho');

  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' }
    };
  });
  headerRow.height = 28;

  // Student rows
  let currRow = 5;
  data.students.forEach((st, idx) => {
    const row = ws.getRow(currRow);
    let c = 1;
    
    // #
    const cellIdx = row.getCell(c++);
    cellIdx.value = idx + 1;
    cellIdx.alignment = { horizontal: 'center', vertical: 'middle' };
    cellIdx.border = thinBorder;
    cellIdx.font = { name: 'Times New Roman', size: 10 };

    // F.I.Sh.
    const cellName = row.getCell(c++);
    cellName.value = st.fullName;
    cellName.alignment = { horizontal: 'left', vertical: 'middle' };
    cellName.border = thinBorder;
    cellName.font = { name: 'Times New Roman', size: 10 };

    // BSB(s) - Fayldagi har qanday BSB ustunlari bo'yicha dinamik
    struct.forEach((_, bIdx) => {
      const cellBsb = row.getCell(c++);
      const val = st.bsbScores?.[bIdx]?.score ?? (bIdx === 0 ? st.totalBsb : null);
      cellBsb.value = val !== null && val !== undefined ? val : '';
      cellBsb.alignment = { horizontal: 'center', vertical: 'middle' };
      cellBsb.border = thinBorder;
      cellBsb.font = { name: 'Times New Roman', size: 10 };
    });

    // ChSB
    const cellChsb = row.getCell(c++);
    cellChsb.value = st.chsb !== null ? st.chsb : 0;
    cellChsb.alignment = { horizontal: 'center', vertical: 'middle' };
    cellChsb.border = thinBorder;
    cellChsb.font = { name: 'Times New Roman', size: 10 };

    // FB
    const cellFb = row.getCell(c++);
    cellFb.value = st.fb !== null ? st.fb : 0;
    cellFb.alignment = { horizontal: 'center', vertical: 'middle' };
    cellFb.border = thinBorder;
    cellFb.font = { name: 'Times New Roman', size: 10 };

    // Jami ball
    const cellTotal = row.getCell(c++);
    cellTotal.value = st.totalScore !== null ? st.totalScore : 0;
    cellTotal.alignment = { horizontal: 'center', vertical: 'middle' };
    cellTotal.border = thinBorder;
    cellTotal.font = { name: 'Times New Roman', size: 10, bold: true };

    // Choraklik baho
    const cellGrade = row.getCell(c++);
    cellGrade.value = st.quarterGrade !== null ? st.quarterGrade : 2;
    cellGrade.alignment = { horizontal: 'center', vertical: 'middle' };
    cellGrade.border = thinBorder;
    cellGrade.font = { name: 'Times New Roman', size: 10, bold: true };

    row.height = 20;
    currRow++;
  });

  const lastStudentRow = currRow - 1;

  // Jami Row
  ws.mergeCells(`A${currRow}:B${currRow}`);
  const jamiRow = ws.getRow(currRow);
  const jamiLabel = jamiRow.getCell(1);
  jamiLabel.value = '  Jami:';
  jamiLabel.font = { name: 'Times New Roman', size: 10, bold: true };
  jamiLabel.alignment = { horizontal: 'left', vertical: 'middle' };
  jamiRow.getCell(1).border = thinBorder;
  jamiRow.getCell(2).border = thinBorder;

  for (let c = 3; c <= totalCols; c++) {
    const colLetter = ws.getColumn(c).letter;
    const cell = jamiRow.getCell(c);
    cell.value = { formula: `SUM(${colLetter}5:${colLetter}${lastStudentRow})` };
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }
  currRow++;

  // O'rtacha Row
  ws.mergeCells(`A${currRow}:B${currRow}`);
  const ortachaRow = ws.getRow(currRow);
  const ortachaLabel = ortachaRow.getCell(1);
  ortachaLabel.value = "  O'rtacha:";
  ortachaLabel.font = { name: 'Times New Roman', size: 10, bold: true };
  ortachaLabel.alignment = { horizontal: 'left', vertical: 'middle' };
  ortachaRow.getCell(1).border = thinBorder;
  ortachaRow.getCell(2).border = thinBorder;

  for (let c = 3; c <= totalCols; c++) {
    const colLetter = ws.getColumn(c).letter;
    const cell = ortachaRow.getCell(c);
    cell.value = { formula: `ROUND(AVERAGE(${colLetter}5:${colLetter}${lastStudentRow}), 1)` };
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }
  currRow += 3; // empty gap

  // Summary statistics & signatures (exactly as requested with signature line)
  const grade5Count = data.students.filter(s => s.quarterGrade === 5).length;
  const grade4Count = data.students.filter(s => s.quarterGrade === 4).length;
  const grade3Count = data.students.filter(s => s.quarterGrade === 3).length;
  const grade2Count = data.students.filter(s => s.quarterGrade === 2).length;

  // Determine signature column positions
  const sigLabelCol = Math.max(5, totalCols - 2);
  const sigLineCol = sigLabelCol + 1;
  const sigNameCol = sigLabelCol + 2;

  // Row 1 of stats: "5" baholar & O'IBDO'
  const statR1 = ws.getRow(currRow);
  statR1.getCell(2).value = 'Jami baholar:';
  statR1.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
  statR1.getCell(3).value = '"5" baholar:';
  statR1.getCell(3).font = { name: 'Times New Roman', size: 10 };
  statR1.getCell(4).value = `${grade5Count}ta o’quvchi`;
  statR1.getCell(4).font = { name: 'Times New Roman', size: 10 };

  // O'IBDO' signature block (Rasm 2 dagidek)
  const zLabel = statR1.getCell(sigLabelCol);
  zLabel.value = "O‘IBDO‘ :";
  zLabel.font = { name: 'Times New Roman', size: 10, bold: true };

  const zLine = statR1.getCell(sigLineCol);
  zLine.value = '';
  zLine.border = signatureBorder; // pastki chiziq

  const zName = statR1.getCell(sigNameCol);
  zName.value = meta.zavuchName || 'A.Berdiyeva';
  zName.font = { name: 'Times New Roman', size: 10 };
  currRow++;

  // Row 2 of stats: "4" baholar
  const statR2 = ws.getRow(currRow);
  statR2.getCell(3).value = '"4" baholar:';
  statR2.getCell(3).font = { name: 'Times New Roman', size: 10 };
  statR2.getCell(4).value = `${grade4Count}ta o’quvchi`;
  statR2.getCell(4).font = { name: 'Times New Roman', size: 10 };
  currRow++;

  // Row 3 of stats: "3" baholar & O'qituvchi
  const statR3 = ws.getRow(currRow);
  statR3.getCell(3).value = '"3" baholar:';
  statR3.getCell(3).font = { name: 'Times New Roman', size: 10 };
  statR3.getCell(4).value = `${grade3Count}ta o’quvchi`;
  statR3.getCell(4).font = { name: 'Times New Roman', size: 10 };

  // O'qituvchi signature block (Rasm 2 dagidek)
  const tLabel = statR3.getCell(sigLabelCol);
  tLabel.value = "O‘qituvchi :";
  tLabel.font = { name: 'Times New Roman', size: 10, bold: true };

  const tLine = statR3.getCell(sigLineCol);
  tLine.value = '';
  tLine.border = signatureBorder; // pastki chiziq

  const tName = statR3.getCell(sigNameCol);
  tName.value = meta.teacherName || 'M.Nazarova';
  tName.font = { name: 'Times New Roman', size: 10 };
  currRow++;

  // Row 4 of stats: "2" baholar
  const statR4 = ws.getRow(currRow);
  statR4.getCell(3).value = '"2" baholar:';
  statR4.getCell(3).font = { name: 'Times New Roman', size: 10 };
  statR4.getCell(4).value = `${grade2Count}ta o’quvchi`;
  statR4.getCell(4).font = { name: 'Times New Roman', size: 10 };

  // Write and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `${meta.gradeName} ${meta.subjectName} ${meta.quarterText}.xlsx`.replace(/[/\\?%*:|"<>]/g, '_');
  saveAs(blob, fileName);
}

// 2. Generate Combined Half-Year Report (Rejim 2: I va II yoki III va IV chorak)
export async function generateHalfYearExcel(
  q1Data: ParsedQuarterData,
  q2Data: ParsedQuarterData,
  meta: ReportMeta
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(`${meta.quarterText} natijalari`.substring(0, 31), {
    views: [{ showGridLines: true }]
  });

  ws.getColumn(1).width = 5;  // #
  ws.getColumn(2).width = 36; // F.I.Sh.
  ws.getColumn(3).width = 18; // BSB(50) 1-CHORAK
  ws.getColumn(4).width = 18; // CHSB(40) 2-CHORAK
  ws.getColumn(5).width = 10; // FB(10)
  ws.getColumn(6).width = 15; // Jami ball(100)
  ws.getColumn(7).width = 15; // Choraklik baho

  // Row 1: School Name
  ws.mergeCells('A1:G1');
  const row1 = ws.getCell('A1');
  row1.value = meta.schoolName || "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab";
  row1.font = { name: 'Times New Roman', size: 12, bold: true };
  row1.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 2: Title
  ws.mergeCells('A2:G2');
  const row2 = ws.getCell('A2');
  row2.value = `${meta.gradeName} -sinf   "${meta.subjectName}" fanidan ${meta.academicYear}-o'quv yili ${meta.quarterText} natijalari `;
  row2.font = { name: 'Times New Roman', size: 11, bold: false };
  row2.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 4: Header
  const headerRow = ws.getRow(4);
  const isSecondHalf = meta.quarterText.includes('III') || meta.quarterText.includes('3') || meta.quarterText.includes('4') || meta.quarterText.includes('2-yarim');
  const q1Label = isSecondHalf ? '3-CHORAK' : '1-CHORAK';
  const q2Label = isSecondHalf ? '4-CHORAK' : '2-CHORAK';

  const headers = [
    '#',
    'F.I.Sh.',
    `BSB(50) ${q1Label}`,
    `CHSB(40) ${q2Label}`,
    'FB(10)',
    'Jami ball(100)',
    'Choraklik baho'
  ];

  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' }
    };
  });
  headerRow.height = 28;

  // Match students by name
  const q2StudentMap = new Map<string, typeof q2Data.students[0]>();
  q2Data.students.forEach(s => {
    q2StudentMap.set(s.fullName.trim().toLowerCase(), s);
  });

  let currRow = 5;
  const mergedStudents: { fullName: string; bsb: number; chsb: number; fb: number; total: number; grade: number }[] = [];

  q1Data.students.forEach((s1, idx) => {
    const s2 = q2StudentMap.get(s1.fullName.trim().toLowerCase()) || q2Data.students[idx];
    const bsb = s1.totalBsb ?? (s1.bsbScores[0]?.score ?? 0);
    const chsb = s2 ? (s2.chsb ?? 0) : 0;
    const fb = s2 ? (s2.fb ?? 0) : 0;
    const total = bsb + chsb + fb;
    let grade = 2;
    if (total >= 86) grade = 5;
    else if (total >= 71) grade = 4;
    else if (total >= 56) grade = 3;

    mergedStudents.push({ fullName: s1.fullName, bsb, chsb, fb, total, grade });

    const row = ws.getRow(currRow);
    row.getCell(1).value = idx + 1;
    row.getCell(2).value = s1.fullName;
    row.getCell(3).value = bsb;
    row.getCell(4).value = chsb;
    row.getCell(5).value = fb;
    row.getCell(6).value = total;
    row.getCell(7).value = grade;

    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.alignment = {
        horizontal: c === 2 ? 'left' : 'center',
        vertical: 'middle'
      };
      if (c >= 6) cell.font = { name: 'Times New Roman', size: 10, bold: true };
    }
    row.height = 20;
    currRow++;
  });

  const lastStudentRow = currRow - 1;

  // Jami Row
  ws.mergeCells(`A${currRow}:B${currRow}`);
  const jamiRow = ws.getRow(currRow);
  jamiRow.getCell(1).value = '  Jami:';
  jamiRow.getCell(1).font = { name: 'Times New Roman', size: 10, bold: true };
  jamiRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
  jamiRow.getCell(1).border = thinBorder;
  jamiRow.getCell(2).border = thinBorder;

  for (let c = 3; c <= 7; c++) {
    const colLetter = ws.getColumn(c).letter;
    const cell = jamiRow.getCell(c);
    cell.value = { formula: `SUM(${colLetter}5:${colLetter}${lastStudentRow})` };
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }
  currRow++;

  // O'rtacha Row
  ws.mergeCells(`A${currRow}:B${currRow}`);
  const ortachaRow = ws.getRow(currRow);
  ortachaRow.getCell(1).value = "  O'rtacha:";
  ortachaRow.getCell(1).font = { name: 'Times New Roman', size: 10, bold: true };
  ortachaRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
  ortachaRow.getCell(1).border = thinBorder;
  ortachaRow.getCell(2).border = thinBorder;

  for (let c = 3; c <= 7; c++) {
    const colLetter = ws.getColumn(c).letter;
    const cell = ortachaRow.getCell(c);
    cell.value = { formula: `ROUND(AVERAGE(${colLetter}5:${colLetter}${lastStudentRow}), 1)` };
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = thinBorder;
  }
  currRow += 3;

  // Stats & Signatures
  const grade5 = mergedStudents.filter(s => s.grade === 5).length;
  const grade4 = mergedStudents.filter(s => s.grade === 4).length;
  const grade3 = mergedStudents.filter(s => s.grade === 3).length;
  const grade2 = mergedStudents.filter(s => s.grade === 2).length;

  const statR1 = ws.getRow(currRow);
  statR1.getCell(2).value = 'Jami baholar:';
  statR1.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
  statR1.getCell(3).value = '"5" baholar:';
  statR1.getCell(3).font = { name: 'Times New Roman', size: 10 };
  statR1.getCell(4).value = `${grade5}ta o’quvchi`;
  statR1.getCell(4).font = { name: 'Times New Roman', size: 10 };

  // O'IBDO' signature line (Rasm 2 dagidek)
  statR1.getCell(5).value = "O‘IBDO‘ :";
  statR1.getCell(5).font = { name: 'Times New Roman', size: 10, bold: true };
  statR1.getCell(6).value = '';
  statR1.getCell(6).border = signatureBorder;
  statR1.getCell(7).value = meta.zavuchName || 'A.Berdiyeva';
  statR1.getCell(7).font = { name: 'Times New Roman', size: 10 };
  currRow++;

  const statR2 = ws.getRow(currRow);
  statR2.getCell(3).value = '"4" baholar:';
  statR2.getCell(3).font = { name: 'Times New Roman', size: 10 };
  statR2.getCell(4).value = `${grade4}ta o’quvchi`;
  statR2.getCell(4).font = { name: 'Times New Roman', size: 10 };
  currRow++;

  const statR3 = ws.getRow(currRow);
  statR3.getCell(3).value = '"3" baholar:';
  statR3.getCell(3).font = { name: 'Times New Roman', size: 10 };
  statR3.getCell(4).value = `${grade3}ta o’quvchi`;
  statR3.getCell(4).font = { name: 'Times New Roman', size: 10 };

  // O'qituvchi signature line (Rasm 2 dagidek)
  statR3.getCell(5).value = "O‘qituvchi :";
  statR3.getCell(5).font = { name: 'Times New Roman', size: 10, bold: true };
  statR3.getCell(6).value = '';
  statR3.getCell(6).border = signatureBorder;
  statR3.getCell(7).value = meta.teacherName || 'M.Nazarova';
  statR3.getCell(7).font = { name: 'Times New Roman', size: 10 };
  currRow++;

  const statR4 = ws.getRow(currRow);
  statR4.getCell(3).value = '"2" baholar:';
  statR4.getCell(3).font = { name: 'Times New Roman', size: 10 };
  statR4.getCell(4).value = `${grade2}ta o’quvchi`;
  statR4.getCell(4).font = { name: 'Times New Roman', size: 10 };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `${meta.gradeName} ${meta.subjectName} ${meta.quarterText}.xlsx`.replace(/[/\\?%*:|"<>]/g, '_');
  saveAs(blob, fileName);
}

// 3. Generate Full Annual Report (Rejim 3: 4 chorak yoki 2 yarim yillik)
export async function generateAnnualExcel(
  quartersData: ParsedQuarterData[],
  meta: ReportMeta
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(`${meta.gradeName} Yillik`, {
    views: [{ showGridLines: true }]
  });

  const isFourQuarters = quartersData.length >= 3;

  if (isFourQuarters) {
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 33;
    let colIdx = 3;
    for (let q = 1; q <= 4; q++) {
      ws.getColumn(colIdx++).width = 10; // BSB
      ws.getColumn(colIdx++).width = 8;  // FB
      ws.getColumn(colIdx++).width = 10; // ChSB
      ws.getColumn(colIdx++).width = 12; // Jami
      ws.getColumn(colIdx++).width = 10; // Baho
    }
    ws.getColumn(colIdx++).width = 9;  // Yillik
    ws.getColumn(colIdx++).width = 9;  // Imtihon
    ws.getColumn(colIdx++).width = 11; // Yakuniy baho
    const c1Col = colIdx++; ws.getColumn(c1Col).width = 9;
    const c2Col = colIdx++; ws.getColumn(c2Col).width = 9;
    const c3Col = colIdx++; ws.getColumn(c3Col).width = 9;
    const c4Col = colIdx++; ws.getColumn(c4Col).width = 9;
    const avgCol = colIdx++; ws.getColumn(avgCol).width = 12; // Jami o'rtacha
    const trendCol = colIdx++; ws.getColumn(trendCol).width = 14; // O'sish kamayish (matn)
    const diffCol = colIdx++; ws.getColumn(diffCol).width = 9;  // Farq (qiymat)

    const totalCols = colIdx - 1;
    const lastColLetter = ws.getColumn(totalCols).letter;

    // Row 1 Title
    ws.mergeCells(`B1:${lastColLetter}1`);
    const titleCell = ws.getCell('B1');
    titleCell.value = `${meta.gradeName} sinf o'quvchilarining   ${meta.subjectName}  fanidan ${meta.academicYear} o'quv yili hisoboti`;
    titleCell.font = { name: 'Times New Roman', size: 12, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 2 Headers
    const headers: string[] = ['#', 'F.I.Sh.'];
    for (let q = 1; q <= 4; q++) {
      headers.push(`${q}-BSB(50)`, 'FB(10)', `${q}-ChSB(40)`, 'Jami ball(100)', `${q}-Chorak baho`);
    }
    headers.push('Yillik', 'Imtihon', 'Yakuniy baho', '1-chorak', '2-chorak', '3-chorak', '4-chorak', "Jami  o'rtacha", "O 'sish kamayish", "");

    const headerRow = ws.getRow(2);
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { name: 'Times New Roman', size: 9, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
    });
    headerRow.height = 30;

    const baseList = quartersData[0]?.students || [];
    let r = 3;

    const c1Letter = ws.getColumn(c1Col).letter;
    const c2Letter = ws.getColumn(c2Col).letter;
    const c3Letter = ws.getColumn(c3Col).letter;
    const c4Letter = ws.getColumn(c4Col).letter;
    const avgLetter = ws.getColumn(avgCol).letter;
    const diffLetter = ws.getColumn(diffCol).letter;

    baseList.forEach((st, idx) => {
      const row = ws.getRow(r);
      let c = 1;

      row.getCell(c++).value = idx + 1;
      row.getCell(c++).value = st.fullName;

      const qGrades: (number | null)[] = [];
      const totalCellLetters: string[] = [];

      for (let q = 0; q < 4; q++) {
        const qData = quartersData[q];
        const studentInQ = qData ? qData.students.find(s => s.fullName.trim().toLowerCase() === st.fullName.trim().toLowerCase()) || qData.students[idx] : null;

        const bsb = studentInQ ? (studentInQ.totalBsb ?? (studentInQ.bsbScores[0]?.score ?? 0)) : 0;
        const fb = studentInQ ? (studentInQ.fb ?? 0) : 0;
        const chsb = studentInQ ? (studentInQ.chsb ?? 0) : 0;
        const total = studentInQ ? (studentInQ.totalScore ?? (bsb + fb + chsb)) : 0;
        const grade = studentInQ ? (studentInQ.quarterGrade ?? (total >= 86 ? 5 : total >= 71 ? 4 : total >= 56 ? 3 : 2)) : 0;

        row.getCell(c++).value = bsb || 0;
        row.getCell(c++).value = fb || 0;
        row.getCell(c++).value = chsb || 0;

        const totalColLetter = ws.getColumn(c).letter;
        row.getCell(c++).value = total || 0;
        totalCellLetters.push(totalColLetter);

        row.getCell(c++).value = grade || 0;
        qGrades.push(grade);
      }

      const validGrades = qGrades.filter((g): g is number => g !== null && g > 0);
      const avgGrade = validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length) : 0;
      const roundedAnnual = Math.round(avgGrade);

      // Yillik
      row.getCell(c++).value = roundedAnnual || 0;

      // Imtihon
      row.getCell(c++).value = 'OZ';

      // Yakuniy baho
      row.getCell(c++).value = roundedAnnual || 0;

      // 1-chorak, 2-chorak, 3-chorak, 4-chorak (JAMI BALLAR — foydalanuvchi faylidek!)
      row.getCell(c++).value = { formula: `=$${totalCellLetters[0]}${r}` };
      row.getCell(c++).value = { formula: `=$${totalCellLetters[1]}${r}` };
      row.getCell(c++).value = { formula: `=$${totalCellLetters[2]}${r}` };
      row.getCell(c++).value = { formula: `=$${totalCellLetters[3]}${r}` };

      // Jami o'rtacha ball
      const qScores = [
        quartersData[0]?.students[idx]?.totalScore || 0,
        quartersData[1]?.students[idx]?.totalScore || 0,
        quartersData[2]?.students[idx]?.totalScore || 0,
        quartersData[3]?.students[idx]?.totalScore || 0,
      ];
      const validScores = qScores.filter(s => s > 0);
      const avgScoreVal = validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
      row.getCell(c++).value = { formula: `(${c1Letter}${r}+${c2Letter}${r}+${c3Letter}${r}+${c4Letter}${r})/4`, result: parseFloat(avgScoreVal.toFixed(2)) };

      // O'sish kamayish farq: avg - c1 (agar ball o'sgan bo'lsa farq musbat, kamaygan bo'lsa manfiy)
      const q1ScoreVal = qScores[0] || 0;
      const diffVal = avgScoreVal - q1ScoreVal;
      const isOsgan = diffVal >= 0;
      const trendText = isOsgan ? "o'sgan" : "kamaygan";

      // O'sish kamayish matn: IF(diff>=0, "o'sgan", "kamaygan")
      row.getCell(c++).value = { formula: `IF(${diffLetter}${r}>=0,"o'sgan","kamaygan")`, result: trendText };

      // O'sish kamayish farq qiymati
      row.getCell(c++).value = { formula: `${avgLetter}${r}-${c1Letter}${r}`, result: parseFloat(diffVal.toFixed(2)) };

      for (let col = 1; col <= totalCols; col++) {
        const cell = row.getCell(col);
        cell.border = thinBorder;
        cell.font = { name: 'Times New Roman', size: 10 };
        cell.alignment = {
          horizontal: col === 2 ? 'left' : 'center',
          vertical: 'middle'
        };
      }
      row.height = 20;
      r++;
    });

    // Add signatures at the bottom of Annual report too (Rasm 2)
    const sigRow1 = ws.getRow(r + 2);
    sigRow1.getCell(2).value = "O‘IBDO‘ :";
    sigRow1.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
    sigRow1.getCell(3).value = '';
    sigRow1.getCell(3).border = signatureBorder;
    sigRow1.getCell(4).value = meta.zavuchName || 'A.Berdiyeva';
    sigRow1.getCell(4).font = { name: 'Times New Roman', size: 10 };

    const sigRow2 = ws.getRow(r + 4);
    sigRow2.getCell(2).value = "O‘qituvchi :";
    sigRow2.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
    sigRow2.getCell(3).value = '';
    sigRow2.getCell(3).border = signatureBorder;
    sigRow2.getCell(4).value = meta.teacherName || 'M.Nazarova';
    sigRow2.getCell(4).font = { name: 'Times New Roman', size: 10 };
  } else {
    // 2 Half-Year Mode
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 33;
    for (let c = 3; c <= 18; c++) ws.getColumn(c).width = 11;
    ws.getColumn(17).width = 13;
    ws.getColumn(18).width = 15;

    // Row 1 Title
    ws.mergeCells('B1:R1');
    const titleCell = ws.getCell('B1');
    titleCell.value = `${meta.gradeName}  sinf o'quvchilarining   ${meta.subjectName}  fanidan  ${meta.academicYear} o'quv yili hisoboti`;
    titleCell.font = { name: 'Times New Roman', size: 12, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 2 Headers
    const headers = [
      '#',
      'F.I.Sh.',
      '1-BSB(50)',
      'FB(10)',
      'ChSB(40)',
      'Jami ball (100)',
      '1-Yarim  yillik ',
      '2-BSB(50)',
      'FB(10)',
      'ChSB(40)',
      'Jami ball (100)',
      '2-Yarim  yillik',
      'Yillik',
      'Yakuniy baho',
      '1-Yarim yillik',
      '2-Yarim yillik',
      "Jami  o'rtacha",
      "O 'sish kamayish"
    ];

    const headerRow = ws.getRow(2);
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { name: 'Times New Roman', size: 9, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
    });
    headerRow.height = 30;

    const q1 = quartersData[0]?.students || [];
    const q2 = quartersData[1]?.students || [];
    let r = 3;

    q1.forEach((s1, idx) => {
      const s2 = q2.find(s => s.fullName.trim().toLowerCase() === s1.fullName.trim().toLowerCase()) || q2[idx];
      const row = ws.getRow(r);

      const bsb1 = s1.totalBsb ?? (s1.bsbScores[0]?.score ?? 0);
      const fb1 = s1.fb ?? 0;
      const chsb1 = s1.chsb ?? 0;
      const total1 = s1.totalScore ?? (bsb1 + fb1 + chsb1);
      const grade1 = s1.quarterGrade ?? 0;

      const bsb2 = s2 ? (s2.totalBsb ?? (s2.bsbScores[0]?.score ?? 0)) : 0;
      const fb2 = s2 ? (s2.fb ?? 0) : 0;
      const chsb2 = s2 ? (s2.chsb ?? 0) : 0;
      const total2 = s2 ? (s2.totalScore ?? (bsb2 + fb2 + chsb2)) : 0;
      const grade2 = s2 ? (s2.quarterGrade ?? 0) : 0;

      const yillik = Math.round((grade1 + grade2) / (grade1 && grade2 ? 2 : 1));

      row.getCell(1).value = idx + 1;
      row.getCell(2).value = s1.fullName;
      row.getCell(3).value = bsb1;
      row.getCell(4).value = fb1;
      row.getCell(5).value = chsb1;
      row.getCell(6).value = total1;
      row.getCell(7).value = grade1;

      row.getCell(8).value = bsb2;
      row.getCell(9).value = fb2;
      row.getCell(10).value = chsb2;
      row.getCell(11).value = total2;
      row.getCell(12).value = grade2;

      row.getCell(13).value = yillik;
      row.getCell(14).value = yillik;

      row.getCell(15).value = total1;
      row.getCell(16).value = total2;
      row.getCell(17).value = { formula: `(O${r}+P${r})/2` };

      const diff = total2 - total1;
      let trend = "oʻzgarmagan";
      if (diff > 0) trend = `oshgan (+${diff})`;
      else if (diff < 0) trend = `kamaygan (${diff})`;
      row.getCell(18).value = trend;

      for (let col = 1; col <= 18; col++) {
        const cell = row.getCell(col);
        cell.border = thinBorder;
        cell.font = { name: 'Times New Roman', size: 10 };
        cell.alignment = {
          horizontal: col === 2 ? 'left' : 'center',
          vertical: 'middle'
        };
      }
      row.height = 20;
      r++;
    });

    // Add signatures (Rasm 2)
    const sigRow1 = ws.getRow(r + 2);
    sigRow1.getCell(2).value = "O‘IBDO‘ :";
    sigRow1.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
    sigRow1.getCell(3).value = '';
    sigRow1.getCell(3).border = signatureBorder;
    sigRow1.getCell(4).value = meta.zavuchName || 'A.Berdiyeva';
    sigRow1.getCell(4).font = { name: 'Times New Roman', size: 10 };

    const sigRow2 = ws.getRow(r + 4);
    sigRow2.getCell(2).value = "O‘qituvchi :";
    sigRow2.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
    sigRow2.getCell(3).value = '';
    sigRow2.getCell(3).border = signatureBorder;
    sigRow2.getCell(4).value = meta.teacherName || 'M.Nazarova';
    sigRow2.getCell(4).font = { name: 'Times New Roman', size: 10 };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `${meta.gradeName} ${meta.subjectName} Yillik hisobot.xlsx`.replace(/[/\\?%*:|"<>]/g, '_');
  saveAs(blob, fileName);
}

// 4. Generate BSB Analysis Excel (Topshiriqlar tahlili - 1-ish, 2-ish... Jami, Foizi)
export async function generateBsbAnalysisExcel(data: BsbAnalysisData, meta: ReportMeta): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EdTech eMaktab Analiz';

  const bsbType = meta.bsbType || data.bsbType || '1-BSB';
  const sheetName = `${bsbType} tahlili`.substring(0, 31);
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  const taskCount = data.tasks.length;
  const totalMaxBall = data.tasks.reduce((sum, t) => sum + (Number(t.maxBall) || 0), 0);
  const totalCols = taskCount + 4;

  // Setup Column Widths
  ws.getColumn(1).width = 5;   // #
  ws.getColumn(2).width = 36;  // FISH
  for (let c = 3; c <= taskCount + 2; c++) {
    ws.getColumn(c).width = 12; // Tasks
  }
  const jamiColIdx = taskCount + 3;
  const foiziColIdx = taskCount + 4;
  ws.getColumn(jamiColIdx).width = 15; // Jami
  ws.getColumn(foiziColIdx).width = 14; // Foizi

  // Row 1: Title (Centered across columns A to totalCols)
  // Matching user's screenshot: "7A-sinf  Fizika  fanidan  I chorak  1-BSB  tahlili natijalari"
  const lastColLetter = ws.getColumn(totalCols).letter;
  ws.mergeCells(`A1:${lastColLetter}1`);
  const row1 = ws.getCell('A1');
  const grade = meta.gradeName ? `${meta.gradeName}-sinf` : '7A-sinf';
  const subject = meta.subjectName || 'Fizika';
  const quarter = meta.quarterText || 'I chorak';
  row1.value = `${grade}  ${subject}  fanidan  ${quarter}  ${bsbType}  tahlili natijalari`;
  row1.font = { name: 'Times New Roman', size: 14, bold: true };
  row1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 32;

  // Row 3: Header Row (Row 2 is empty)
  const headerRow = ws.getRow(3);
  headerRow.height = 30;

  headerRow.getCell(1).value = '#';
  headerRow.getCell(2).value = 'FISH';

  data.tasks.forEach((task, idx) => {
    headerRow.getCell(3 + idx).value = `${task.name}\n(${task.maxBall} ball)`;
  });

  headerRow.getCell(jamiColIdx).value = `Jami\n(${totalMaxBall} ball)`;
  headerRow.getCell(foiziColIdx).value = 'Foizi';

  for (let c = 1; c <= totalCols; c++) {
    const cell = headerRow.getCell(c);
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' }
    };
  }

  // Student rows (starting row 4)
  let currRow = 4;
  const firstStudentRow = 4;
  const jamiColLetter = ws.getColumn(jamiColIdx).letter;
  const firstTaskLetter = ws.getColumn(3).letter;
  const lastTaskLetter = ws.getColumn(taskCount + 2).letter;

  data.students.forEach((student, idx) => {
    const row = ws.getRow(currRow);
    row.height = 20;

    row.getCell(1).value = idx + 1;
    row.getCell(2).value = student.fullName;

    // Task scores
    data.tasks.forEach((_, tIdx) => {
      const score = student.scores[tIdx] ?? 0;
      row.getCell(3 + tIdx).value = score;
    });

    // Jami formula: =SUM(C4:G4)
    row.getCell(jamiColIdx).value = {
      formula: `SUM(${firstTaskLetter}${currRow}:${lastTaskLetter}${currRow})`,
      result: student.scores.reduce((a, b) => a + (Number(b) || 0), 0)
    };

    // Foizi formula: =H4/30 (rasmdagi formula: =H8/30)
    const rowTotal = student.scores.reduce((a, b) => a + (Number(b) || 0), 0);
    const pctResult = totalMaxBall > 0 ? (rowTotal / totalMaxBall) : 0;
    row.getCell(foiziColIdx).value = {
      formula: `${jamiColLetter}${currRow}/${totalMaxBall || 1}`,
      result: pctResult
    };
    row.getCell(foiziColIdx).numFmt = '0.00%';

    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.alignment = {
        horizontal: c === 2 ? 'left' : 'center',
        vertical: 'middle'
      };
    }

    currRow++;
  });

  const lastStudentRow = currRow - 1;

  // Average row
  if (data.students.length > 0) {
    const avgRow = ws.getRow(currRow);
    avgRow.height = 22;
    avgRow.getCell(1).value = '';
    avgRow.getCell(2).value = "O'rtacha:";
    avgRow.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
    avgRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };

    for (let c = 3; c <= taskCount + 2; c++) {
      const colLet = ws.getColumn(c).letter;
      avgRow.getCell(c).value = {
        formula: `AVERAGE(${colLet}${firstStudentRow}:${colLet}${lastStudentRow})`
      };
      avgRow.getCell(c).numFmt = '0.0';
      avgRow.getCell(c).font = { name: 'Times New Roman', size: 10, bold: true };
      avgRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
      avgRow.getCell(c).border = thinBorder;
    }

    // Jami average
    avgRow.getCell(jamiColIdx).value = {
      formula: `AVERAGE(${jamiColLetter}${firstStudentRow}:${jamiColLetter}${lastStudentRow})`
    };
    avgRow.getCell(jamiColIdx).numFmt = '0.0';
    avgRow.getCell(jamiColIdx).font = { name: 'Times New Roman', size: 10, bold: true };
    avgRow.getCell(jamiColIdx).alignment = { horizontal: 'center', vertical: 'middle' };
    avgRow.getCell(jamiColIdx).border = thinBorder;

    // Foizi average
    avgRow.getCell(foiziColIdx).value = {
      formula: `${jamiColLetter}${currRow}/${totalMaxBall || 1}`
    };
    avgRow.getCell(foiziColIdx).numFmt = '0.00%';
    avgRow.getCell(foiziColIdx).font = { name: 'Times New Roman', size: 10, bold: true };
    avgRow.getCell(foiziColIdx).alignment = { horizontal: 'center', vertical: 'middle' };
    avgRow.getCell(foiziColIdx).border = thinBorder;

    avgRow.getCell(1).border = thinBorder;
    avgRow.getCell(2).border = thinBorder;

    currRow++;
  }

  // Signatures (O'IBDO' and O'qituvchi with underline border)
  const sigRow1 = ws.getRow(currRow + 2);
  sigRow1.getCell(2).value = "O‘IBDO‘ :";
  sigRow1.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
  sigRow1.getCell(3).value = '';
  sigRow1.getCell(3).border = signatureBorder;
  sigRow1.getCell(4).value = meta.zavuchName || 'A.Berdiyeva';
  sigRow1.getCell(4).font = { name: 'Times New Roman', size: 10 };

  const sigRow2 = ws.getRow(currRow + 4);
  sigRow2.getCell(2).value = "O‘qituvchi :";
  sigRow2.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
  sigRow2.getCell(3).value = '';
  sigRow2.getCell(3).border = signatureBorder;
  sigRow2.getCell(4).value = meta.teacherName || 'M.Nazarova';
  sigRow2.getCell(4).font = { name: 'Times New Roman', size: 10 };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `${meta.gradeName || 'Sinf'} ${meta.subjectName || 'Fan'} ${meta.quarterText || ''} ${bsbType} tahlili.xlsx`.replace(/[/\\?%*:|"<>]/g, '_');
  saveAs(blob, fileName);
}
