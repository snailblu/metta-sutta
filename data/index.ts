import verses from './metta-sutta/verses.json';
import phrases from './metta-sutta/phrases.json';
import words from './metta-sutta/words.json';
import phraseWords from './metta-sutta/phrase-words.json';

// 경전 정보
export const sutta = (verses as any).sutta;

// 게송 데이터
export const allVerses = (verses as any).verses;

export function getVerse(id: string) {
  return allVerses.find((v: any) => v.id === id);
}

export function getVerseByNumber(number: number) {
  return allVerses.find((v: any) => v.number === number);
}

// 구절 데이터
export const allPhrases = (phrases as any).phrases;

export function getPhrase(id: string) {
  return allPhrases.find((p: any) => p.id === id);
}

export function getPhrasesForVerse(verseId: string) {
  return allPhrases.filter((p: any) => p.verseId === verseId);
}

// 단어 데이터
export const allWords = (words as any).words;

export function getWord(id: string) {
  return allWords.find((w: any) => w.id === id);
}

export function getWordsForPhrase(phraseId: string) {
  const phrase = getPhrase(phraseId);
  if (!phrase) return [];
  return phrase.wordIds.map((wordId: string) => getWord(wordId)).filter(Boolean);
}

// 구절-단어 매핑
export const allPhraseWords = (phraseWords as any).phraseWords;

export function getPhraseWord(phraseId: string, wordId: string) {
  return allPhraseWords.find((pw: any) => pw.phraseId === phraseId && pw.wordId === wordId);
}

export function getPhraseWords(phraseId: string) {
  return allPhraseWords.filter((pw: any) => pw.phraseId === phraseId);
}

// 경전 문맥
export function getVerseContext(verseId: string) {
  const verse = getVerse(verseId);
  if (!verse) return null;

  const verses = allVerses.sort((a: any, b: any) => a.number - b.number);
  const currentIndex = verses.findIndex((v: any) => v.id === verseId);

  // 섹션 결정
  let section = 'intro';
  if (verse.number >= 4 && verse.number <= 8) {
    section = 'method';
  } else if (verse.number === 9) {
    section = 'posture';
  } else if (verse.number === 10) {
    section = 'realization';
  }

  return {
    verseNumber: verse.number,
    section,
    previousPhrase: currentIndex > 0 ? verses[currentIndex - 1].koreanTranslation : null,
    nextPhrase: currentIndex < verses.length - 1 ? verses[currentIndex + 1].koreanTranslation : null,
  };
}
