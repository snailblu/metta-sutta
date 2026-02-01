import { Sutta, Verse, Phrase, Word, PhraseWord, VerseContext } from '@/types';

// 경전 정보
export const sutta: Sutta = {
  id: 'metta-sutta',
  paliName: 'Karaṇīyam Metta Sutta',
  koreanName: '자비경',
  source: 'Sutta Nipāta 1.8, Khuddakapāṭha 9',
  verseCount: 10,
} as const;

// 구절 데이터
import phrasesData from './metta-sutta/phrases.json';
export const allPhrases: Phrase[] = (phrasesData as any).phrases;

export function getPhrase(id: string): Phrase | undefined {
  return allPhrases.find((p) => p.id === id);
}

export function getPhrasesForVerse(verseId: string): Phrase[] {
  return allPhrases.filter((p) => p.verseId === verseId);
}

// 단어 데이터
import wordsData from './metta-sutta/words.json';
export const allWords: Word[] = (wordsData as any).words;

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
export const allPhraseWords: PhraseWord[] = (phraseWordsData as any).phraseWords;

export function getPhraseWord(phraseId: string, wordId: string): PhraseWord | undefined {
  return allPhraseWords.find((pw) => pw.phraseId === phraseId && pw.wordId === wordId);
}

export function getPhraseWords(phraseId: string): PhraseWord[] {
  return allPhraseWords.filter((pw) => pw.phraseId === phraseId);
}

// 게송 데이터 (기존)
export const allVerses: Verse[] = [
  { id: 'v1', number: 1, paliText: 'Karaṇīyam atthakusalena yan taṃ santaṃ padaṃ abhisamecca', koreanTranslation: '선을 행하는 데 능숙한 자가 평화로운 경지를 얻고자 한다면' },
  { id: 'v2', number: 2, paliText: 'Sakko ujū ca sūjū ca suvaco cassa mudu anatimānī', koreanTranslation: '유능하고 정직하며 올곧고 말 잘 듣고 부드럽고 겸손해야 하리' },
  { id: 'v3', number: 3, paliText: 'Santussako ca subharo ca appakicco ca sallahukavutti santindriyo ca nipako ca appagabbho kulesu ananugiddho', koreanTranslation: '만족할 줄 알고 부양하기 쉬우며 할 일 적고 생활이 단순하며 감각이 고요하고 현명하며 거만하지 않고 가정에 집착하지 않아야 하리' },
  { id: 'v4', number: 4, paliText: 'Na ca khuddaṃ samācare kiñci yena viññū pare upavadeyyuṃ', koreanTranslation: '현명한 자들이 비난할 어떤 사소한 잘못도 저지르지 말라' },
  { id: 'v5', number: 5, paliText: 'Sukhino vā khemino hontu sabbe sattā bhavantu sukhitattā', koreanTranslation: '모든 존재가 행복하고 평안하기를 모든 존재가 마음으로 행복하기를' },
  { id: 'v6', number: 6, paliText: 'Ye keci pāṇabhūtatthi tasā vā thāvarā vā anavasesā dīghā vā ye mahantā vā majjhimā rassakā aṇukathūlā', koreanTranslation: '어떤 생명이든 존재하는 것들 두려워하는 것이든 두려워하지 않는 것이든 긴 것이든 큰 것이든 중간이든 짧은 것이든 미세한 것이든 거대한 것이든' },
  { id: 'v7', number: 7, paliText: 'Na paro paraṃ paraṃ nikubbetha nātimaññetha katthaci naṃ kiñci byārosanā paṭighasaññā nāññamaññassa dukkhamiccheyya', koreanTranslation: '어느 누구도 다른 이를 속이지 말고 어디서든 누구도 업신여기지 말라' },
  { id: 'v8', number: 8, paliText: 'Mātā yathā niyaṃ puttaṃ āyusā ekaputtamanurakkhe', koreanTranslation: '어머니가 자신의 아들을 목숨을 걸고 외아들을 보호하듯' },
  { id: 'v9', number: 9, paliText: 'evampi mānasaṃ bhāvaye aparimāṇaṇaṃ', koreanTranslation: '모든 존재에 대해 무한한 마음을 닦아야 하리' },
  { id: 'v10', number: 10, paliText: 'Mettañca sabbalokasmiṃ mānasaṃ bhāvaye aparimāṇaṇaṃ uddhaṃ adho ca tiriyañca asambādhaṃ averaṃ asapattaṃ mettañca sabbalokasmiṃ mānasaṃ bhāvaye aparimāṇaṇaṃ', koreanTranslation: '온 세상에 대한 자비로 무한한 마음을 닦아야 하리' },
];

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
