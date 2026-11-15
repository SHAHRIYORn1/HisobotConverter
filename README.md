# eMaktab Hisobot Generator (EdTech Startup MVP)

O‘zbekistondagi maktab o‘qituvchilari uchun mo‘ljallangan EdTech veb-platformasi.

## 🚀 Loyiha Maqsadi
O‘qituvchilar eMaktab tizimidan yuklab olgan katta va noqulay Excel jadvallarini yuklaydi, platforma esa **1 soniya ichida** ortiqcha kunlik baholar va sanalarni avtomatik tozalab, maktab ma’muriyati (**O‘IBDO‘ / Zavuch**) talab qiladigan tayyor, chiroyli formatlangan hisobot Excel (`.xlsx`) faylini yaratib beradi.

---

## 🎯 Asosiy Imkoniyatlar (3 xil hisobot rejimi)

1. **Oddiy Choraklik hisobot (Rejim 1):**
   - 1 ta choraklik eMaktab fayli yuklanadi (masalan, Tarix, Ona tili va barcha oddiy fanlar).
   - Format: `#`, `F.I.Sh.`, `BSB(50)`, `ChSB(40)`, `FB(10)`, `Jami ball(100)`, `Choraklik baho`.
   - Pastki qismda `Jami:`, `O'rtacha:`, `"5"`, `"4"`, `"3"`, `"2"` baholar statistikasi va Zavuch / O'qituvchi imzolari.

2. **Qo‘shma Yarim yillik hisobot (Rejim 2: I-II yoki III-IV choraklar):**
   - Tarbiya kabi 1-chorakda faqat BSB, 2-chorakda ChSB olinadigan fanlar uchun.
   - 1-fayldan BSB ballari, 2-fayldan ChSB va FB ballari olinib bitta jadvalga birlashtiriladi.

3. **To‘liq Yillik (va Imtihon) hisoboti (Rejim 3):**
   - 4 ta chorak yoki 2 ta yarim yillik fayllar umumiy yillik jadvalga birlashtiriladi.
   - Ustunlar: Barcha chorak ballari, Yillik, Imtihon, Yakuniy baho, Jami o‘rtacha hamda O‘sish/kamayish dinamikasi (`O'sgan`, `Kamaygan`, `O'zgarmagan`).

---

## 🛠 Texnologiyalar
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (zamonaviy, toza UI)
- **Excel Tahlil (Parsing):** `xlsx` (SheetJS) — brauzerda `.xls` va `.xlsx` fayllarni o'qish
- **Excel Generatsiya:** `exceljs` — thin border, shriftlar, formulalar va sarlavhalar bilan haqiqiy `.xlsx` yaratish
- **Fayl saqlash:** `file-saver`
- **Xotira:** `localStorage` — Maktab nomi, o'quv yili, zavuch va o'qituvchi ismlari avto-saqlanadi
- **Xavfsizlik:** 100% Client-side (ma'lumotlar serverga bormaydi, brauzerda ishlanadi).

---

## 💻 Mahalliy ishga tushirish (Local Run)

```bash
# 1. Loyiha papkasiga o'ting
cd "C:\Users\Shahriyor Iskandarov\.gemini\antigravity\scratch\edtech-emaktab-report"

# 2. Bog'liqliklarni o'rnating (allaqachon o'rnatilgan)
npm install

# 3. Dasturni ishga tushiring
npm run dev
```

Brauzerda `http://localhost:5173` manzilini oching.

---

## ☁️ Vercel’ga 1 daqiqada Deploy qilish (Mutlaqo Bepul)

1. Loyihani GitHub reponizga push qiling:
```bash
git init
git add .
git commit -m "eMaktab Hisobot Generator MVP"
git branch -M main
git remote add origin https://github.com/SIZNING_USERINGIZ/emaktab-report.git
git push -u origin main
```
2. [Vercel.com](https://vercel.com) saytiga kiring va GitHub profilingiz bilan bog'lang.
3. **"Add New Project"** tugmasini bosib, `emaktab-report` omborini tanlang.
4. **Framework Preset:** `Vite` (Vercel buni avtomatik taniydi).
5. **"Deploy"** tugmasini bosing — 30 soniyada dunyo bo'ylab ishlaydigan bepul domenga ega bo'lasiz!
