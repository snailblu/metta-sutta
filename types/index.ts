// 경전 (Sutta)
export interface Sutta {
  id: string;
  paliName: string; // "Karaṇīya Metta Sutta"
  koreanName: string; // "자비경"
  description: string;
  verseCount: number; // 10
}

// 게송 (Verse)
export interface Verse {
  id: string;
  suttaId: string;
  verseNumber: number; // 1-10
  paliText: string; // 팔리어 원문
  koreanTranslation: string;
}

// 구절 (Phrase)
export interface Phrase {
  id: string;
  verseId: string;
  order: number;
  paliText: string; // "Karaniyam attha-kusalena"
  koreanTranslation: string;
  wordIds: string[]; // 포함된 단어 ID 목록
}

// 단어 (Word)
export interface Word {
  id: string;
  pali: string; // "kusala"
  romanization: string; // "kusala"
  pronunciation: string; // "쿠살라"
  partOfSpeech: string; // "형용사/명사"
  root: string; // "√kus"
  meanings: string[]; // ["선한", "능숙한", "공덕"]
  etymology?: string; // 어원 설명
  relatedTerms?: string[]; // 관련 용어
  notes?: string; // 메모
}

// 구절-단어 매핑
export interface PhraseWord {
  phraseId: string;
  wordId: string;
  position: number;
  form: string; // 활용형 (예: "kusalena")
  grammar: string; // 문법 설명
  contextMeaning: string; // 해당 문맥에서의 의미
}

// 사용자 메모 (로컬 저장)
export interface UserNote {
  id?: number;
  targetType: 'phrase' | 'word';
  targetId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 설정 (로컬 저장)
export interface UserSettings {
  id: 'settings';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  theme: 'light' | 'dark';
  defaultView: 'pali' | 'korean' | 'both';
  lastVerseId?: string;
  onboardingCompleted: boolean;
}

// AI 응답
export interface AiResponse {
  contextTranslation: string;
  practiceExplanation: string;
  relatedConcepts: string[];
}
