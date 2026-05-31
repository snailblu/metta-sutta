"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import type { SuttaAnalysisResult } from "@/lib/ai/sutta-analysis-schema";

type SegmentAnalysisProps = {
  /** 분석할 구절들 (한 그룹) */
  segments: Array<{ id: string; pali: string }>;
  /** 경전 컨텍스트 (예: "SN56.11 - Dhammacakkappavattana Sutta") */
  context: string;
  /** 캐시된 분석 결과 (있으면 API 호출 없이 표시) */
  cachedResult?: SuttaAnalysisResult | null;
  /** 분석 완료 시 상위로 결과 전달 (캐싱용) */
  onAnalysisComplete?: (groupKey: string, result: SuttaAnalysisResult) => void;
  /** 그룹 식별자 (캐시 키) */
  groupKey: string;
};

export default function SegmentAnalysis({
  segments,
  context,
  cachedResult,
  onAnalysisComplete,
  groupKey,
}: SegmentAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuttaAnalysisResult | null>(cachedResult ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);

    // 이미 결과가 있으면 다시 호출하지 않음
    if (result) return;

    // API 호출
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      // 90초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90_000);

      try {
        const res = await fetch("/api/sutta-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segments, context }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({ error: "분석 요청 실패" }));
          throw new Error(errBody.error || `HTTP ${res.status}`);
        }

        const parsed = (await res.json()) as SuttaAnalysisResult;
        setResult(parsed);
        onAnalysisComplete?.(groupKey, parsed);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setError("분석 시간이 초과되었습니다. 다시 시도해주세요.");
        } else if (err instanceof SyntaxError) {
          setError("AI 응답을 처리하는 데 실패했습니다. 다시 시도해주세요.");
        } else {
          const message = err instanceof Error ? err.message : "분석 중 오류가 발생했습니다";
          setError(message);
        }
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    void fetchAnalysis();
  }, [isExpanded, result, segments, context, groupKey, onAnalysisComplete]);

  return (
    <div className="space-y-3">
      {/* 구절 카드들 */}
      {segments.map(segment => (
        <button
          key={segment.id}
          onClick={handleToggle}
          className="group w-full cursor-pointer rounded-xl border border-neutral-200 bg-white/80 p-5 text-left transition-all hover:border-amber-300 hover:bg-amber-50/50 dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="flex-1 text-base leading-8 text-neutral-900 dark:text-neutral-100 sm:text-lg">
              {segment.pali}
            </p>
            <div className="flex shrink-0 items-center gap-1.5 pt-1">
              <Sparkles className="size-4 text-amber-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-amber-400" />
              {isExpanded ? (
                <ChevronUp className="size-4 text-neutral-400" />
              ) : (
                <ChevronDown className="size-4 text-neutral-400" />
              )}
            </div>
          </div>
        </button>
      ))}

      {/* 분석 결과 패널 */}
      {isExpanded && (
        <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-900/50 dark:bg-amber-950/10">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-neutral-500 dark:text-neutral-400">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm font-medium">도반이 구절을 살펴보는 중...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              ⚠️ {error}
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {result.segments.map(seg => (
                <div key={seg.segmentId} className="space-y-4">
                  {/* 원문 */}
                  <div className="rounded-lg bg-white/60 p-3 dark:bg-neutral-800/60">
                    <p className="text-sm leading-7 text-neutral-800 dark:text-neutral-200">
                      {seg.original}
                    </p>
                  </div>

                  {/* 번역 비교 */}
                  <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/10">
                    <h4 className="text-sm font-semibold tracking-wide text-blue-700 dark:text-blue-400">
                      📜 번역
                    </h4>

                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
                        직역
                      </span>
                      <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                        {seg.translations?.literal}
                      </p>
                    </div>

                    <div className="border-t border-blue-200/50 pt-3 dark:border-blue-800/50">
                      <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
                        수행역
                      </span>
                      <p className="mt-1 text-base font-semibold leading-relaxed text-blue-900 dark:text-blue-200">
                        &ldquo;{seg.translations?.zen_style}&rdquo;
                      </p>
                    </div>

                    {seg.translations?.chineseTranslation && (
                      <div className="border-t border-blue-200/50 pt-3 dark:border-blue-800/50">
                        <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
                          한문
                        </span>
                        <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                          {seg.translations.chineseTranslation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 단어 분석 */}
                  {seg.pali_analysis && seg.pali_analysis.length > 0 && (
                    <div className="rounded-xl border border-neutral-200 bg-white/60 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
                      <h4 className="mb-3 text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-400">
                        🔍 단어 분석
                      </h4>
                      <div className="overflow-x-auto">
                        <div className="space-y-0">
                          {/* 헤더 */}
                          <div className="grid grid-cols-[1fr_1.2fr_1fr_0.6fr] gap-2 border-b border-neutral-200 pb-2 text-xs font-medium text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
                            <span>단어</span>
                            <span>문법</span>
                            <span>뜻</span>
                            <span>한자</span>
                          </div>
                          {/* 행 */}
                          {seg.pali_analysis.map((item, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-[1fr_1.2fr_1fr_0.6fr] gap-2 border-b border-neutral-100 py-2 last:border-0 dark:border-neutral-700/50"
                            >
                              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {item.word}
                              </span>
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                {item.grammar}
                              </span>
                              <span className="text-sm text-neutral-800 dark:text-neutral-200">
                                {item.meaning}
                              </span>
                              <span className="text-xs text-neutral-700 dark:text-neutral-300">
                                {item.chineseMeaning ?? ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 구절 해설 */}
                  {seg.commentary && (
                    <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-900/50 dark:bg-green-950/10">
                      <h4 className="mb-2 text-sm font-semibold tracking-wide text-green-700 dark:text-green-400">
                        🧘 해설
                      </h4>
                      <p className="text-sm leading-7 text-neutral-900 dark:text-neutral-100">
                        {seg.commentary}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* 전체 해설 */}
              {result.overallCommentary && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                  <h4 className="mb-2 text-sm font-semibold tracking-wide text-amber-700 dark:text-amber-400">
                    ✨ 이 구절 그룹의 의미
                  </h4>
                  <p className="text-sm leading-7 text-neutral-900 dark:text-neutral-100">
                    {result.overallCommentary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
