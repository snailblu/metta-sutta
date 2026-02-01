import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
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
            <li>• AI 문맥 해석</li>
            <li>• 개인 메모</li>
          </ul>
        </div>

        {/* 시작 버튼 */}
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/sutta/v1">
            경전 보기
          </Link>
        </Button>

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
