'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { WordDetailCard } from '@/components/sutta/WordDetailCard';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { useSettings, getFontSizeClass } from '@/store/settings';
import { useNotes } from '@/lib/db/hooks';
import { getWord } from '@/data';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';

export default function WordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const wordId = params.wordId as string;
  const fromPhraseId = searchParams.get('from');

  // const [selectedWordId, setSelectedWordId] = useState<string | null>(wordId);
  const [showNote, setShowNote] = useState(false);

  const { fontSize } = useSettings();
  const fontSizeClass = getFontSizeClass(fontSize);
  const { note } = useNotes('word', wordId);

  const word = getWord(wordId);

  if (!word) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>단어를 찾을 수 없습니다</p>
      </div>
    );
  }

  /*
  const fontSizeClassSm = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  }[fontSize] || 'text-lg';
  */

  const handleBack = () => {
    if (fromPhraseId) {
      router.push(`/phrase/${fromPhraseId}`);
    } else {
      router.back();
    }
  };

  const handleWordSelect = () => {
    // setSelectedWordId(_newWordId);
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-y-auto z-[100]">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4 z-10">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> 뒤로
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* 단어 헤더 */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-primary">
              {word.pali}
            </h1>
            <p className="text-xl text-muted-foreground">
              {word.pronunciation}
            </p>
          </div>

          {/* 기본 정보 */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">품사</p>
              <p className={`${fontSizeClass} text-foreground`}>
                {word.partOfSpeech}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">어근</p>
              <p className={`${fontSizeClass} text-foreground`}>
                {word.root}
              </p>
            </div>
          </section>

          {/* 단어 상세 카드 */}
          <WordDetailCard word={word} onWordSelect={handleWordSelect} />

          {/* 메모 섹션 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">내 메모</h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowNote(true)}>
                {note ? '편집' : '+ 추가'}
              </Button>
            </div>
            <div className="bg-card border rounded-lg">
              <CardContent className="pt-4">
                {note ? (
                  <p className="text-foreground whitespace-pre-wrap">{note}</p>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    아직 메모가 없습니다
                  </p>
                )}
              </CardContent>
            </div>
          </section>
        </div>
      </main>

      {/* 메모 에디터 모달 */}
      {showNote && (
        <NoteEditor
          targetType="word"
          targetId={wordId}
          onClose={() => setShowNote(false)}
        />
      )}
    </div>
  );
}
