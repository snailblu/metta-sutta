import { test, expect } from '@playwright/test';

test.describe('메타 숫타 앱 - 온보딩', () => {
  test('온보딩 플로우 완료', async ({ page }) => {
    await page.goto('/');
    
    // 온보딩 시작 화면
    await expect(page.locator('h1')).toContainText('환영합니다');
    await expect(page.locator('button', { hasText: '시작하기' })).toBeVisible();
    
    // 시작하기 클릭
    await page.click('button:has-text("시작하기")');
    
    // 글자 크기 선택 화면
    await expect(page.locator('h1')).toContainText('글자 크기');
    await expect(page.locator('button', { hasText: '크게' })).toBeVisible();
    
    // 크게 선택
    await page.click('button:has-text("크게")');
    
    // 다음 클릭
    await page.click('button:has-text("다음")');
    
    // 완료 화면
    await expect(page.locator('h1')).toContainText('준비 완료!');
    await page.click('button:has-text("경전 보기")');
    
    // 경전 페이지로 이동 확인
    await expect(page).toHaveURL(/\/sutta\/v\d/);
  });
});

test.describe('메타 숫타 앱 - 경전 뷰어', () => {
  test.beforeEach(async ({ page }) => {
    // 온보딩 스킵 - localStorage에 설정 저장
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('metta-sutta-settings', JSON.stringify({
        fontSize: 'large',
        theme: 'light',
        defaultView: 'both',
        lastPosition: null,
        onboardingCompleted: true
      }));
    });
    await page.reload();
  });

  test('홈 페이지에서 경전 시작', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('자비경 연구');
    await page.click('button:has-text("경전 보기")');
    await expect(page).toHaveURL('/sutta/v1');
  });

  test('경전 페이지 - 원문과 번역 표시', async ({ page }) => {
    await page.goto('/sutta/v1');
    
    // 게송 번호
    await expect(page.locator('text=/제 \\d+ 게송/')).toBeVisible();
    
    // 팔리어 원문
    await expect(page.locator('text=Karaṇīyam')).toBeVisible();
    
    // 한국어 번역
    await expect(page.locator('text=선을 행하는 데 능숙한 자가')).toBeVisible();
    
    // 구절 목록
    await expect(page.locator('text=단어 분석')).toBeVisible();
  });

  test('다음/이전 게송 네비게이션', async ({ page }) => {
    await page.goto('/sutta/v1');
    
    // 다음 버튼
    const nextButton = page.locator('button:has-text("다음 →")');
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
    await expect(page).toHaveURL('/sutta/v2');
    
    // 이전 버튼
    const prevButton = page.locator('button:has-text("← 이전")');
    await expect(prevButton).toBeEnabled();
    await prevButton.click();
    await expect(page).toHaveURL('/sutta/v1');
  });

  test('진도 바 표시', async ({ page }) => {
    await page.goto('/sutta/v5');
    
    // 진도 바
    const progressBar = page.locator('.bg-primary').first();
    await expect(progressBar).toBeVisible();
  });
});

test.describe('메타 숫타 앱 - 구절 상세', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('metta-sutta-settings', JSON.stringify({
        fontSize: 'large',
        theme: 'light',
        defaultView: 'both',
        lastPosition: null,
        onboardingCompleted: true
      }));
    });
    await page.reload();
  });

  test('구절 클릭 시 상세 페이지 이동', async ({ page }) => {
    await page.goto('/sutta/v1');
    
    // 첫 번째 구절 버튼 클릭
    await page.click('button:has-text("Karaṇīyam")');
    
    // 구절 상세 페이지 확인
    await expect(page).toHaveURL(/\/phrase\/p\d-/);
    await expect(page.locator('text=단어 분석')).toBeVisible();
  });

  test('구절 페이지에서 메모 추가', async ({ page }) => {
    await page.goto('/sutta/v1');
    await page.click('button:has-text("Karaṇīyam")');
    
    // 메모 추가 버튼
    await page.click('button:has-text("+ 추가")');
    
    // 메모 에디터 표시
    await expect(page.locator('textarea')).toBeVisible();
    
    // 메모 입력
    await page.fill('textarea', '테스트 메모입니다.');
    
    // 저장
    await page.click('button:has-text("저장")');
    
    // 메모 표시 확인
    await expect(page.locator('text=테스트 메모입니다.')).toBeVisible();
  });

  test('단어 클릭 시 단어 상세 페이지 이동', async ({ page }) => {
    await page.goto('/sutta/v5');
    await page.click('button:has-text("Sukhino")');
    
    // 단어 상세 페이지 확인
    await expect(page).toHaveURL(/\/word\/w-\w+/);
    await expect(page.locator('text=사전적 의미')).toBeVisible();
  });
});

