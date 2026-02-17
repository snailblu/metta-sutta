'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  
  // 온보딩 체크
  const [mounted, setMounted] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  
  useEffect(() => {
    // localStorage에서 온보딩 여부 체크
    let onboarded = false;
    try {
      const settings = localStorage.getItem('metta-sutta-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.onboardingCompleted) {
          onboarded = true;
        }
      }
    } catch (err) {
      console.error('Failed to read settings:', err);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnboarded(onboarded);
    setMounted(true);

    // 온보딩이 완료되지 않으면 자동 리다이렉트
    if (!onboarded) {
      router.replace('/onboarding');
    }
  }, [router]);

  const handleStart = () => {
    const settings = localStorage.getItem('metta-sutta-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      const lastPosition = parsed.lastPosition;
      const startLink = lastPosition
        ? `/sutta/v${lastPosition.verseNumber}`
        : '/sutta/v1';
      router.push(startLink);
    } else {
      router.push('/sutta/v1');
    }
  };

  const handleContinue = () => {
    const settings = localStorage.getItem('metta-sutta-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      const lastPosition = parsed.lastPosition;
      if (lastPosition) {
        router.push(`/sutta/v${lastPosition.verseNumber}`);
      }
    }
  };

  // 온보딩 완료 전까지는 렌더링 방지
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 헤더 */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            자비경 연구
          </h1>
          <p className="text-lg text-muted-foreground">
            메타 숫타 팔리어 학습 도구
          </p>
        </div>

        {/* 설명 */}
        <div className="bg-card border rounded-lg p-6 text-left space-y-4">
          <p className="text-foreground">
            팔리어 원전을 한국어로 직접 탐구하고
            수행의 깊은 의미를 발견하세요.
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>• 팔리어 원문 + 한국어 번역</li>
            <li>• 단어별 상세 분석</li>
            <li>• AI 문맥 해석 (예정)</li>
            <li>• 개인 메모</li>
          </ul>
        </div>

        {/* 경전 분석기 카드 */}
        <Link href="/translator" className="block">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-6 text-left space-y-3 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🧘</span>
              <div>
                <h2 className="text-2xl font-bold text-blue-900">경전 분석기</h2>
                <p className="text-blue-700">도반이 함께하는 쉬운 풀이</p>
              </div>
            </div>
            <p className="text-blue-800 text-lg">
              빨리어 문구를 넣으면<br />
              <strong>단어 · 문법 · 해설</strong>을 알려드려요
            </p>
            <div className="flex items-center justify-end text-blue-600 font-semibold text-lg">
              분석 시작 <span className="ml-1">→</span>
            </div>
          </div>
        </Link>

        {/* 버튼 */}
        <div className="space-y-4">
          <Button onClick={handleStart} size="lg" className="w-full text-lg py-6">
            경전 보기
          </Button>

          {isOnboarded && (
            <Button onClick={handleContinue} variant="outline" size="sm">
              이어보기
            </Button>
          )}
        </div>

        {/* 설정 */}
        <Button asChild variant="ghost" size="sm">
          <Link href="/settings">
            설정
          </Link>
        </Button>
      </div>
    </div>
  );
}
