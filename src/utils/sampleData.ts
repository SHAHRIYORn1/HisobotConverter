import type { ParsedQuarterData } from './emaktabParser';

export const sampleQuarterData: ParsedQuarterData = {
  fileName: "8-B-Tarbiya-1-chorak.xls",
  gradeName: "8-B",
  subjectName: "Tarbiya",
  academicYear: "2025-2026",
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
