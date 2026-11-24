// eMaktab Excel & ZIP Report Generator Engine
// Ushbu fayl ExcelJS va JSZip orqali barcha hisobotlarni generatsiya qiladi

const thinBorder = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
};

// 1. Oddiy Choraklik hisobot
async function createQuarterExcelBuffer(meta, students, bsbStructure) {
  const ExcelJS = window.ExcelJS;
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(`${meta.gradeName} Chorak`, {
    views: [{ showGridLines: true }]
  });

  const struct = (bsbStructure && bsbStructure.length > 0)
    ? bsbStructure
    : [{ label: 'BSB(50)', maxBall: 50 }];

  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 33;
  let colIdx = 3;
  struct.forEach(() => { ws.getColumn(colIdx++).width = 12; });
  ws.getColumn(colIdx++).width = 12; // ChSB
  ws.getColumn(colIdx++).width = 10; // FB
  ws.getColumn(colIdx++).width = 14; // Jami
  ws.getColumn(colIdx++).width = 14; // Baho
  const totalCols = colIdx - 1;
  const lastColLetter = ws.getColumn(totalCols).letter;

  // Title
  ws.mergeCells(`A1:${lastColLetter}1`);
  const r1 = ws.getCell('A1');
  r1.value = meta.schoolName || "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab";
  r1.font = { name: 'Times New Roman', size: 12, bold: true };
  r1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells(`A2:${lastColLetter}2`);
  const r2 = ws.getCell('A2');
  r2.value = `${meta.gradeName} -sinf   "${meta.subjectName}" fanidan ${meta.academicYear}-o'quv yili ${meta.quarterText} natijalari`;
  r2.font = { name: 'Times New Roman', size: 11, bold: false };
  r2.alignment = { horizontal: 'center', vertical: 'middle' };

  // Headers
  const headerRow = ws.getRow(4);
  const headers = ['#', 'F.I.Sh.'];
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
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });
  headerRow.height = 30;

  // Students rows
  let r = 5;
  const gradeCounts = { 5: 0, 4: 0, 3: 0, 2: 0 };

  students.forEach((st, idx) => {
    const row = ws.getRow(r);
    let c = 1;
    row.getCell(c++).value = idx + 1;
    row.getCell(c++).value = st.fullName;

    struct.forEach((_, bIdx) => {
      const val = st.bsbScores?.[bIdx]?.score ?? (bIdx === 0 ? st.totalBsb : 0);
      row.getCell(c++).value = val ?? 0;
    });

    row.getCell(c++).value = st.chsb ?? 0;
    row.getCell(c++).value = st.fb ?? 0;
    const tot = st.totalScore ?? 0;
    row.getCell(c++).value = tot;

    const gr = st.quarterGrade ?? (tot >= 86 ? 5 : tot >= 71 ? 4 : tot >= 56 ? 3 : 2);
    row.getCell(c++).value = gr;
    if (gradeCounts[gr] !== undefined) gradeCounts[gr]++;

    for (let col = 1; col <= totalCols; col++) {
      const cell = row.getCell(col);
      cell.border = thinBorder;
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.alignment = { horizontal: col === 2 ? 'left' : 'center', vertical: 'middle' };
    }
    r++;
  });

  // Footer: Signatures & stats
  const sigRow1 = ws.getRow(r + 2);
  sigRow1.getCell(2).value = "Jami baholar statistikasi:";
  sigRow1.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
  sigRow1.getCell(totalCols - 1).value = "O‘IBDO‘ :";
  sigRow1.getCell(totalCols).value = meta.zavuchName || "A.Berdiyeva";

  const sigRow2 = ws.getRow(r + 3);
  sigRow2.getCell(2).value = `'5' baholar: ${gradeCounts[5]} ta o'quvchi`;
  sigRow2.getCell(totalCols - 1).value = "O‘qituvchi :";
  sigRow2.getCell(totalCols).value = meta.teacherName || "M.Nazarova";

  ws.getRow(r + 4).getCell(2).value = `'4' baholar: ${gradeCounts[4]} ta o'quvchi`;
  ws.getRow(r + 5).getCell(2).value = `'3' baholar: ${gradeCounts[3]} ta o'quvchi`;
  ws.getRow(r + 6).getCell(2).value = `'2' baholar: ${gradeCounts[2]} ta o'quvchi`;

  return await workbook.xlsx.writeBuffer();
}

