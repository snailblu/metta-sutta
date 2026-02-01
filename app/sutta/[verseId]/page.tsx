import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getVerse, getPhrasesForVerse, sutta } from '@/data';

export default function SuttaPage() {
  const params = useParams();
  const router = useRouter();
  const verseId = params.verseId as string;

  const verse = getVerse(verseId);
  const phrases = getPhrasesForVerse(verseId);
  const totalVerses = sutta.verseCount;

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

  const fontSizeClass = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl',
  }['large' as const]; // TODO: settings에서 가져오기

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            ← 홈
          </Button>
          <span className="text-sm text-muted-foreground">
            {verse.number} / {totalVerses} 게송
          </span>
          <Button variant="ghost" onClick={() => router.push('/settings')}>
            설정
          </Button>
        </div>
      </header>

      {/* 게송 내용 */}
      <main className="flex-1 p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* 게송 번호 */}
          <div className="text-center">
            <h2 className="text-lg font-medium text-muted-foreground">
              제 {verse.number} 게송
            </h2>
          </div>

          {/* 팔리어 원문 */}
          <div className="bg-card border border-border rounded-lg p-6">
            <p className={`${fontSizeClass} text-primary leading-relaxed mb-4`}>
              {verse.paliText}
            </p>
            <p className={`${fontSizeClass} text-foreground leading-relaxed`}>
              {verse.koreanTranslation}
            </p>
          </div>

          {/* 구절 목록 */}
          <div className="space-y-4">
            {phrases.map((phrase) => (
              <button
                key={phrase.id}
                className="w-full text-left bg-muted/50 hover:bg-muted rounded-lg p-4 transition-colors"
                onClick={() => router.push(`/phrase/${phrase.id}`)}
              >
                <p className={`${fontSizeClass} text-primary mb-2`}>
                  {phrase.paliText}
                </p>
                <p className={`${fontSizeClass} text-foreground`}>
                  {phrase.koreanTranslation}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex justify-between max-w-lg mx-auto">
          <Button
            onClick={() => navigateVerse('prev')}
            disabled={verse.number === 1}
            variant="outline"
          >
            ← 이전
          </Button>
          <Button
            onClick={() => navigateVerse('next')}
            disabled={verse.number === totalVerses}
          >
            다음 →
          </Button>
        </div>
      </nav>
    </div>
  );
}
