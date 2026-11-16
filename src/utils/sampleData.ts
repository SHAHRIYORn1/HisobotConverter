import type { ParsedQuarterData } from './emaktabParser';

export const sampleQuarterData: ParsedQuarterData = {
  fileName: "8-B-Tarbiya-1-chorak.xls",
  gradeName: "8-B",
  subjectName: "Tarbiya",
  academicYear: "2026-2027",
  quarterNumber: 1,
  teacherName: "M.Nazarova",
  bsbStructure: [{ label: "BSB(50)", maxBall: 50 }],
  students: [
    { index: 1, fullName: "Shokirjanov Shahriyor", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 40 }], totalBsb: 40, chsb: 32, fb: 8, totalScore: 80, quarterGrade: 4 },
    { index: 2, fullName: "Abdirimova Muhlisa", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 50 }], totalBsb: 50, chsb: 38, fb: 9, totalScore: 97, quarterGrade: 5 },
    { index: 3, fullName: "Abdullayev Maqsadbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 45 }], totalBsb: 45, chsb: 35, fb: 8, totalScore: 88, quarterGrade: 5 },
    { index: 4, fullName: "Abdullayeva Sharifajon", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 48 }], totalBsb: 48, chsb: 36, fb: 9, totalScore: 93, quarterGrade: 5 },
    { index: 5, fullName: "Avezova Sevinchoy", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 32 }], totalBsb: 32, chsb: 28, fb: 7, totalScore: 67, quarterGrade: 3 },
    { index: 6, fullName: "Azadov Shohjahon", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 40 }], totalBsb: 40, chsb: 31, fb: 7, totalScore: 78, quarterGrade: 4 },
    { index: 7, fullName: "Alimova Yorqinoy", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 48 }], totalBsb: 48, chsb: 36, fb: 9, totalScore: 93, quarterGrade: 5 },
    { index: 8, fullName: "Atajonova Nigina", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 44 }], totalBsb: 44, chsb: 35, fb: 8, totalScore: 87, quarterGrade: 5 },
    { index: 9, fullName: "Baxtiyorov Mashhurbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 35 }], totalBsb: 35, chsb: 30, fb: 8, totalScore: 73, quarterGrade: 4 },
    { index: 10, fullName: "Baxtiyarov Diyorbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 38 }], totalBsb: 38, chsb: 30, fb: 7, totalScore: 75, quarterGrade: 4 },
    { index: 11, fullName: "Boboxonov Shamshodbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 30 }], totalBsb: 30, chsb: 33, fb: 8, totalScore: 71, quarterGrade: 4 }
  ]
};

// 2 ta faylli Yarim yillik namuna (Tarbiya 1-2 choraklar)
export const sampleHalfYearData: [ParsedQuarterData, ParsedQuarterData] = [
  {
    fileName: "11B TARBIA 1-CHORAK.xlsx",
    gradeName: "11-B",
    subjectName: "Tarbiya",
    academicYear: "2026-2027",
    quarterNumber: 1,
    teacherName: "S.Shonazarova",
    bsbStructure: [{ label: "BSB(50)", maxBall: 50 }],
    students: [
      { index: 1, fullName: "Abdullayeva Sanobar", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 48 }], totalBsb: 48, chsb: 0, fb: 0, totalScore: 48, quarterGrade: 5 },
      { index: 2, fullName: "Bazarov Alibek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 36 }], totalBsb: 36, chsb: 0, fb: 0, totalScore: 36, quarterGrade: 3 },
      { index: 3, fullName: "Bobojonova Muslima", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 44 }], totalBsb: 44, chsb: 0, fb: 0, totalScore: 44, quarterGrade: 4 },
      { index: 4, fullName: "Davronbekov Shahriyorbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 40 }], totalBsb: 40, chsb: 0, fb: 0, totalScore: 40, quarterGrade: 4 },
      { index: 5, fullName: "Erkinova Gulnora", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 45 }], totalBsb: 45, chsb: 0, fb: 0, totalScore: 45, quarterGrade: 5 },
      { index: 6, fullName: "Farxodova Muxlisa", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 38 }], totalBsb: 38, chsb: 0, fb: 0, totalScore: 38, quarterGrade: 4 },
      { index: 7, fullName: "Jumanazarova Nozima", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 49 }], totalBsb: 49, chsb: 0, fb: 0, totalScore: 49, quarterGrade: 5 },
      { index: 8, fullName: "Kadirov Dostonbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 35 }], totalBsb: 35, chsb: 0, fb: 0, totalScore: 35, quarterGrade: 3 }
    ]
  },
  {
    fileName: "11B TARBIA 2-CHORAK.xlsx",
    gradeName: "11-B",
    subjectName: "Tarbiya",
    academicYear: "2026-2027",
    quarterNumber: 2,
    teacherName: "S.Shonazarova",
    bsbStructure: [{ label: "BSB(50)", maxBall: 50 }],
    students: [
      { index: 1, fullName: "Abdullayeva Sanobar", bsbScores: [], totalBsb: 0, chsb: 38, fb: 9, totalScore: 47, quarterGrade: 5 },
      { index: 2, fullName: "Bazarov Alibek", bsbScores: [], totalBsb: 0, chsb: 28, fb: 7, totalScore: 35, quarterGrade: 3 },
      { index: 3, fullName: "Bobojonova Muslima", bsbScores: [], totalBsb: 0, chsb: 35, fb: 8, totalScore: 43, quarterGrade: 4 },
      { index: 4, fullName: "Davronbekov Shahriyorbek", bsbScores: [], totalBsb: 0, chsb: 32, fb: 8, totalScore: 40, quarterGrade: 4 },
      { index: 5, fullName: "Erkinova Gulnora", bsbScores: [], totalBsb: 0, chsb: 36, fb: 9, totalScore: 45, quarterGrade: 5 },
      { index: 6, fullName: "Farxodova Muxlisa", bsbScores: [], totalBsb: 0, chsb: 30, fb: 7, totalScore: 37, quarterGrade: 4 },
      { index: 7, fullName: "Jumanazarova Nozima", bsbScores: [], totalBsb: 0, chsb: 39, fb: 10, totalScore: 49, quarterGrade: 5 },
      { index: 8, fullName: "Kadirov Dostonbek", bsbScores: [], totalBsb: 0, chsb: 28, fb: 7, totalScore: 35, quarterGrade: 3 }
    ]
  }
];

