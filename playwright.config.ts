import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    // 의존성 체크 스킵 (헤드리스 환경에서는 필요 없음)
    launchOptions: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  },

  webServer: [
    {
      command: "npx next dev --port 3000",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],

  projects: [
    // 로컬 대상 (기존 UI 테스트)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /^(?!.*api-e2e\.spec\.ts).*\.spec\.ts$/,
    },
    // 프로덕션 대상 (실제 API 호출 E2E)
    {
      name: "production",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://metta-sutta.vercel.app",
      },
      testMatch: "**/api-e2e.spec.ts",
    },
  ],
});
