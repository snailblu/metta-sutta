import { Sutta, Verse, Phrase, Word, VerseContext } from '@/types';

// 경전 정보
export const sutta: Sutta = {
  id: 'metta-sutta',
  paliName: 'Karaṇīyam Metta Sutta',
  koreanName: '자비경',
  source: 'Sutta Nipāta 1.8, Khuddakapāṭha 9',
  verseCount: 12,
} as const;

// JSON 데이터 타입 정의
interface PhrasesData {
  phrases: Phrase[];
}

interface WordsData {
  words: Word[];
}

interface PhraseWordsData {
  phraseWords: Array<{ phraseId: string; wordIds: string[] }>;
}

// 구절 데이터
import phrasesData from './metta-sutta/phrases.json';
export const allPhrases: Phrase[] = (phrasesData as PhrasesData).phrases;

export function getPhrase(id: string): Phrase | undefined {
  return allPhrases.find((p) => p.id === id);
}

export function getPhrasesForVerse(verseId: string): Phrase[] {
  return allPhrases.filter((p) => p.verseId === verseId);
}

// 단어 데이터
import wordsData from './metta-sutta/words.json';
export const allWords: Word[] = (wordsData as WordsData).words;

export function getWord(id: string): Word | undefined {
  return allWords.find((w) => w.id === id);
}

export function getWordsForPhrase(phraseId: string): Word[] {
  const phrase = getPhrase(phraseId);
  if (!phrase) return [];
  return phrase.wordIds
    .map((wordId) => getWord(wordId))
    .filter((w): w is Word => w !== null && w !== undefined);
}

// 구절-단어 매핑
import phraseWordsData from './metta-sutta/phrase-words.json';
export const allPhraseWords = (phraseWordsData as PhraseWordsData).phraseWords;

export function getPhraseWordIds(phraseId: string): string[] {
  const phraseWord = allPhraseWords.find((pw) => pw.phraseId === phraseId);
  return phraseWord?.wordIds ?? [];
}

interface VersesData {
  verses: Verse[];
}

// 게송 데이터
import versesData from './metta-sutta/verses.json';
export const allVerses: Verse[] = (versesData as VersesData).verses;

export function getVerse(id: string): Verse | undefined {
  return allVerses.find((v) => v.id === id);
}

export function getVerseByNumber(number: number): Verse | undefined {
  return allVerses.find((v) => v.number === number);
}

// 경전 문맥
export function getVerseContext(verseId: string): VerseContext | null {
  const verse = getVerse(verseId);
  if (!verse) return null;

  const verses = [...allVerses].sort((a, b) => a.number - b.number);
  const currentIndex = verses.findIndex((v) => v.id === verseId);

  // 섹션 결정
  let section = 'intro';
  if (verse.number >= 4 && verse.number <= 8) {
    section = 'method';
  } else if (verse.number >= 9) {
    section = 'realization';
  }

  return {
    verseNumber: verse.number,
    section,
    previousPhrase: currentIndex > 0 ? (verses[currentIndex - 1].translations.default) : null,
    nextPhrase: currentIndex < verses.length - 1 ? (verses[currentIndex + 1].translations.default) : null,
  };
}
