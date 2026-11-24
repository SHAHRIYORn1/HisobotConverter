// eMaktab Content Script - Hisobot Agenti
console.log("eMaktab Hisobot Agenti skripti ishga tushdi!");

// Sahifadagi sinflar va jurnallarni qidirish
function detectClassesOnPage() {
  const foundClasses = new Set();

  // 1. Havolalardagi sinf nomlarini qidirish
  const links = document.querySelectorAll('a, button, select option, .class-name, .group-name');
  const classRegex = /\b([1-9]|1[0-1])[\s-]?([A-Za-zА-Яа-яЎўҚқҒғҲҳ])\b/g;

  links.forEach(el => {
    const text = el.textContent || '';
    let match;
    while ((match = classRegex.exec(text)) !== null) {
      foundClasses.add(`${match[1]}-${match[2].toUpperCase()}`);
    }
  });

  // 2. Select menyular (sinf tanlash selecti bo'lsa)
  const selectEls = document.querySelectorAll('select');
  selectEls.forEach(sel => {
    Array.from(sel.options).forEach(opt => {
      let m = classRegex.exec(opt.textContent || '');
      if (m) foundClasses.add(`${m[1]}-${m[2].toUpperCase()}`);
    });
  });

  return Array.from(foundClasses);
}

// Sahifadagi fan nomini aniqlash
function detectSubjectOnPage() {
  // eMaktab sahifasidagi ehtimoliy fan sarlavhalari
  const headers = document.querySelectorAll('h1, h2, h3, .subject, .lesson-title, .page-header');
  for (const h of headers) {
    const txt = (h.textContent || '').trim();
    if (txt && !txt.includes('Kundalik') && !txt.includes('eMaktab') && !txt.includes('Bosh sahifa')) {
      if (txt.length < 50) return txt;
    }
  }
  return '';
}

// Sahifadagi joriy jurnal jadvalidan o'quvchilar va ballarni o'qish (agar jurnaldan turgan bo'lsa)
function parseCurrentJournalTable() {
  const table = document.querySelector('table.journal, table.grid, table');
  if (!table) return null;

  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length < 3) return null;

  const students = [];
  rows.forEach((row, rIdx) => {
    const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim());
    if (cells.length >= 3) {
      // Birinchi yoki ikkinchi katakda Ism Familiya bo'lishini tekshirish
      const nameCandidate = cells[1] || cells[0];
      if (nameCandidate && nameCandidate.split(' ').length >= 2 && !nameCandidate.includes('F.I.Sh') && !nameCandidate.includes('O‘quvchi')) {
        // Baholarni o'qish
        students.push({
          fullName: nameCandidate,
          rawCells: cells
        });
      }
    }
  });

  return students;
}

// Popup bilan aloqa (Message Listener)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PING") {
    sendResponse({ status: "OK", url: window.location.href });
  } else if (request.action === "DETECT_CLASSES") {
    const classes = detectClassesOnPage();
    const subject = detectSubjectOnPage();
    sendResponse({ classes, subject });
  } else if (request.action === "READ_PAGE_DATA") {
    const students = parseCurrentJournalTable();
    sendResponse({ students });
  }
  return true;
});
