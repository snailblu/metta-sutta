import { test, expect } from "@playwright/test";

// 프로덕션 대상 E2E — 실제 API 호출 검증
// 로컬에서: npx playwright test --project=production
test.describe.configure({ mode: "serial", timeout: 120_000 });

/**
 * 온보딩을 스킵하도록 localStorage를 설정합니다.
 * 반드시 이미 페이지가 로드된 상태에서 호출해야 합니다.
 */
async function skipOnboarding(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    localStorage.setItem(
      "metta-sutta-settings",
      JSON.stringify({
        fontSize: "large",
        theme: "light",
        defaultView: "both",
        lastPosition: null,
        onboardingCompleted: true,
      })
    );
  });
}

test.describe("경전 분석 API (Production)", () => {
  test("sutta-analyze: 구절 분석 후 결과 표시", async ({ page }) => {
    // 1. 실제 경전 페이지로 이동 — /suttas/[nikaya]/[uid]
    //    sn1.1 (Oghataraṇasutta) = 구절이 3개 그룹으로 나뉘고 각 그룹에 SegmentAnalysis 렌더링
    await page.goto("/suttas/sn/sn1.1");

    // 온보딩 스킵 설정 후 리로드
    await skipOnboarding(page);
    await page.reload();

    // 2. 페이지 로드 대기 — sutta title(h1)이 보이면 렌더링 완료
    await expect(page.locator("h1")).toBeVisible({ timeout: 15_000 });

    // 3. SegmentAnalysis의 구절 버튼 타겟
    //    상단 네비게이션 링크가 아닌, 빨리어 원문 텍스트를 담은 <button>만 필터링
    //    sn1.1의 그룹 3에는 구절이 4개뿐이라 API 응답이 빠름
    const segmentButtons = page.locator("button").filter({
      has: page.locator("p"),
    });
    const lastGroupButton = segmentButtons.nth(-1);
    await expect(lastGroupButton).toBeVisible({ timeout: 10_000 });
    await lastGroupButton.click();

    // 4. 로딩 상태 확인: "도반이 구절을 살펴보는 중..."
    await expect(
      page.locator("text=도반이 구절을 살펴보는 중...")
    ).toBeVisible({ timeout: 10_000 });

    // 5. 분석 결과 표시 대기 (최대 90초 — 실제 AI API 호출)
    //    SegmentAnalysis 결과의 "📜 번역" 섹션 h4가 하나라도 보이면 성공
    const resultHeading = page.getByRole("heading", { name: /번역/ }).first();
    await expect(resultHeading).toBeVisible({ timeout: 90_000 });

    // 6. 에러 메시지가 표시되지 않아야 함
    await expect(page.locator("text=분석 중 오류")).not.toBeVisible();
    await expect(
      page.locator("text=분석 시간이 초과되었습니다")
    ).not.toBeVisible();
  });
});

test.describe("번역기 API (Production)", () => {
  test.beforeEach(async ({ page }) => {
    // beforeEach에서 page.evaluate()를 호출하려면 먼저 페이지를 로드해야 함
    await page.goto("/offline");
    await skipOnboarding(page);
  });

  test("translate: 입력 후 분석 결과 표시", async ({ page }) => {
    await page.goto("/translator");

    // textarea#pali-input이 보여야 함
    const textarea = page.locator("textarea#pali-input");
    await expect(textarea).toBeVisible({ timeout: 15_000 });

    // 분석 시작 버튼 클릭 → MettaTranslator의 submit() 호출
    await page.click('button:has-text("분석 시작")');

    // 로딩 상태: 버튼 텍스트가 "⏳ 분석 중..."으로 변경됨
    await expect(page.locator("text=분석 중...")).toBeVisible({ timeout: 10_000 });

    // 번역 결과 표시 대기 (최대 90초) — "📜 번역" h3가 보이면 성공
    await expect(
      page.getByRole("heading", { name: /번역/ })
    ).toBeVisible({ timeout: 90_000 });

    // 에러 팝업이 나타나지 않아야 함
    await expect(page.locator("text=분석 오류")).not.toBeVisible();
  });
});
