"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SegmentAnalysis from "@/components/sutta/SegmentAnalysis";
import type { SuttaAnalysisResult } from "@/lib/ai/sutta-analysis-schema";

type Nikaya = {
  id: string;
  name: string;
  nameKo: string;
  count: number;
};

type SuttaSegment = {
  id: string;
  pali: string;
};

type SegmentGroup = {
  label: string;
  segments: SuttaSegment[];
};

type SuttaReaderClientProps = {
  nikayaInfo: Nikaya;
  suttaUid: string;
  suttaTitle: string;
  groups: SegmentGroup[];
};

export default function SuttaReaderClient({
  nikayaInfo,
  suttaUid,
  suttaTitle,
  groups,
}: SuttaReaderClientProps) {
  // 클라이언트 메모리 캐시: groupKey → analysis result
  const [analysisCache, setAnalysisCache] = useState<Map<string, SuttaAnalysisResult>>(new Map());

  const context = `${suttaUid} - ${suttaTitle}`;

  const handleAnalysisComplete = useCallback((groupKey: string, result: SuttaAnalysisResult) => {
    setAnalysisCache(prev => {
      const next = new Map(prev);
      next.set(groupKey, result);
      return next;
    });
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <Button asChild variant="ghost" className="w-fit rounded-xl px-0 hover:bg-transparent">
            <Link href={`/suttas/${nikayaInfo.id}`}>
              <ArrowLeft className="size-4" />
              {nikayaInfo.nameKo}
            </Link>
          </Button>

          <div className="space-y-2">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{nikayaInfo.name}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              {suttaTitle}
            </h1>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
              {suttaUid}
            </p>
          </div>
        </header>

        <section className="space-y-6">
          {groups.map((group, index) => {
            const groupKey = `${suttaUid}-${group.label}`;
            const cachedResult = analysisCache.get(groupKey) ?? null;

            return (
              <div key={`${group.label}-${index}`} className="space-y-4">
                {index > 0 ? (
                  <div className="border-t border-neutral-200 dark:border-neutral-800" />
                ) : null}

                <div className="pl-1 text-xs font-semibold tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                  {group.label}
                </div>

                <SegmentAnalysis
                  segments={group.segments}
                  context={context}
                  cachedResult={cachedResult}
                  onAnalysisComplete={handleAnalysisComplete}
                  groupKey={groupKey}
                />
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
