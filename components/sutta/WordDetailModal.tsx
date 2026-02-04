'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Book, History, Link as LinkIcon, FileText } from 'lucide-react';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { useSettings, getFontSizeClass } from '@/store/settings';
import { useNotes } from '@/lib/db/hooks';
import { getWord } from '@/data';
import { createPortal } from 'react-dom';

interface Props {
  wordId: string;
  onClose: () => void;
}

export function WordDetailModal({ wordId, onClose }: Props) {
  const [showNote, setShowNote] = useState(false);

  const { fontSize } = useSettings();
  const fontSizeClass = getFontSizeClass(fontSize);
  const { note } = useNotes('word', wordId);

  const word = getWord(wordId);

  if (!word) {
    return createPortal(
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-neutral-50 dark:bg-neutral-950 border rounded-lg max-w-2xl w-full p-6 text-center shadow-2xl">
          <p>단어를 찾을 수 없습니다</p>
          <Button variant="outline" className="mt-4" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>,
      document.body
    );
  }

  const content = (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-neutral-50 dark:bg-neutral-950 border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold">단어 상세</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 단어 헤더 */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-primary">{word.pali}</h1>
              <p className="text-xl text-muted-foreground">{word.pronunciation}</p>
            </div>

            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">품사</p>
                <p className={`${fontSizeClass} text-foreground`}>{word.partOfSpeech}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">어근</p>
                <p className={`${fontSizeClass} text-foreground`}>{word.root}</p>
              </div>
            </div>

            {/* 사전적 의미 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-bold text-foreground">사전적 의미</h4>
              </div>
              <div className="space-y-2">
                {word.meanings.map((meaning, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-base text-foreground">{meaning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 어원 */}
            {word.etymology && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h4 className="text-lg font-bold text-foreground">어원</h4>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-base leading-relaxed text-foreground">{word.etymology}</p>
                </div>
              </div>
            )}

            {/* 관련 용어 */}
            {word.relatedTerms && word.relatedTerms.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  <h4 className="text-lg font-bold text-foreground">관련 용어</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {word.relatedTerms.map((term, i) => (
                    <span key={i} className="px-3 py-1.5 bg-muted rounded-full text-sm">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 메모 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h4 className="text-lg font-bold text-foreground">내 메모</h4>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowNote(true)}>
                  {note ? '편집' : '+ 추가'}
                </Button>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                {note ? (
                  <p className="text-foreground whitespace-pre-wrap">{note}</p>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    아직 메모가 없습니다
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메모 에디터 모달 */}
      {showNote && (
        <NoteEditor
          targetType="word"
          targetId={wordId}
          onClose={() => setShowNote(false)}
        />
      )}
    </>
  );

  return createPortal(content, document.body);
}