// 4 ta chorakli Yillik namuna (Tarix fani 1-4 choraklar)
export const sampleAnnualData: ParsedQuarterData[] = [
  {
    fileName: "7B TARIX 1-CHORAK.xlsx",
    gradeName: "7-B",
    subjectName: "O‘zbekiston tarixi",
    academicYear: "2026-2027",
    quarterNumber: 1,
    teacherName: "M.Nazarova",
    bsbStructure: [{ label: "BSB(50)", maxBall: 50 }],
    students: [
      { index: 1, fullName: "Abdullayev Maqsadbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 45 }], totalBsb: 45, chsb: 36, fb: 9, totalScore: 90, quarterGrade: 5 },
      { index: 2, fullName: "Abdirimova Muhlisa", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 49 }], totalBsb: 49, chsb: 38, fb: 9, totalScore: 96, quarterGrade: 5 },
      { index: 3, fullName: "Bazarov Alibek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 32 }], totalBsb: 32, chsb: 28, fb: 7, totalScore: 67, quarterGrade: 3 },
      { index: 4, fullName: "Bobojonova Muslima", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 40 }], totalBsb: 40, chsb: 32, fb: 8, totalScore: 80, quarterGrade: 4 },
      { index: 5, fullName: "Davronbekov Shahriyorbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 38 }], totalBsb: 38, chsb: 30, fb: 7, totalScore: 75, quarterGrade: 4 },
      { index: 6, fullName: "Erkinova Gulnora", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 46 }], totalBsb: 46, chsb: 36, fb: 9, totalScore: 91, quarterGrade: 5 }
    ]
  },
  {
    fileName: "7B TARIX 2-CHORAK.xlsx",
    gradeName: "7-B",
    subjectName: "O‘zbekiston tarixi",
    academicYear: "2026-2027",
    quarterNumber: 2,
    teacherName: "M.Nazarova",
    bsbStructure: [{ label: "BSB(50)", maxBall: 50 }],
    students: [
      { index: 1, fullName: "Abdullayev Maqsadbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 46 }], totalBsb: 46, chsb: 37, fb: 9, totalScore: 92, quarterGrade: 5 },
      { index: 2, fullName: "Abdirimova Muhlisa", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 48 }], totalBsb: 48, chsb: 39, fb: 10, totalScore: 97, quarterGrade: 5 },
      { index: 3, fullName: "Bazarov Alibek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 34 }], totalBsb: 34, chsb: 29, fb: 7, totalScore: 70, quarterGrade: 3 },
      { index: 4, fullName: "Bobojonova Muslima", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 42 }], totalBsb: 42, chsb: 34, fb: 8, totalScore: 84, quarterGrade: 4 },
      { index: 5, fullName: "Davronbekov Shahriyorbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 39 }], totalBsb: 39, chsb: 31, fb: 8, totalScore: 78, quarterGrade: 4 },
      { index: 6, fullName: "Erkinova Gulnora", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 47 }], totalBsb: 47, chsb: 37, fb: 9, totalScore: 93, quarterGrade: 5 }
    ]
  },
  {
    fileName: "7B TARIX 3-CHORAK.xlsx",
    gradeName: "7-B",
    subjectName: "O‘zbekiston tarixi",
    academicYear: "2026-2027",
    quarterNumber: 3,
    teacherName: "M.Nazarova",
    bsbStructure: [{ label: "BSB(50)", maxBall: 50 }],
    students: [
      { index: 1, fullName: "Abdullayev Maqsadbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 47 }], totalBsb: 47, chsb: 37, fb: 9, totalScore: 93, quarterGrade: 5 },
      { index: 2, fullName: "Abdirimova Muhlisa", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 49 }], totalBsb: 49, chsb: 39, fb: 10, totalScore: 98, quarterGrade: 5 },
      { index: 3, fullName: "Bazarov Alibek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 35 }], totalBsb: 35, chsb: 30, fb: 7, totalScore: 72, quarterGrade: 4 },
      { index: 4, fullName: "Bobojonova Muslima", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 43 }], totalBsb: 43, chsb: 35, fb: 8, totalScore: 86, quarterGrade: 5 },
      { index: 5, fullName: "Davronbekov Shahriyorbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 41 }], totalBsb: 41, chsb: 32, fb: 8, totalScore: 81, quarterGrade: 4 },
      { index: 6, fullName: "Erkinova Gulnora", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 48 }], totalBsb: 48, chsb: 38, fb: 9, totalScore: 95, quarterGrade: 5 }
    ]
  },
  {
    fileName: "7B TARIX 4-CHORAK.xlsx",
    gradeName: "7-B",
    subjectName: "O‘zbekiston tarixi",
    academicYear: "2026-2027",
    quarterNumber: 4,
    teacherName: "M.Nazarova",
    bsbStructure: [{ label: "BSB(50)", maxBall: 50 }],
    students: [
      { index: 1, fullName: "Abdullayev Maqsadbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 48 }], totalBsb: 48, chsb: 38, fb: 9, totalScore: 95, quarterGrade: 5 },
      { index: 2, fullName: "Abdirimova Muhlisa", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 50 }], totalBsb: 50, chsb: 40, fb: 10, totalScore: 100, quarterGrade: 5 },
      { index: 3, fullName: "Bazarov Alibek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 37 }], totalBsb: 37, chsb: 31, fb: 8, totalScore: 76, quarterGrade: 4 },
      { index: 4, fullName: "Bobojonova Muslima", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 44 }], totalBsb: 44, chsb: 36, fb: 9, totalScore: 89, quarterGrade: 5 },
      { index: 5, fullName: "Davronbekov Shahriyorbek", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 42 }], totalBsb: 42, chsb: 33, fb: 8, totalScore: 83, quarterGrade: 4 },
      { index: 6, fullName: "Erkinova Gulnora", bsbScores: [{ label: "BSB(50)", maxBall: 50, score: 48 }], totalBsb: 48, chsb: 38, fb: 10, totalScore: 96, quarterGrade: 5 }
    ]
  }
];

