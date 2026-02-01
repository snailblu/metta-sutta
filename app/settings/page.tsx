import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SettingsPage() {
  // TODO: useSettings 훅에서 현재 설정 가져오기
  const currentFontSize = 'large';
  const currentTheme = 'light';

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4">
        <Button variant="ghost" asChild>
          <Link href="/">← 홈</Link>
        </Button>
      </header>

      <main className="p-4">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-foreground">설정</h1>

          {/* 글자 크기 */}
          <Card>
            <CardHeader>
              <CardTitle>글자 크기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                <Button
                  key={size}
                  variant={currentFontSize === size ? 'default' : 'outline'}
                  className="w-full justify-start"
                  // onClick={() => updateFontSize(size)}
                >
                  {size === 'small' && '작게'}
                  {size === 'medium' && '보통'}
                  {size === 'large' && '크게'}
                  {size === 'xlarge' && '아주 크게'}
                  {currentFontSize === size && ' ✓'}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 테마 */}
          <Card>
            <CardHeader>
              <CardTitle>테마</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant={currentTheme === 'light' ? 'default' : 'outline'}
                className="w-full justify-start"
                // onClick={() => updateTheme('light')}
              >
                밝은 모드
                {currentTheme === 'light' && ' ✓'}
              </Button>
              <Button
                variant={currentTheme === 'dark' ? 'default' : 'outline'}
                className="w-full justify-start"
                // onClick={() => updateTheme('dark')}
              >
                어두운 모드
                {currentTheme === 'dark' && ' ✓'}
              </Button>
            </CardContent>
          </Card>

          {/* 기본 표시 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 표시</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                팔리어만
              </Button>
              <Button variant="outline" className="w-full justify-start">
                번역만
              </Button>
              <Button variant="outline" className="w-full justify-start">
                둘 다
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