// 2. Yarim yillik hisobot
async function createHalfYearExcelBuffer(meta, q1Data, q2Data) {
  const ExcelJS = window.ExcelJS;
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(`${meta.gradeName} Yarim yillik`, {
    views: [{ showGridLines: true }]
  });

  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 33;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 18;
  ws.getColumn(5).width = 10;
  ws.getColumn(6).width = 14;
  ws.getColumn(7).width = 14;

  const isSecondHalf = meta.quarterText.includes('III') || meta.quarterText.includes('3') || meta.quarterText.includes('4') || meta.quarterText.includes('2-yarim');
  const q1Label = isSecondHalf ? '3-CHORAK' : '1-CHORAK';
  const q2Label = isSecondHalf ? '4-CHORAK' : '2-CHORAK';

  // Title
  ws.mergeCells('A1:G1');
  const r1 = ws.getCell('A1');
  r1.value = meta.schoolName || "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab";
  r1.font = { name: 'Times New Roman', size: 12, bold: true };
  r1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A2:G2');
  const r2 = ws.getCell('A2');
  r2.value = `${meta.gradeName} -sinf   "${meta.subjectName}" fanidan ${meta.academicYear}-o'quv yili ${meta.quarterText} natijalari`;
  r2.font = { name: 'Times New Roman', size: 11, bold: false };
  r2.alignment = { horizontal: 'center', vertical: 'middle' };

  // Headers
  const headerRow = ws.getRow(4);
  const headers = ['#', 'F.I.Sh.', `BSB(50) ${q1Label}`, `CHSB(40) ${q2Label}`, 'FB(10)', 'Jami ball(100)', 'Choraklik baho'];
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

  const students = q1Data.students || [];
  let r = 5;
  const gradeCounts = { 5: 0, 4: 0, 3: 0, 2: 0 };

  students.forEach((st, idx) => {
    const s2 = q2Data?.students?.[idx] || st;
    const bsb = st.totalBsb ?? (st.bsbScores?.[0]?.score ?? 0);
    const chsb = s2.chsb ?? 0;
    const fb = s2.fb ?? 0;
    const total = bsb + chsb + fb;
    let grade = 2;
    if (total >= 86) grade = 5;
    else if (total >= 71) grade = 4;
    else if (total >= 56) grade = 3;
    if (gradeCounts[grade] !== undefined) gradeCounts[grade]++;

    const row = ws.getRow(r);
    row.getCell(1).value = idx + 1;
    row.getCell(2).value = st.fullName;
    row.getCell(3).value = bsb;
    row.getCell(4).value = chsb;
    row.getCell(5).value = fb;
    row.getCell(6).value = total;
    row.getCell(7).value = grade;

    for (let c = 1; c <= 7; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.alignment = { horizontal: c === 2 ? 'left' : 'center', vertical: 'middle' };
    }
    r++;
  });

  const sigRow1 = ws.getRow(r + 2);
  sigRow1.getCell(2).value = "Jami baholar statistikasi:";
  sigRow1.getCell(2).font = { name: 'Times New Roman', size: 10, bold: true };
  sigRow1.getCell(6).value = "O‘IBDO‘ :";
  sigRow1.getCell(7).value = meta.zavuchName || "A.Berdiyeva";

  const sigRow2 = ws.getRow(r + 3);
  sigRow2.getCell(2).value = `'5' baholar: ${gradeCounts[5]} ta o'quvchi`;
  sigRow2.getCell(6).value = "O‘qituvchi :";
  sigRow2.getCell(7).value = meta.teacherName || "M.Nazarova";

  return await workbook.xlsx.writeBuffer();
}

