import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getWord, getPhraseWord } from '@/data';

export default function WordPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wordId = params.wordId as string;
  const fromPhraseId = searchParams.get('from');

  const word = getWord(wordId);
  const phraseWord = fromPhraseId ? getPhraseWord(fromPhraseId, wordId) : null;

  if (!word) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>단어를 찾을 수 없습니다</p>
      </div>
    );
  }

  const fontSizeClass = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  }['large' as const]; // TODO: settings에서 가져오기

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          ← 뒤로
        </Button>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* 단어 제목 */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">
              {word.pali}
            </h1>
            <p className="text-xl text-muted-foreground">
              {word.pronunciation}
            </p>
          </div>

          {/* 기본 정보 */}
          <section className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-1">품사</p>
                <p className={fontSizeClass}>{word.partOfSpeech}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-1">어근</p>
                <p className={fontSizeClass}>{word.root}</p>
              </CardContent>
            </Card>
          </section>

          {/* 사전적 의미 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">📖 사전적 의미</h2>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {word.meanings.map((meaning, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className={fontSizeClass}>{meaning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 이 문맥에서의 의미 */}
          {phraseWord && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">🎯 이 문맥에서</h2>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">활용형: </span>
                    <span className="font-medium">{phraseWord.form}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">문법: </span>
                    <span>{phraseWord.grammar}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">의미: </span>
                    <span className={`${fontSizeClass} font-medium`}>
                      {phraseWord.contextMeaning}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 어원 */}
          {word.etymology && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">📚 어원</h2>
              <Card>
                <CardContent className="pt-4">
                  <p className={`${fontSizeClass} leading-relaxed`}>
                    {word.etymology}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 관련 용어 */}
          {word.relatedTerms && word.relatedTerms.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foreground">🔗 관련 용어</h2>
              <div className="flex flex-wrap gap-2">
                {word.relatedTerms.map((term, i) => (
                  <span key={i} className="px-4 py-2 bg-muted rounded-full">
                    {term}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 메모 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">📝 내 메모</h2>
              <Button variant="outline" size="sm">
                + 추가
              </Button>
            </div>
            <Card>
              <CardContent className="pt-4">
                <p className="text-muted-foreground text-center py-8">
                  아직 메모가 없습니다
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
