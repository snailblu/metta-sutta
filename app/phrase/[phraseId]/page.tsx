'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPhrase, getWordsForPhrase } from '@/data';
import { useSettings, getFontSizeClass } from '@/store/settings';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { useNotes } from '@/lib/db/hooks';

export default function PhrasePage() {
  const params = useParams();
  const router = useRouter();
  const phraseId = params.phraseId as string;

  // Zustand store hydration
  const [mounted, setMounted] = useState(false);
  const settingsStore = useSettings();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const fontSize = mounted ? settingsStore.fontSize : 'large';
  const defaultView = mounted ? settingsStore.defaultView : 'both';

  const [showNoteEditor, setShowNoteEditor] = useState(false);

  const phrase = getPhrase(phraseId);
  const words = getWordsForPhrase(phraseId);
  const { note } = useNotes('phrase', phraseId);

  if (!phrase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>구절을 찾을 수 없습니다</p>
      </div>
    );
  }

  const fontSizeClass = getFontSizeClass(fontSize);
  const showPali = defaultView === 'pali' || defaultView === 'both';
  const showKorean = defaultView === 'korean' || defaultView === 'both';

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4 z-10">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 뒤로
        </Button>
      </header>

      <main className="p-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 구절 원문 */}
          <Card>
            <CardContent className="pt-6">
              {showPali && (
                <p className={`${fontSizeClass} text-primary leading-relaxed ${showKorean ? 'mb-4' : ''}`}>
                  {phrase.paliText}
                </p>
              )}
              {showKorean && (
                <p className={`${fontSizeClass} text-foreground leading-relaxed`}>
                  {phrase.koreanTranslation}
                </p>
              )}
            </CardContent>
          </Card>

          {/* 단어 분석 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">단어 분석</h3>
            {words.map((word) => (
              <button
                key={word.id}
                className="w-full text-left bg-muted/50 hover:bg-muted rounded-lg p-4 transition-colors"
                onClick={() => router.push(`/word/${word.id}?from=${phrase.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-medium text-primary mb-1">
                      {word.pali}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {word.pronunciation}
                    </p>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 메모 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">📝 내 메모</h3>
              <Button variant="outline" size="sm" onClick={() => setShowNoteEditor(true)}>
                {note ? '편집' : '+ 추가'}
              </Button>
            </div>
            <Card>
              <CardContent className="pt-4">
                {note ? (
                  <p className="text-foreground whitespace-pre-wrap">{note}</p>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    아직 메모가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 메모 에디터 모달 */}
      {showNoteEditor && (
        <NoteEditor
          targetType="phrase"
          targetId={phraseId}
          onClose={() => setShowNoteEditor(false)}
        />
      )}
    </div>
  );
}
