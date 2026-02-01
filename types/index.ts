// 데이터 타입 정의

export interface Sutta {
  id: string;
  paliName: string;
  koreanName: string;
  source: string;
  verseCount: number;
}

export interface Verse {
  id: string;
  number: number;
  paliText: string;
  koreanTranslation: string;
}

export interface Phrase {
  id: string;
  verseId: string;
  order: number;
  paliText: string;
  koreanTranslation: string;
  wordIds: string[];
}

export interface Word {
  id: string;
  pali: string;
  pronunciation: string;
  partOfSpeech: string;
  root: string;
  meanings: string[];
  etymology?: string;
  relatedTerms?: string[];
  notes?: string;
}

export interface PhraseWord {
  phraseId: string;
  wordId: string;
  position: number;
  form: string;
  grammar: string;
  contextMeaning: string;
}

export interface VerseContext {
  verseNumber: number;
  section: string;
  previousPhrase: string | null;
  nextPhrase: string | null;
}
