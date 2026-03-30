"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSettings } from "@/store/settings";
import explanations from "@/data/metta-sutta/phrase-explanations.json";

interface Props {
  phraseId: string;
  onClose: () => void;
}

interface Explanation {
  phraseId: string;
  context: string;
  practice: string;
}

interface AiExplanationResult {
  contextTranslation?: string;
  practiceExplanation?: string;
  relatedConcepts?: string[];
}

export function AiExplanation({ phraseId, onClose }: Props) {
  const [result, setResult] = useState<AiExplanationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"context" | "practice">("context");
  const { fontSize } = useSettings();

  const fontSizeClass =
    {
      small: "text-base",
      medium: "text-lg",
      large: "text-xl",
      xlarge: "text-2xl",
    }[fontSize] || "text-lg";

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const explanation = (explanations.explanations as Explanation[]).find(
      e => e.phraseId === phraseId
    );

    if (explanation) {
      setResult({
        contextTranslation: explanation.context,
        practiceExplanation: explanation.practice,
      });
    }
    setActiveTab("context");
  }, [phraseId]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-50 dark:bg-neutral-950 border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">🤖 AI 해설</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-muted-foreground">해설을 찾을 수 없습니다.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* 탭 */}
              <div className="flex gap-2 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("context")}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    activeTab === "context"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10"
                  }`}
                >
                  문맥 번역
                </button>
                <button
                  onClick={() => setActiveTab("practice")}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    activeTab === "practice"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10"
                  }`}
                >
                  수행적 의미
                </button>
              </div>

              {/* 문맥 번역 */}
              {activeTab === "context" && result.contextTranslation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">📖 문맥 번역</h3>
                  <div
                    className={`bg-muted/30 rounded-lg p-4 ${fontSizeClass} text-foreground leading-relaxed`}
                  >
                    {result.contextTranslation}
                  </div>
                </div>
              )}

              {/* 수행적 의미 */}
              {activeTab === "practice" && result.practiceExplanation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">🧘 수행적 의미</h3>
                  <div
                    className={`bg-muted/30 rounded-lg p-4 ${fontSizeClass} text-foreground leading-relaxed`}
                  >
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
            메따 숫따(자비 경)의 전통적인 해설을 참고하여 작성되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