test.describe('메타 숫타 앱 - 단어 상세', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('metta-sutta-settings', JSON.stringify({
        fontSize: 'large',
        theme: 'light',
        defaultView: 'both',
        lastPosition: null,
        onboardingCompleted: true
      }));
    });
    await page.reload();
  });

  test('단어 상세 정보 표시', async ({ page }) => {
    await page.goto('/sutta/v5');
    await page.click('button:has-text("Sukhino")');
    
    // 단어 제목
    await expect(page.locator('h1')).toBeVisible();
    
    // 기본 정보
    await expect(page.locator('text=품사')).toBeVisible();
    await expect(page.locator('text=어근')).toBeVisible();
    
    // 사전적 의미
    await expect(page.locator('text=사전적 의미')).toBeVisible();
    
    // 관련 용어
    await expect(page.locator('text=관련 용어')).toBeVisible();
  });

  test('단어 페이지에서 메모 추가', async ({ page }) => {
    await page.goto('/sutta/v5');
    await page.click('button:has-text("Sukhino")');
    
    // 메모 추가
    await page.click('button:has-text("+ 추가")');
    await page.fill('textarea', '단어 메모 테스트');
    await page.click('button:has-text("저장")');
    
    // 메모 확인
    await expect(page.locator('text=단어 메모 테스트')).toBeVisible();
  });
});

test.describe('메타 숫타 앱 - 설정', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('metta-sutta-settings', JSON.stringify({
        fontSize: 'large',
        theme: 'light',
        defaultView: 'both',
        lastPosition: null,
        onboardingCompleted: true
      }));
    });
    await page.reload();
  });

  test('설정 페이지 접근', async ({ page }) => {
    await page.click('button:has-text("설정")');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1')).toContainText('설정');
  });

  test('글자 크기 변경', async ({ page }) => {
    await page.goto('/settings');
    
    // 아주 크게 선택
    await page.click('button:has-text("아주 크게")');
    
    // 미리보기 확인
    const preview = page.locator('.bg-muted\\/30').first();
    await expect(preview).toContainText('Karaṇīyam attha-kusalena');
  });

  test('테마 변경', async ({ page }) => {
    await page.goto('/settings');
    
    // 어두운 모드 선택
    await page.click('button:has-text("어두운 모드")');
    
    // 다크 테마 적용 확인 (html 태그에 dark 클래스 확인)
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('기본 표시 변경', async ({ page }) => {
    await page.goto('/settings');
    
    // 팔리어만 선택
    await page.click('button:has-text("팔리어만")');
    
    // 설정 페이지 새로고침 후 확인
    await page.reload();
    await expect(page.locator('button:has-text("팔리어만")')).toBeVisible();
  });
});

test.describe('메타 숫타 앱 - 반응형', () => {
  test('모바일 화면에서 경전 보기', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('metta-sutta-settings', JSON.stringify({
        fontSize: 'large',
        theme: 'light',
        defaultView: 'both',
        lastPosition: null,
        onboardingCompleted: true
      }));
    });
    await page.reload();
    
    await page.click('button:has-text("경전 보기")');
    
    // 모바일에서도 내용이 표시되는지 확인
    await expect(page.locator('text=Karaṇīyam')).toBeVisible();
  });

  test('데스크톱 화면에서 경전 보기', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('metta-sutta-settings', JSON.stringify({
        fontSize: 'large',
        theme: 'light',
        defaultView: 'both',
        lastPosition: null,
        onboardingCompleted: true
      }));
    });
    await page.reload();
    
    await page.click('button:has-text("경전 보기")');
    
    // 데스크톱에서도 내용이 표시되는지 확인
    await expect(page.locator('text=Karaṇīyam')).toBeVisible();
  });
});
