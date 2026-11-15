/**
 * O'zbek kirill va rus alifbosidagi matnlarni toza O'zbek lotin alifbosiga
 * qoidalar asosida to'liq o'giruvchi yordamchi funksiya.
 */

export function toUzbekLatin(text: string): string {
  if (!text) return '';

  // Specific multi-char rules and word boundaries
  let result = text;

  // Replace Cyrillic apostrophes / hard signs
  result = result.replace(/[ъЪьЬ]/g, "'");

  // Specific word beginnings / special vowel rules:
  // So'z boshidagi Ye
  result = result.replace(/(^|[\s\(\[\{"'«])Е/g, '$1Ye');
  result = result.replace(/(^|[\s\(\[\{"'«])е/g, '$1ye');

  // Unlilardan keyingi Ye: а, е, ё, и, о, у, э, ю, я
  result = result.replace(/([аеёиоуэюяАЕЁИОУЭЮЯ])Е/g, '$1Ye');
  result = result.replace(/([аеёиоуэюяАЕЁИОУЭЮЯ])е/g, '$1ye');

  // Compound Cyrillic letters
  const map: { [key: string]: string } = {
    // Katta harflar
    'Ў': "O'",
    'Ғ': "G'",
    'Қ': 'Q',
    'Ҳ': 'H',
    'Х': 'X',
    'Ч': 'Ch',
    'Ш': 'Sh',
    'Щ': 'Sh',
    'Ё': 'Yo',
    'Ю': 'Yu',
    'Я': 'Ya',
    'Ц': 'Ts',
    'Ж': 'J',
    'А': 'A',
    'Б': 'B',
    'В': 'V',
    'Г': 'G',
    'Д': 'D',
    'Е': 'E',
    'З': 'Z',
    'И': 'I',
    'Й': 'Y',
    'К': 'K',
    'Л': 'L',
    'М': 'M',
    'Н': 'N',
    'О': 'O',
    'П': 'P',
    'Р': 'R',
    'С': 'S',
    'Т': 'T',
    'У': 'U',
    'Ф': 'F',
    'Э': 'E',

    // Kichik harflar
    'ў': "o'",
    'ғ': "g'",
    'қ': 'q',
    'ҳ': 'h',
    'х': 'x',
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'sh',
    'ё': 'yo',
    'ю': 'yu',
    'я': 'ya',
    'ц': 'ts',
    'ж': 'j',
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'е': 'e',
    'з': 'z',
    'и': 'i',
    'й': 'y',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'э': 'e'
  };

  // Convert char by char
  let latin = '';
  for (let i = 0; i < result.length; i++) {
    const char = result[i];
    if (map[char] !== undefined) {
      latin += map[char];
    } else {
      latin += char;
    }
  }

  // Normalize apostrophes to clean standard quote
  latin = latin.replace(/[ʻʼ`´]/g, "'");

  return latin;
}

/**
 * Checks if a string contains any Cyrillic letters
 */
export function hasCyrillic(text: string): boolean {
  return /[А-Яа-яЁёЎўҚқҒғҲҳ]/.test(text);
}