// 7A-sinf Fizika 1-BSB tahlili namunasi (Foydalanuvchi yuborgan rasm bo'yicha 100% aniq)
export interface BsbTask {
  id: string;
  name: string;
  maxBall: number;
}

export interface BsbStudentRow {
  id: string;
  index: number;
  fullName: string;
  scores: number[];
}

export interface BsbAnalysisData {
  tasks: BsbTask[];
  students: BsbStudentRow[];
  bsbType: string;
}

export const sampleBsbAnalysisData: BsbAnalysisData = {
  bsbType: "1-BSB",
  tasks: [
    { id: "task-1", name: "1-ish", maxBall: 5 },
    { id: "task-2", name: "2-ish", maxBall: 6 },
    { id: "task-3", name: "3-ish", maxBall: 5 },
    { id: "task-4", name: "4-ish", maxBall: 4 },
    { id: "task-5", name: "5-ish", maxBall: 10 }
  ],
  students: [
    { id: "st-1", index: 1, fullName: "Abdullayeva Sanobar Sahovat qizi", scores: [5, 6, 5, 4, 8] },
    { id: "st-2", index: 2, fullName: "Bazarov Alibek Umid o'g'li", scores: [5, 4, 0, 2, 4] },
    { id: "st-3", index: 3, fullName: "Bobojonova Muslima Vohid qizi", scores: [5, 6, 5, 4, 3] },
    { id: "st-4", index: 4, fullName: "Botirova Nigina Shuxrat qizi", scores: [5, 6, 5, 4, 7] },
    { id: "st-5", index: 5, fullName: "Davronbekov Shahriyorbek Doniyorbek o'g'li", scores: [5, 4, 0, 0, 3] },
    { id: "st-6", index: 6, fullName: "Erkinova Gulnora Elyor qizi", scores: [5, 3, 0, 2, 10] },
    { id: "st-7", index: 7, fullName: "Farxodova Muxlisa", scores: [5, 5, 5, 3, 3] },
    { id: "st-8", index: 8, fullName: "Jumanazarova Nozima Arslon qizi", scores: [5, 6, 5, 3, 9] },
    { id: "st-9", index: 9, fullName: "Kadirov Dostonbek Usmonboy o'g'li", scores: [5, 6, 2, 2, 0] },
    { id: "st-10", index: 10, fullName: "Karimboyeva Zarina Dilshod qizi", scores: [5, 6, 5, 3, 9] },
    { id: "st-11", index: 11, fullName: "Kenjayeva Malika Muzaffar qizi", scores: [5, 5, 5, 3, 9] },
    { id: "st-12", index: 12, fullName: "Masharipov Kamronbek Quvondiq o'g'li", scores: [5, 6, 4, 2, 3] },
    { id: "st-13", index: 13, fullName: "O'ktamov Quramboy Zafar o'g'li", scores: [5, 5, 5, 3, 2] },
    { id: "st-14", index: 14, fullName: "Quryozov Shamsiddin Sanjarbek o'g'li", scores: [5, 3, 3, 2, 2] },
    { id: "st-15", index: 15, fullName: "Rajabboyev Ohunjon Izzat o'g'li", scores: [5, 5, 5, 0, 0] },
    { id: "st-16", index: 16, fullName: "Rajabov Diyorbek Munis o'g'li", scores: [5, 4, 3, 0, 3] }
  ]
};
