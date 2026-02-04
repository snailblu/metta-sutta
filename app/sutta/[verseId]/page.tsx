'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PhraseDetail } from '@/components/sutta/PhraseDetail';
import { ProgressBar } from '@/components/sutta/ProgressBar';
import { useProgress } from '@/lib/db/hooks';
import { getVerse, getPhrasesForVerse } from '@/data';
import { useSettings } from '@/store/settings';
import { Home, Settings, Book, Languages, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SuttaPage() {
  const params = useParams();
  const router = useRouter();
  const verseId = params.verseId as string;
  const { translationVersion } = useSettings();

  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(null);
  
  // 진도 저장
  const { saveProgress } = useProgress('metta-sutta');

  const verse = getVerse(verseId);
  const phrases = getPhrasesForVerse(verseId);
  const totalVerses = 12;

  useEffect(() => {
    if (verse) {
      saveProgress(verse.number);
    }
  }, [verseId, saveProgress, verse]);

  if (!verse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>게송을 찾을 수 없습니다</p>
      </div>
    );
  }

  const navigateVerse = (direction: 'prev' | 'next') => {
    const newNum = direction === 'next'
      ? Math.min(verse.number + 1, totalVerses)
      : Math.max(verse.number - 1, 1);
    router.push(`/sutta/v${newNum}`);
  };

  const handlePhraseSelect = (phraseId: string) => {
    setSelectedPhraseId(phraseId);
  };

  // const completedCount = progress?.completedVerses?.length || 0;

  const currentTranslation = verse.translations[translationVersion] || verse.translations.default;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center justify-between px-4">
          <Button variant="ghost" onClick={() => router.push('/')} className="flex items-center gap-2">
            <Home className="w-4 h-4" /> 홈
          </Button>
          <span className="text-sm text-muted-foreground">
            제 {verse.number} 게송
          </span>
          <Button variant="ghost" onClick={() => router.push('/settings')} className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> 설정
          </Button>
        </div>
        
        {/* 진도 바 */}
        <ProgressBar 
          current={verse.number} 
          total={totalVerses} 
        />
      </header>

      {/* 게송 내용 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-6 pb-24">
          {/* 게송 번호 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-1">
              제 {verse.number} 게송
            </h2>
            {verse.source && (
              <p className="text-xs text-muted-foreground mb-2">
                {verse.source}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {verse.number === 1 && '수행자의 자질'}
              {verse.number === 2 && '수행자의 태도'}
              {verse.number === 3 && '수행자의 자세'}
              {verse.number === 4 && '잘못을 피하는 지혜'}
              {verse.number === 5 && '자비 수행의 시작'}
              {verse.number === 6 && '자비 수행의 확장'}
              {verse.number === 7 && '자비 수행의 확장 - 사방'}
              {verse.number === 8 && '어머니의 자비'}
              {verse.number === 9 && '어머니의 자비 (비유)'}
              {verse.number === 10 && '자비의 완성'}
              {verse.number === 11 && '수행의 일상화'}
              {verse.number === 12 && '열반의 성취'}
            </p>
          </div>

          {/* 팔리어 원문 */}
          <div className="bg-card border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">
                팔리어 원문
              </h3>
            </div>
            <p className="text-xl text-primary leading-relaxed">
              {verse.paliText}
            </p>
          </div>

          {/* 한국어 번역 */}
          <div className="bg-card border rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  한국어 번역
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {translationVersion === 'default' && '표준 번역'}
                {translationVersion === 'daelim' && '대림스님 번역'}
                {translationVersion === 'mahavihara' && '마하위하라 번역'}
              </span>
            </div>
            <p className="text-xl text-foreground leading-relaxed">
              {currentTranslation || verse.translations.default}
            </p>
          </div>

          {/* 구절 목록 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">
                구절 상세보기
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {phrases.map((phrase) => (
                <button
                  key={phrase.id}
                  onClick={() => handlePhraseSelect(phrase.id)}
                  className={`text-left bg-card border rounded-lg p-4 transition-all ${
                    selectedPhraseId === phrase.id
                      ? 'ring-2 ring-primary/50'
                      : 'hover:border-primary/50'
                  }`}
                >
                  <p className="text-lg font-medium text-primary mb-1">
                    {phrase.paliText}
                  </p>
                  <p className="text-base text-foreground">
                    {phrase.koreanTranslation}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {phrase.wordIds?.length || 0}개 단어
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-10">
        <div className="max-w-lg mx-auto flex justify-between">
          <Button
            onClick={() => navigateVerse('prev')}
            disabled={verse.number === 1}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> 이전
          </Button>
          <Button
            onClick={() => navigateVerse('next')}
            disabled={verse.number === totalVerses}
            size="lg"
            className="flex items-center gap-2"
          >
            다음 <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* 구절 상세 모달 */}
      {selectedPhraseId && (
        <PhraseDetail
          phraseId={selectedPhraseId}
          onClose={() => setSelectedPhraseId(null)}
        />
      )}
    </div>
  );
}
