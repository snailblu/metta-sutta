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
    setMounted(true);
    
    // localStorage에서 온보딩 여부 체크
    try {
      const settings = localStorage.getItem('metta-sutta-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.onboardingCompleted) {
          setIsOnboarded(true);
        }
      }
    } catch (err) {
      console.error('Failed to read settings:', err);
    }
  }, []);

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

  if (!mounted) {
    return null;
  }

  // 온보딩이 완료되지 않으면 자동 리다이렉트
  useEffect(() => {
    if (mounted && !isOnboarded) {
      router.replace('/onboarding');
    }
  }, [mounted, isOnboarded]);

  // 온보딩 완료 전까지는 렌더링 방지
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
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
        <div className="bg-card border border-border rounded-lg p-6 text-left space-y-4">
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
