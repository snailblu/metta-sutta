'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings, getFontSizeClass } from '@/store/settings';
import { ArrowLeft, Check } from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { 
    fontSize, 
    theme, 
    defaultView, 
    translationVersion,
    setFontSize, 
    setTheme, 
    setDefaultView,
    setTranslationVersion 
  } = useSettings();

  const fontPreviewClass = getFontSizeClass(fontSize);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // 테마 적용
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [mounted, theme]);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4">
        <Button variant="ghost" asChild className="flex items-center gap-2">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" /> 홈
          </Link>
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
              {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                <Button
                  key={size}
                  variant={fontSize === size ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setFontSize(size)}
                >
                  {size === 'small' && '작게'}
                  {size === 'medium' && '보통'}
                  {size === 'large' && '크게'}
                  {size === 'xlarge' && '아주 크게'}
                  {fontSize === size && <Check className="ml-auto w-4 h-4" />}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 미리보기 */}
          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <p className={`${fontPreviewClass} text-primary`}>
                  Karaṇīyam attha-kusalena
                </p>
                <p className={`${fontPreviewClass} text-foreground`}>
                  선을 행하는 데 능숙한 자가
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 테마 */}
          <Card>
            <CardHeader>
              <CardTitle>테마</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['light', 'dark'] as const).map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setTheme(t)}
                >
                  {t === 'light' ? '밝은 모드' : '어두운 모드'}
                  {theme === t && <Check className="ml-auto w-4 h-4" />}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 기본 표시 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 표시</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['pali', 'korean', 'both'] as const).map((view) => (
                <Button
                  key={view}
                  variant={defaultView === view ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setDefaultView(view)}
                >
                  {view === 'pali' && '팔리어만'}
                  {view === 'korean' && '번역만'}
                  {view === 'both' && '둘 다'}
                  {defaultView === view && <Check className="ml-auto w-4 h-4" />}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 번역 버전 */}
          <Card>
            <CardHeader>
              <CardTitle>번역 버전</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['default', 'daelim', 'mahavihara'] as const).map((version) => (
                <Button
                  key={version}
                  variant={translationVersion === version ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setTranslationVersion(version)}
                >
                  {version === 'default' && '표준 번역'}
                  {version === 'daelim' && '대림스님 번역'}
                  {version === 'mahavihara' && '마하위하라 번역'}
                  {translationVersion === version && <Check className="ml-auto w-4 h-4" />}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
