import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPhrase, getWordsForPhrase } from '@/data';

export default function PhrasePage() {
  const params = useParams();
  const router = useRouter();
  const phraseId = params.phraseId as string;

  const phrase = getPhrase(phraseId);
  const words = getWordsForPhrase(phraseId);

  if (!phrase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>구절을 찾을 수 없습니다</p>
      </div>
    );
  }

  const fontSizeClass = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl',
  }['large' as const]; // TODO: settings에서 가져오기

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 뒤로
        </Button>
      </header>

      <main className="p-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 구절 원문 */}
          <Card>
            <CardContent className="pt-6">
              <p className={`${fontSizeClass} text-primary leading-relaxed mb-4`}>
                {phrase.paliText}
              </p>
              <p className={`${fontSizeClass} text-foreground leading-relaxed`}>
                {phrase.koreanTranslation}
              </p>
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
        </div>
      </main>
    </div>
  );
}
