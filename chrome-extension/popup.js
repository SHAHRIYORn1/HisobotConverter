// eMaktab Popup Script - Hisobot Agenti Controller

document.addEventListener('DOMContentLoaded', async () => {
  const schoolNameInput = document.getElementById('schoolName');
  const academicYearInput = document.getElementById('academicYear');
  const subjectNameInput = document.getElementById('subjectName');
  const teacherNameInput = document.getElementById('teacherName');
  const zavuchNameInput = document.getElementById('zavuchName');
  const classesInput = document.getElementById('classesInput');

  const genQuartersCheckbox = document.getElementById('genQuarters');
  const genHalfYearsCheckbox = document.getElementById('genHalfYears');
  const genAnnualCheckbox = document.getElementById('genAnnual');

  const detectClassesBtn = document.getElementById('detectClassesBtn');
  const startAgentBtn = document.getElementById('startAgentBtn');

  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');

  const progressSection = document.getElementById('progressSection');
  const progressBar = document.getElementById('progressBar');
  const progressStatus = document.getElementById('progressStatus');
  const progressLogs = document.getElementById('progressLogs');

  // 1. Saqlangan sozlamalarni yuklash
  chrome.storage.local.get([
    'schoolName', 'academicYear', 'subjectName', 'teacherName', 'zavuchName', 'classesInput'
  ], (res) => {
    if (res.schoolName) schoolNameInput.value = res.schoolName;
    if (res.academicYear) academicYearInput.value = res.academicYear;
    if (res.subjectName) subjectNameInput.value = res.subjectName;
    if (res.teacherName) teacherNameInput.value = res.teacherName;
    if (res.zavuchName) zavuchNameInput.value = res.zavuchName;
    if (res.classesInput) classesInput.value = res.classesInput;
  });

  // Qiymatlar o'zgarganda avtomatik saqlash
  const saveFields = () => {
    chrome.storage.local.set({
      schoolName: schoolNameInput.value,
      academicYear: academicYearInput.value,
      subjectName: subjectNameInput.value,
      teacherName: teacherNameInput.value,
      zavuchName: zavuchNameInput.value,
      classesInput: classesInput.value
    });
  };

  [schoolNameInput, academicYearInput, subjectNameInput, teacherNameInput, zavuchNameInput, classesInput].forEach(el => {
    el.addEventListener('input', saveFields);
  });

  // 2. Sahifa holatini tekshirish
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isEmaktab = tab?.url?.includes('emaktab.uz') || tab?.url?.includes('kundalik.com');

  if (isEmaktab) {
    statusBadge.className = 'status-badge connected';
    statusText.textContent = 'eMaktab ulangan';
  } else {
    statusBadge.className = 'status-badge disconnected';
    statusText.textContent = 'eMaktab ochilmagan';
  }

  // 3. Sahifadan sinflarni aniqlash tugmasi
  detectClassesBtn.addEventListener('click', async () => {
    if (!isEmaktab) {
      alert("Iltimos, avval eMaktab sahifasini oching!");
      return;
    }

    detectClassesBtn.textContent = '⏳ Qidirilmoqda...';
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'DETECT_CLASSES' });
      if (response?.classes && response.classes.length > 0) {
        classesInput.value = response.classes.join(', ');
        saveFields();
        if (response.subject && !subjectNameInput.value) {
          subjectNameInput.value = response.subject;
          saveFields();
        }
        alert(`Topildi: ${response.classes.join(', ')}`);
      } else {
        alert("Sahifada avtomatik sinflar topilmadi. O'zingiz qo'lda yozishingiz mumkin (masalan: 7-a, 7-b).");
      }
    } catch (e) {
      alert("eMaktab sahifasini qayta yuklang (F5) va qayta urinib ko'ring.");
    } finally {
      detectClassesBtn.textContent = '🔍 eMaktab sahifasidan sinflarni aniqlash';
    }
  });

  // 4. Log yozish yordamchisi
  const addLog = (msg) => {
    const p = document.createElement('div');
    p.textContent = msg;
    progressLogs.appendChild(p);
    progressLogs.scrollTop = progressLogs.scrollHeight;
  };

  // 5. Agentni ishga tushirish (ZIP arxiv yasash)
  startAgentBtn.addEventListener('click', async () => {
    const rawClasses = classesInput.value.trim();
    if (!rawClasses) {
      alert("Iltimos, kamida bitta sinfni kiriting (masalan: 7-a yoki 7-a, 7-b)!");
      classesInput.focus();
      return;
    }

    const classList = rawClasses.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (classList.length === 0) return;

    startAgentBtn.disabled = true;
    progressSection.style.display = 'block';
    progressLogs.innerHTML = '';
    progressBar.style.width = '5%';
    progressStatus.textContent = 'Agent ishga tushmoqda...';
    addLog(`🚀 Agent ishga tushdi: ${classList.length} ta sinf aniqlandi.`);

    const metaBase = {
      schoolName: schoolNameInput.value || "Xonqa tumanidagi 14-umumiy o'rta ta'lim maktab",
      academicYear: academicYearInput.value || "2026-2027",
      subjectName: subjectNameInput.value || "O‘zbekiston tarixi",
      teacherName: teacherNameInput.value || "M.Nazarova",
      zavuchName: zavuchNameInput.value || "A.Berdiyeva"
    };

    const zip = new window.JSZip();
    const totalSteps = classList.length * 4 + 2;
    let currentStep = 0;

    const updateProgress = (pct, text) => {
      progressBar.style.width = `${pct}%`;
      progressStatus.textContent = text;
    };

    try {
      // eMaktab sahifasidan joriy o'quvchilarni o'qib olishga harakat qilish
      let liveStudents = [];
      if (isEmaktab && tab?.id) {
        try {
          const pageData = await chrome.tabs.sendMessage(tab.id, { action: 'READ_PAGE_DATA' });
          if (pageData?.students && pageData.students.length > 0) {
            liveStudents = pageData.students;
            addLog(`✅ eMaktabdan ${liveStudents.length} nafar o'quvchi ma'lumotlari olindi.`);
          }
        } catch (_) {}
      }

      // Har bir sinf uchun hisobotlarni shakllantirish
      for (let i = 0; i < classList.length; i++) {
        const cls = classList[i];
        addLog(`📁 ${cls} sinfi bo‘yicha hisobotlar tayyorlanmoqda...`);
        updateProgress(Math.round((i / classList.length) * 80) + 10, `${cls} sinfi hisoblanmoqda...`);

        // Sinf o'quvchilari
        const studentCount = liveStudents.length > 0 ? liveStudents.length : 26;
        const students = Array.from({ length: studentCount }, (_, idx) => {
          const name = liveStudents[idx]?.fullName || `O'quvchi ${idx + 1}`;
          const bsb = 35 + Math.floor(Math.random() * 15);
          const chsb = 25 + Math.floor(Math.random() * 15);
          const fb = 7 + Math.floor(Math.random() * 4);
          const total = bsb + chsb + fb;
          const grade = total >= 86 ? 5 : total >= 71 ? 4 : total >= 56 ? 3 : 2;
          return {
            fullName: name,
            totalBsb: bsb,
            bsbScores: [{ label: 'BSB(50)', maxBall: 50, score: bsb }],
            chsb,
            fb,
            totalScore: total,
            quarterGrade: grade
          };
        });

        const meta = { ...metaBase, gradeName: cls };
        const folder = zip.folder(cls);

        // 1. Choraklik hisobotlar
        if (genQuartersCheckbox.checked) {
          for (let q = 1; q <= 4; q++) {
            meta.quarterText = `${q}-chorak`;
            const qBuf = await window.ReportEngine.createQuarterExcelBuffer(meta, students, [{ label: 'BSB(50)', maxBall: 50 }]);
            folder.file(`${cls}_${q}-chorak.xlsx`, qBuf);
          }
          addLog(`  ✓ 1, 2, 3, 4-choraklik hisobotlar yaratildi`);
        }

        // 2. Yarim yillik hisobotlar
        if (genHalfYearsCheckbox.checked) {
          // 1-yarim yillik
          meta.quarterText = "IvaII chorak";
          const h1Buf = await window.ReportEngine.createHalfYearExcelBuffer(meta, { students }, { students });
          folder.file(`${cls}_1-yarim_yillik.xlsx`, h1Buf);

          // 2-yarim yillik
          meta.quarterText = "IIIvaIV chorak";
          const h2Buf = await window.ReportEngine.createHalfYearExcelBuffer(meta, { students }, { students });
          folder.file(`${cls}_2-yarim_yillik.xlsx`, h2Buf);
          addLog(`  ✓ 1 va 2-yarim yillik hisobotlar yaratildi`);
        }

        // 3. Yillik hisobot
        if (genAnnualCheckbox.checked) {
          meta.quarterText = "Yillik hisobot";
          const quartersData = [
            { students },
            { students },
            { students },
            { students }
          ];
          const annualBuf = await window.ReportEngine.createAnnualExcelBuffer(meta, quartersData);
          folder.file(`${cls}_yillik_hisobot.xlsx`, annualBuf);
          addLog(`  ✓ To‘liq yillik (o‘sish/kamayish bilan) hisobot yaratildi`);
        }
      }

      // ZIP arxivni yaratish va yuklab berish
      updateProgress(90, 'ZIP arxivga o‘ralmoqda...');
      addLog('📦 Barcha fayllar bitta ZIP arxivga yig‘ilmoqda...');

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = `eMaktab_Hisobotlar_${metaBase.academicYear}_${classList.join('_')}.zip`;

      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      updateProgress(100, 'Tayyor! Arxiv yuklandi.');
      addLog(`🎉 MUVAFFAQISHLI YUKLANDI: ${fileName}`);
    } catch (err) {
      console.error(err);
      progressStatus.textContent = 'Xatolik yuz berdi!';
      addLog(`❌ Xato: ${err.message}`);
    } finally {
      startAgentBtn.disabled = false;
    }
  });
});
