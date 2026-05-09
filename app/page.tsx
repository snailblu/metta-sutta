"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import MettaTranslator from "@/components/features/MettaTranslator";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-neutral-900 dark:text-neutral-100 mb-2">
          빨리어 경전 분석기
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 text-center mb-6">
          빨리어 경전을 수행자의 관점에서 명쾌하게 풀어드립니다.
        </p>
      </div>

      {/* Translator */}
      <div className="flex-1 container mx-auto px-4 max-w-4xl pb-12">
        <MettaTranslator />
      </div>

      {/* Settings */}
      <div className="container mx-auto py-4 px-4 max-w-4xl text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/settings">설정</Link>
        </Button>
      </div>
    </div>
  );
}
