'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { useSettings } from '@/store/settings';

interface Props {
  phraseId: string;
  onClose: () => void;
}

export function AiExplanation({ phraseId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'context' | 'practice'>('context');
  const { fontSize } = useSettings();

  const fontSizeClass = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  }[fontSize] || 'text-lg';

  const fetchAiExplanation = async () => {
    setLoading(true);
    setError(null);
    setActiveTab('context');

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phraseId }),
      });

      if (!res.ok) throw new Error('API 요청 실패');

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('AI 해설을 가져오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">🤖 AI 해설</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">AI가 생각하고 있습니다...</p>
              <p className="text-sm text-muted-foreground">문맥을 분석하여 문맥 번역과 수행적 의미를 제안합니다.</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-center">
              <p className="font-medium">❌ {error}</p>
              <Button onClick={fetchAiExplanation} className="mt-4">
                다시 시도
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* 탭 */}
              <div className="flex gap-2 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('context')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    activeTab === 'context'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary/10'
                  }`}
                >
                  문맥 번역
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    activeTab === 'practice'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary/10'
                  }`}
                >
                  수행적 의미
                </button>
              </div>

              {/* 문맥 번역 */}
              {activeTab === 'context' && result.contextTranslation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">📖 문맥 번역</h3>
                  <div className={`bg-muted/30 rounded-lg p-4 ${fontSizeClass} text-foreground leading-relaxed`}>
                    {result.contextTranslation}
                  </div>
                </div>
              )}

              {/* 수행적 의미 */}
              {activeTab === 'practice' && result.practiceExplanation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">🧘 수행적 의미</h3>
                  <div className={`bg-muted/30 rounded-lg p-4 ${fontSizeClass} text-foreground leading-relaxed`}>
                    {result.practiceExplanation}
                  </div>
                  
                  {result.relatedConcepts && result.relatedConcepts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground">관련 개념</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.relatedConcepts.map((concept: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t">
          <p className="text-xs text-center text-muted-foreground">
            AI가 제안하는 해석입니다. 참고용으로 활용해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
