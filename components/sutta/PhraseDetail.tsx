'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Brain, FileText } from 'lucide-react';
import { WordList } from './WordList';
import { AiExplanation } from '@/components/ai/AiExplanation';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { WordDetailModal } from './WordDetailModal';
import { useSettings, getFontSizeClass } from '@/store/settings';
import { getPhrase, getWord } from '@/data';

interface Props {
  phraseId: string;
  onClose: () => void;
}

export function PhraseDetail({ phraseId, onClose }: Props) {
  const [showAi, setShowAi] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  const { fontSize } = useSettings();
  const fontSizeClass = getFontSizeClass(fontSize);
  const phrase = getPhrase(phraseId);

  if (!phrase) return null;

  /*
  const fontSizeClassSm = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  }[fontSize] || 'text-lg';
  */

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-neutral-50 dark:bg-neutral-950 border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold">구절 상세</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 스크 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 구절 원문 */}
          <div className="bg-muted/30 rounded-lg p-6">
            <p className={`${fontSizeClass} text-primary leading-relaxed mb-4`}>
              {phrase.paliText}
            </p>
            <p className={`${fontSizeClass} text-foreground leading-relaxed`}>
              {phrase.koreanTranslation}
            </p>
          </div>

          {/* 단어 분석 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">단어 분석</h4>
              <span className="text-xs text-muted-foreground">
                {(phrase.wordIds?.filter(id => !!getWord(id)).length || 0)}개
              </span>
            </div>
            <WordList 
              wordIds={phrase.wordIds?.filter(id => !!getWord(id)) || []} 
              onWordSelect={setSelectedWordId} 
            />
          </div>

          {/* 액션 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowAi(true)}
              className="flex items-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-left transition-colors"
            >
              <Brain className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">AI 해설 보기</p>
                <p className="text-sm text-muted-foreground">문맥 번역 + 수행적 의미</p>
              </div>
            </button>
            <button
              onClick={() => setShowNote(true)}
              className="flex items-center gap-3 p-4 bg-muted hover:bg-muted/80 rounded-lg text-left transition-colors"
            >
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-foreground">메모 추가</p>
                <p className="text-sm text-muted-foreground">나만의 정리</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* AI 해설 모달 */}
      {showAi && (
        <AiExplanation phraseId={phraseId} onClose={() => setShowAi(false)} />
      )}

      {/* 메모 에디터 모달 */}
      {showNote && (
        <NoteEditor
          targetType="phrase"
          targetId={phraseId}
          onClose={() => setShowNote(false)}
        />
      )}

      {/* 단어 상세 모달 */}
      {selectedWordId && (
        <WordDetailModal
          wordId={selectedWordId}
          onClose={() => setSelectedWordId(null)}
        />
      )}
    </div>
  );
}
