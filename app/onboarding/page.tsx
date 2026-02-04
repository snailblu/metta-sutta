'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleStart = () => {
    // 스� 1: 글자 크기 선택
    setStep(2);
  };

  const handleComplete = () => {
    // 스� 2: 완료, 홈으로 이동
    router.push('/');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 헤더 */}
        <div className="space-y-4">
          <div className="text-6xl">🙏</div>
          <h1 className="text-4xl font-bold text-primary mb-2">
            자비경 연구에
          </h1>
          <p className="text-lg text-muted-foreground">
            오신 것을 환영합니다
          </p>
        </div>

        {/* 스� 1: 환영 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <p className="text-lg text-foreground mb-4">
                이 앱은 팔리어 경전을 연구하고
                수행의 의미를 깊이 탐구하는 도구입니다.
              </p>
              <ul className="space-y-2 text-left text-muted-foreground text-base">
                <li className="flex gap-2">
                  <span>📖</span>
                  <span>팔리어 원문 + 한국어 번역</span>
                </li>
                <li className="flex gap-2">
                  <span>🔍</span>
                  <span>단어별 상세 분석</span>
                </li>
                <li className="flex gap-2">
                  <span>🤖</span>
                  <span>AI 문맥 해석</span>
                </li>
                <li className="flex gap-2">
                  <span>📝</span>
                  <span>개인 메모</span>
                </li>
              </ul>
            </div>

            <Button onClick={handleStart} size="lg" className="w-full text-lg py-6">
              시작하기
            </Button>
          </div>
        )}

        {/* 스� 2: 글자 크기 선택 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              글자 크기 선택
            </h2>
            <p className="text-muted-foreground mb-6">
              편하게 보시기 위한 글자 크기를 선택해주세요.
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                }}
                className="w-full py-4"
              >
                ← 뒤로
              </Button>

              <Button
                variant="default"
                onClick={() => {
                  // 기본값: large
                  const settings = {
                    fontSize: 'large',
                    theme: 'light',
                    defaultView: 'both',
                    lastPosition: null,
                    onboardingCompleted: true
                  };
                  localStorage.setItem('metta-sutta-settings', JSON.stringify(settings));
                  handleComplete();
                }}
                className="w-full py-4 text-lg"
              >
                크게 (기본값)
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const settings = {
                    fontSize: 'xlarge',
                    theme: 'light',
                    defaultView: 'both',
                    lastPosition: null,
                    onboardingCompleted: true
                  };
                  localStorage.setItem('metta-sutta-settings', JSON.stringify(settings));
                  handleComplete();
                }}
                className="w-full py-4 text-lg"
              >
                아주 크게
              </Button>
            </div>
          </div>
        )}

        {/* 스� 3: 완료 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-8">
              <p className="text-6xl mb-4">✨</p>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                준비 완료!
              </h2>
              <p className="text-base text-muted-foreground mb-4">
                이제 자비경을 연구할 준비가 되었습니다.
              </p>
              <Button onClick={() => router.push('/')} size="lg" className="w-full text-lg py-6">
                경전 보기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