// 3. To'liq Yillik hisobot (1-4 choraklar & dinamika)
async function createAnnualExcelBuffer(meta, quartersData) {
  const ExcelJS = window.ExcelJS;
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(`${meta.gradeName} Yillik`, {
    views: [{ showGridLines: true }]
  });

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
  ws.getColumn(colIdx++).width = 11; // Yakuniy
  const c1Col = colIdx++; ws.getColumn(c1Col).width = 9;
  const c2Col = colIdx++; ws.getColumn(c2Col).width = 9;
  const c3Col = colIdx++; ws.getColumn(c3Col).width = 9;
  const c4Col = colIdx++; ws.getColumn(c4Col).width = 9;
  const avgCol = colIdx++; ws.getColumn(avgCol).width = 12; // Jami o'rtacha
  const trendCol = colIdx++; ws.getColumn(trendCol).width = 14; // O'sgan/kamaygan
  const diffCol = colIdx++; ws.getColumn(diffCol).width = 9; // Farq

  const totalCols = colIdx - 1;
  const lastColLetter = ws.getColumn(totalCols).letter;

  // Title
  ws.mergeCells(`B1:${lastColLetter}1`);
  const titleCell = ws.getCell('B1');
  titleCell.value = `${meta.gradeName} sinf o'quvchilarining   ${meta.subjectName}  fanidan ${meta.academicYear} o'quv yili hisoboti`;
  titleCell.font = { name: 'Times New Roman', size: 12, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Headers
  const headers = ['#', 'F.I.Sh.'];
  for (let q = 1; q <= 4; q++) {
    headers.push(`${q}-BSB(50)`, 'FB(10)', `${q}-ChSB(40)`, 'Jami ball(100)', `${q}-Chorak baho`);
  }
  headers.push('Yillik', 'Imtihon', 'Yakuniy baho', '1-chorak', '2-chorak', '3-chorak', '4-chorak', "Jami  o'rtacha", "O 'sish kamayish", "");

  const headerRow = ws.getRow(2);
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Times New Roman', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

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

    const qGrades = [];
    const totalCellLetters = [];

    for (let q = 0; q < 4; q++) {
      const qData = quartersData[q];
      const studentInQ = qData?.students?.[idx] || st;
      const bsb = studentInQ.totalBsb ?? (studentInQ.bsbScores?.[0]?.score ?? 0);
      const fb = studentInQ.fb ?? 0;
      const chsb = studentInQ.chsb ?? 0;
      const total = studentInQ.totalScore ?? (bsb + fb + chsb);
      const grade = studentInQ.quarterGrade ?? (total >= 86 ? 5 : total >= 71 ? 4 : total >= 56 ? 3 : 2);

      row.getCell(c++).value = bsb;
      row.getCell(c++).value = fb;
      row.getCell(c++).value = chsb;
      const totLetter = ws.getColumn(c).letter;
      row.getCell(c++).value = total;
      totalCellLetters.push(totLetter);
      row.getCell(c++).value = grade;
      qGrades.push(grade);
    }

    const avgGrade = qGrades.reduce((a, b) => a + b, 0) / 4;
    const roundedAnnual = Math.round(avgGrade);

    row.getCell(c++).value = roundedAnnual; // Yillik
    row.getCell(c++).value = 'OZ'; // Imtihon
    row.getCell(c++).value = roundedAnnual; // Yakuniy

    row.getCell(c++).value = { formula: `=$${totalCellLetters[0]}${r}` };
    row.getCell(c++).value = { formula: `=$${totalCellLetters[1]}${r}` };
    row.getCell(c++).value = { formula: `=$${totalCellLetters[2]}${r}` };
    row.getCell(c++).value = { formula: `=$${totalCellLetters[3]}${r}` };

    const qScores = [
      quartersData[0]?.students?.[idx]?.totalScore || 0,
      quartersData[1]?.students?.[idx]?.totalScore || 0,
      quartersData[2]?.students?.[idx]?.totalScore || 0,
      quartersData[3]?.students?.[idx]?.totalScore || 0
    ];
    const avgScoreVal = qScores.reduce((a, b) => a + b, 0) / 4;
    row.getCell(c++).value = { formula: `(${c1Letter}${r}+${c2Letter}${r}+${c3Letter}${r}+${c4Letter}${r})/4`, result: parseFloat(avgScoreVal.toFixed(2)) };

    const q1ScoreVal = qScores[0] || 0;
    const diffVal = avgScoreVal - q1ScoreVal;
    const isOsgan = diffVal >= 0;
    const trendText = isOsgan ? "o'sgan" : "kamaygan";

    row.getCell(c++).value = { formula: `IF(${diffLetter}${r}>=0,"o'sgan","kamaygan")`, result: trendText };
    row.getCell(c++).value = { formula: `${avgLetter}${r}-${c1Letter}${r}`, result: parseFloat(diffVal.toFixed(2)) };

    for (let col = 1; col <= totalCols; col++) {
      const cell = row.getCell(col);
      cell.border = thinBorder;
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.alignment = { horizontal: col === 2 ? 'left' : 'center', vertical: 'middle' };
    }
    r++;
  });

  return await workbook.xlsx.writeBuffer();
}

window.ReportEngine = {
  createQuarterExcelBuffer,
  createHalfYearExcelBuffer,
  createAnnualExcelBuffer
};
